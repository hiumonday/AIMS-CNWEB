package com.ecommerce.aims.order.services;

import com.ecommerce.aims.cart.services.CartService;
import com.ecommerce.aims.common.dto.PageResponse;
import com.ecommerce.aims.common.exception.BusinessException;
import com.ecommerce.aims.common.exception.NotFoundException;
import com.ecommerce.aims.common.exception.OutOfStockException;
import com.ecommerce.aims.order.dto.CreateOrderRequest;
import com.ecommerce.aims.order.dto.OrderResponse;
import com.ecommerce.aims.order.models.DeliveryInfo;
import com.ecommerce.aims.order.models.Invoice;
import com.ecommerce.aims.order.models.Order;
import com.ecommerce.aims.order.models.OrderItem;
import com.ecommerce.aims.order.models.OrderStatus;
import com.ecommerce.aims.order.repository.OrderRepository;
import com.ecommerce.aims.payment.models.PaymentStatus;
import com.ecommerce.aims.payment.models.PaymentTransaction;
import com.ecommerce.aims.payment.repository.IPaymentTransactionRepository;
import com.ecommerce.aims.product.models.Product;
import com.ecommerce.aims.product.models.ProductStatus;
import com.ecommerce.aims.product.repository.ProductRepository;
import com.ecommerce.aims.product.services.StockService;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final IPaymentTransactionRepository paymentTransactionRepository;
    private final StockService stockService;
    private final CartService cartService;

    @Transactional
    public OrderResponse createOrder(CreateOrderRequest request) {
        Objects.requireNonNull(request, "request must not be null");
        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new BusinessException("Order items must not be empty");
        }

        // Prevent duplicate orders from same cart
        if (request.getCartSessionKey() != null) {
            cartService.markAsCheckedOut(request.getCartSessionKey());
        }

        List<Long> productIds = request.getItems().stream()
                .map(line -> Objects.requireNonNull(line.getProductId(), "productId must not be null"))
                .distinct()
                .sorted()
                .collect(Collectors.toList());

        List<Product> lockedProducts = productRepository.findAllByIdInForUpdate(productIds);
        Map<Long, Product> productMap = lockedProducts.stream()
                .collect(Collectors.toMap(Product::getId, p -> p));

        Map<Long, Integer> totalQuantityByProduct = new HashMap<>();
        for (var line : request.getItems()) {
            Long productId = line.getProductId();
            totalQuantityByProduct.merge(productId, line.getQuantity(), Integer::sum);
        }

        for (var entry : totalQuantityByProduct.entrySet()) {
            Long productId = entry.getKey();
            Integer requestedQuantity = entry.getValue();
            Product product = productMap.get(productId);

            if (product == null) {
                throw new NotFoundException("Product not found: " + productId);
            }
            if (product.getStatus() == ProductStatus.DEACTIVATED) {
                throw new BusinessException("Product is deactivated: " + product.getTitle());
            }
            int availableStock = product.getStock() == null ? 0 : product.getStock();
            if (availableStock < requestedQuantity) {
                throw new OutOfStockException(product.getTitle(), productId, requestedQuantity, availableStock);
            }
        }

        for (var entry : totalQuantityByProduct.entrySet()) {
            Long productId = entry.getKey();
            Integer quantity = entry.getValue();
            Product product = productMap.get(productId);
            int currentStock = product.getStock() == null ? 0 : product.getStock();
            product.setStock(currentStock - quantity);
        }

        Order order = new Order();
        order.setStatus(OrderStatus.PENDING_PROCESSING);
        order.setCustomerEmail(request.getCustomerEmail());
        order.setCustomerName(request.getCustomerName());
        order.setCartSessionKey(request.getCartSessionKey());
        order.setDeliveryInfo(DeliveryInfo.builder()
                .recipientName(request.getCustomerName())
                .phone(request.getPhone())
                .addressLine(request.getAddressLine())
                .city(request.getCity())
                .province(request.getProvince())
                .postalCode(request.getPostalCode())
                .build());

        request.getItems().forEach(line -> {
            Product product = productMap.get(line.getProductId());
            OrderItem item = new OrderItem();
            item.setOrder(order);
            item.setProductId(line.getProductId());
            item.setProductTitle(product.getTitle());
            item.setQuantity(line.getQuantity());
            BigDecimal price = product.getCurrentPrice() != null ? product.getCurrentPrice() : line.getPrice();
            item.setPrice(price);
            if (price != null && line.getQuantity() != null) {
                item.setTotalPrice(price.multiply(BigDecimal.valueOf(line.getQuantity())));
            }
            order.getItems().add(item);
        });
        BigDecimal totalBeforeVat = order.getItems().stream()
                .map(i -> i.getTotalPrice() == null ? BigDecimal.ZERO : i.getTotalPrice())
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        order.setTotalBeforeVat(totalBeforeVat);

        BigDecimal totalWeight = request.getItems().stream()
                .map(line -> {
                    Product product = productMap.get(line.getProductId());
                    BigDecimal weight = product.getWeight() == null ? BigDecimal.ZERO : product.getWeight();
                    return weight.multiply(BigDecimal.valueOf(line.getQuantity()));
                })
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal shippingFee = calculateShippingFee(totalWeight, totalBeforeVat, request.getProvince());
        order.setShippingFee(shippingFee);
        BigDecimal vatAmount = totalBeforeVat.multiply(new BigDecimal("0.10"));
        BigDecimal totalWithVat = totalBeforeVat.add(vatAmount)
                .add(order.getShippingFee() == null ? BigDecimal.ZERO : order.getShippingFee());
        order.setTotalWithVat(totalWithVat);

        Invoice invoice = Invoice.builder()
                .order(order)
                .totalBeforeVat(totalBeforeVat)
                .vatAmount(vatAmount)
                .shippingFee(order.getShippingFee())
                .totalWithVat(totalWithVat)
                .build();
        order.setInvoice(invoice);

        Order saved = orderRepository.save(order);

        PaymentTransaction transaction = PaymentTransaction.builder()
                .orderId(saved.getId())
                .status(PaymentStatus.INIT)
                .amount(saved.getTotalWithVat())
                .currency("VND")
                .build();
        PaymentTransaction savedTransaction = paymentTransactionRepository.save(transaction);

        return toResponse(saved, savedTransaction);
    }

    public OrderResponse getOrder(Long id) {
        Long requiredId = Objects.requireNonNull(id, "id must not be null");
        Order order = orderRepository.findById(requiredId)
                .orElseThrow(() -> new NotFoundException("Order not found"));
        PaymentTransaction transaction = paymentTransactionRepository.findByOrderId(order.getId()).orElse(null);
        return toResponse(order, transaction);
    }

    @Transactional
    public OrderResponse cancelOrder(Long id) {
        Long requiredId = Objects.requireNonNull(id, "id must not be null");
        Order order = orderRepository.findById(requiredId)
                .orElseThrow(() -> new NotFoundException("Order not found"));
        if (order.getStatus() != OrderStatus.PENDING_PROCESSING && order.getStatus() != OrderStatus.PAID) {
            throw new BusinessException("Order cannot be cancelled at this stage");
        }

        stockService.restoreStockWithLocking(order.getItems());

        order.setStatus(OrderStatus.CANCELLED);
        Order saved = orderRepository.save(order);

        // Update payment transaction status to FAILED when order is cancelled
        PaymentTransaction transaction = paymentTransactionRepository.findByOrderId(saved.getId()).orElse(null);
        if (transaction != null && transaction.getStatus() != PaymentStatus.CAPTURED
                && transaction.getStatus() != PaymentStatus.REFUNDED) {
            transaction.setStatus(PaymentStatus.FAILED);
            paymentTransactionRepository.save(transaction);
        }

        return toResponse(saved, transaction);
    }

    public PageResponse<OrderResponse> listOrders(int page, int size) {
        Page<Order> pageResult = orderRepository.findAll(PageRequest.of(page, size));
        return PageResponse.<OrderResponse>builder()
                .items(pageResult.map(this::toResponse).getContent())
                .page(pageResult.getNumber())
                .size(pageResult.getSize())
                .totalElements(pageResult.getTotalElements())
                .totalPages(pageResult.getTotalPages())
                .build();
    }

    private OrderResponse toResponse(Order order) {
        PaymentTransaction transaction = paymentTransactionRepository.findByOrderId(order.getId()).orElse(null);
        return toResponse(order, transaction);
    }

    private OrderResponse toResponse(Order order, PaymentTransaction transaction) {
        Order requiredOrder = Objects.requireNonNull(order, "order must not be null");
        return OrderResponse.builder()
                .id(requiredOrder.getId())
                .status(requiredOrder.getStatus())
                .customerEmail(requiredOrder.getCustomerEmail())
                .customerName(requiredOrder.getCustomerName())
                .deliveryInfo(requiredOrder.getDeliveryInfo())
                .shippingFee(requiredOrder.getShippingFee())
                .totalBeforeVat(requiredOrder.getTotalBeforeVat())
                .totalWithVat(requiredOrder.getTotalWithVat())
                .createdAt(requiredOrder.getCreatedAt())
                .items(requiredOrder.getItems().stream()
                        .map(item -> OrderResponse.OrderLine.builder()
                                .productId(item.getProductId())
                                .productTitle(item.getProductTitle())
                                .quantity(item.getQuantity())
                                .price(item.getPrice())
                                .totalPrice(item.getTotalPrice())
                                .build())
                        .collect(Collectors.toList()))
                .paymentTransactionId(transaction != null ? transaction.getId() : null)
                .paymentStatus(transaction != null ? transaction.getStatus() : null)
                .build();
    }

    private BigDecimal calculateShippingFee(BigDecimal totalWeight, BigDecimal totalProductPrice, String province) {
        BigDecimal weight = totalWeight == null || totalWeight.signum() < 0 ? BigDecimal.ZERO : totalWeight;
        boolean bigCity = province != null
                && province.trim().toLowerCase().matches(".*(ha noi|hanoi|ho chi minh|hochiminh|hcm).*");
        BigDecimal baseWeight = bigCity ? new BigDecimal("3.0") : new BigDecimal("0.5");
        BigDecimal basePrice = bigCity ? new BigDecimal("22000") : new BigDecimal("30000");
        BigDecimal result = basePrice;

        BigDecimal extraWeight = weight.subtract(baseWeight);
        if (extraWeight.compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal steps = extraWeight.divide(new BigDecimal("0.5"), 0, RoundingMode.UP);
            result = result.add(steps.multiply(new BigDecimal("2500")));
        }

        if (totalProductPrice != null && totalProductPrice.compareTo(new BigDecimal("100000")) > 0) {
            BigDecimal discount = result.min(new BigDecimal("25000"));
            result = result.subtract(discount);
        }
        if (result.compareTo(BigDecimal.ZERO) < 0) {
            result = BigDecimal.ZERO;
        }
        return result.setScale(0, RoundingMode.HALF_UP);
    }
}
