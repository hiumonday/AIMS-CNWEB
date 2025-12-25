package com.ecommerce.aims.order.services;

import com.ecommerce.aims.common.exception.NotFoundException;
import com.ecommerce.aims.order.models.Order;
import com.ecommerce.aims.order.models.OrderStatus;
import com.ecommerce.aims.order.repository.OrderRepository;
import com.ecommerce.aims.product.services.StockService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class OrderPaymentService {

    private final OrderRepository orderRepository;
    private final StockService stockService;

    @Transactional
    public void handlePaymentCaptured(Long orderId) {
        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new NotFoundException("Order not found"));
        
        if (order.getStatus() == OrderStatus.PENDING_PROCESSING) {
            order.setStatus(OrderStatus.PAID);
            orderRepository.save(order);
        }
    }

    @Transactional
    public void handlePaymentTimeout(Long orderId) {
        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new NotFoundException("Order not found"));
        
        if (order.getStatus() == OrderStatus.PENDING_PROCESSING) {
            order.setStatus(OrderStatus.CANCELLED);
            stockService.restoreStock(order.getItems());
            orderRepository.save(order);
        }
    }

    @Transactional
    public void handleUserCancelledPayment(Long orderId) {
        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new NotFoundException("Order not found"));
        
        if (order.getStatus() == OrderStatus.PENDING_PROCESSING) {
            order.setStatus(OrderStatus.CANCELLED);
            stockService.restoreStock(order.getItems());
            orderRepository.save(order);
        }
    }
}
