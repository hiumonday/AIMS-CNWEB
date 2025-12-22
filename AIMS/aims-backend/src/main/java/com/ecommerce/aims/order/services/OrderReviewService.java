package com.ecommerce.aims.order.services;

import com.ecommerce.aims.common.dto.PageResponse;
import com.ecommerce.aims.common.exception.BusinessException;
import com.ecommerce.aims.common.exception.NotFoundException;
import com.ecommerce.aims.notification.models.EmailTemplateType;
import com.ecommerce.aims.notification.services.EmailNotificationService;
import com.ecommerce.aims.order.dto.OrderSummaryResponse;
import com.ecommerce.aims.order.models.Order;
import com.ecommerce.aims.order.models.OrderStatus;
import com.ecommerce.aims.order.repository.OrderRepository;
import java.util.Objects;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class OrderReviewService {

    private final OrderRepository orderRepository;
    private final EmailNotificationService emailNotificationService;

    public PageResponse<OrderSummaryResponse> listPending(int page, int size) {
        Page<Order> pending = orderRepository.findByStatus(OrderStatus.PENDING_PROCESSING, PageRequest.of(page, size));
        return PageResponse.<OrderSummaryResponse>builder()
            .items(pending.map(this::toSummary).getContent())
            .page(pending.getNumber())
            .size(pending.getSize())
            .totalElements(pending.getTotalElements())
            .totalPages(pending.getTotalPages())
            .build();
    }

    @Transactional
    public OrderSummaryResponse approve(Long orderId) {
        Long id = Objects.requireNonNull(orderId, "orderId must not be null");
        Order order = orderRepository.findById(id)
            .orElseThrow(() -> new NotFoundException("Order not found"));
        if (order.getStatus() != OrderStatus.PENDING_PROCESSING) {
            throw new BusinessException("Only pending orders can be approved");
        }
        order.setStatus(OrderStatus.APPROVED);
        Order saved = orderRepository.save(order);
        if (saved.getCustomerEmail() != null) {
            emailNotificationService.sendEmail(saved.getCustomerEmail(), "Order approved", "Your order has been approved.", EmailTemplateType.ORDER_CONFIRMATION);
        }
        return toSummary(saved);
    }

    @Transactional
    public OrderSummaryResponse reject(Long orderId, String reason) {
        Long id = Objects.requireNonNull(orderId, "orderId must not be null");
        Order order = orderRepository.findById(id)
            .orElseThrow(() -> new NotFoundException("Order not found"));
        if (order.getStatus() != OrderStatus.PENDING_PROCESSING) {
            throw new BusinessException("Only pending orders can be rejected");
        }
        order.setStatus(OrderStatus.REJECTED);
        Order saved = orderRepository.save(order);
        if (saved.getCustomerEmail() != null) {
            emailNotificationService.sendEmail(saved.getCustomerEmail(), "Order rejected", reason != null ? reason : "Order rejected", EmailTemplateType.ORDER_REJECTED);
        }
        return toSummary(saved);
    }

    private OrderSummaryResponse toSummary(Order order) {
        Order requiredOrder = java.util.Objects.requireNonNull(order, "order must not be null");
        return OrderSummaryResponse.builder()
            .id(requiredOrder.getId())
            .status(requiredOrder.getStatus())
            .customerName(requiredOrder.getCustomerName())
            .customerEmail(requiredOrder.getCustomerEmail())
            .totalWithVat(requiredOrder.getTotalWithVat())
            .createdAt(requiredOrder.getCreatedAt())
            .build();
    }
}
