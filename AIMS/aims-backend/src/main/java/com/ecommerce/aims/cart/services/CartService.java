package com.ecommerce.aims.cart.services;

import com.ecommerce.aims.cart.dto.AddToCartRequest;
import com.ecommerce.aims.cart.dto.CartResponse;
import com.ecommerce.aims.cart.dto.UpdateCartItemRequest;
import com.ecommerce.aims.cart.models.Cart;
import com.ecommerce.aims.cart.models.CartItem;
import com.ecommerce.aims.cart.repository.CartRepository;
import com.ecommerce.aims.common.exception.BusinessException;
import com.ecommerce.aims.common.exception.NotFoundException;
import com.ecommerce.aims.common.util.MoneyUtils;
import com.ecommerce.aims.product.models.Product;
import com.ecommerce.aims.product.models.ProductStatus;
import com.ecommerce.aims.product.repository.ProductRepository;
import java.math.BigDecimal;
import java.util.Objects;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.lang.Nullable;

@Service
@RequiredArgsConstructor
public class CartService {

    private final CartRepository cartRepository;
    private final ProductRepository productRepository;

    public CartResponse getCart(String sessionKey) {
        Cart cart = resolveCart(sessionKey);
        return toResponse(cart);
    }

    @Transactional
    public CartResponse addToCart(String sessionKey, AddToCartRequest request) {
        Objects.requireNonNull(request, "request must not be null");
        Long productId = Objects.requireNonNull(request.getProductId(), "productId must not be null");
        Integer quantity = Objects.requireNonNull(request.getQuantity(), "quantity must not be null");
        Cart cart = resolveCart(sessionKey);
        Product product = productRepository.findById(productId)
            .orElseThrow(() -> new NotFoundException("Product not found"));
        if (product.getStatus() == ProductStatus.DEACTIVATED) {
            throw new BusinessException("Product is not available");
        }
        ensureStockAvailable(product, quantity);
        Optional<CartItem> existing = cart.getItems().stream()
            .filter(item -> item.getProductId().equals(productId))
            .findFirst();
        CartItem item = existing.orElseGet(() -> {
            CartItem created = new CartItem();
            created.setCart(cart);
            created.setProductId(productId);
            cart.getItems().add(created);
            return created;
        });
        item.setQuantity(quantity);
        BigDecimal price = Optional.ofNullable(product.getCurrentPrice()).orElse(request.getPrice());
        if (price == null) {
            throw new BusinessException("Price must be provided when product has no current price");
        }
        item.setPrice(price);
        item.setTotalPrice(price.multiply(BigDecimal.valueOf(item.getQuantity())));
        cartRepository.save(cart);
        return toResponse(cart);
    }

    @Transactional
    public CartResponse updateItem(String sessionKey, UpdateCartItemRequest request) {
        Objects.requireNonNull(request, "request must not be null");
        Long productId = Objects.requireNonNull(request.getProductId(), "productId must not be null");
        Cart cart = resolveCart(sessionKey);
        Product product = productRepository.findById(productId)
            .orElseThrow(() -> new NotFoundException("Product not found"));
        cart.getItems().stream()
            .filter(item -> item.getProductId().equals(productId))
            .findFirst()
            .ifPresent(item -> {
                if (request.getQuantity() != null) {
                    ensureStockAvailable(product, request.getQuantity());
                    item.setQuantity(request.getQuantity());
                }
                BigDecimal price = Optional.ofNullable(request.getPrice()).orElse(product.getCurrentPrice());
                if (price != null) {
                    item.setPrice(price);
                }
                if (item.getPrice() != null && item.getQuantity() != null) {
                    item.setTotalPrice(item.getPrice().multiply(BigDecimal.valueOf(item.getQuantity())));
                }
            });
        cartRepository.save(cart);
        return toResponse(cart);
    }

    @Transactional
    public CartResponse removeItem(String sessionKey, Long productId) {
        Long id = Objects.requireNonNull(productId, "productId must not be null");
        Cart cart = resolveCart(sessionKey);
        cart.getItems().removeIf(item -> item.getProductId().equals(id));
        cartRepository.save(cart);
        return toResponse(cart);
    }

    private void ensureStockAvailable(Product product, int requestedQuantity) {
        Integer stock = Optional.ofNullable(product.getStock()).orElse(0);
        if (requestedQuantity > stock) {
            int shortage = requestedQuantity - stock;
            throw new BusinessException("Insufficient stock. Shortage: " + shortage);
        }
    }

    private Cart resolveCart(@Nullable String sessionKey) {
        String key = sessionKey != null ? sessionKey : UUID.randomUUID().toString();
        return cartRepository.findBySessionKey(key)
            .orElseGet(() -> cartRepository.save(Cart.builder().sessionKey(key).build()));
    }

    private CartResponse toResponse(Cart cart) {
        Cart nonNullCart = Objects.requireNonNull(cart, "cart must not be null");
        BigDecimal total = nonNullCart.getItems().stream()
            .map(item -> Optional.ofNullable(item.getTotalPrice()).orElse(BigDecimal.ZERO))
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalWithVat = MoneyUtils.applyVat(total);
        return CartResponse.builder()
            .cartId(nonNullCart.getId())
            .sessionKey(nonNullCart.getSessionKey())
            .items(nonNullCart.getItems().stream()
                .map(item -> CartResponse.CartLine.builder()
                    .productId(item.getProductId())
                    .quantity(item.getQuantity())
                    .price(item.getPrice())
                    .totalPrice(item.getTotalPrice())
                    .build())
                .collect(Collectors.toList()))
            .totalBeforeVat(total)
            .totalWithVat(totalWithVat)
            .build();
    }
}
