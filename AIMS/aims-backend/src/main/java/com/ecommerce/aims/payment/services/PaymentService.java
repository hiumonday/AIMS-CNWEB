package com.ecommerce.aims.payment.services;

import com.ecommerce.aims.common.exception.NotFoundException;
import com.ecommerce.aims.notification.services.EmailNotificationService;
import com.ecommerce.aims.order.models.Order;
import com.ecommerce.aims.order.models.OrderStatus;
import com.ecommerce.aims.order.repository.OrderRepository;
import com.ecommerce.aims.common.exception.BusinessException;
import com.ecommerce.aims.payment.dto.CreatePaymentRequest;
import com.ecommerce.aims.payment.dto.PaymentResultResponse;
import com.ecommerce.aims.payment.models.PaymentProvider;
import com.ecommerce.aims.payment.models.PaymentStatus;
import com.ecommerce.aims.payment.models.PaymentTransaction;
import com.ecommerce.aims.payment.repository.PaymentTransactionRepository;
import java.util.Objects;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class PaymentService {

    // SOLID: This service coordinates transaction creation, provider dispatch, and order state updates.
    // Consider splitting orchestration vs. order updates if/when refactoring.
    private final PaymentTransactionRepository paymentTransactionRepository;
    private final PayPalService payPalService;
    private final VietQRService vietQRService;
    private final OrderRepository orderRepository;
    private final EmailNotificationService emailNotificationService;

    @Transactional
    public PaymentResultResponse createPayment(CreatePaymentRequest request) {
        Objects.requireNonNull(request, "request must not be null");
        Long orderId = Objects.requireNonNull(request.getOrderId(), "orderId must not be null");
        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new NotFoundException("Order not found"));
        if (request.getAmount() == null) {
            request.setAmount(order.getTotalWithVat());
        }
        PaymentTransaction transaction = Objects.requireNonNull(PaymentTransaction.builder()
            .orderId(orderId)
            .provider(request.getProvider())
            .status(PaymentStatus.INIT)
            .amount(request.getAmount())
            .currency(request.getCurrency())
            .providerReference(UUID.randomUUID().toString())
            .build());
        PaymentTransaction saved = paymentTransactionRepository.save(transaction);
        PaymentResultResponse response;
        // SOLID: Provider branching here means adding a new provider requires editing this method (OCP).
        if (request.getProvider() == PaymentProvider.PAYPAL) {
            response = payPalService.initiatePayment(saved, request);
        } else if (request.getProvider() == PaymentProvider.VIETQR) {
            response = vietQRService.generateQr(saved, request);
        } else {
            response = PaymentResultResponse.builder()
                .transactionId(saved.getId())
                .status(saved.getStatus())
                .providerReference(saved.getProviderReference())
                .build();
        }
        paymentTransactionRepository.save(saved);
        return response;
    }

    @Transactional
    public PaymentResultResponse markCaptured(Long transactionId, String providerReference) {
        Long id = Objects.requireNonNull(transactionId, "transactionId must not be null");
        PaymentTransaction transaction = paymentTransactionRepository.findById(id)
            .orElseThrow(() -> new NotFoundException("Transaction not found"));
        if (providerReference != null) {
            transaction.setProviderReference(providerReference);
            transaction.setCaptureId(providerReference);
        }
        PaymentResultResponse response;
        if (transaction.getProvider() == PaymentProvider.PAYPAL) {
            response = payPalService.capture(transaction.getProviderReference(), transaction);
        } else {
            transaction.setStatus(PaymentStatus.CAPTURED);
            response = PaymentResultResponse.builder()
                .transactionId(transaction.getId())
                .status(transaction.getStatus())
                .providerReference(transaction.getProviderReference())
                .build();
        }
        paymentTransactionRepository.save(transaction);
        // SOLID: Order status changes are mixed into payment capture; consider a domain event handler.
        Order order = updateOrderPaid(transaction.getOrderId());
        if (order != null && transaction.getStatus() == PaymentStatus.CAPTURED) {
            emailNotificationService.sendEmail(order.getId(), transaction.getId());
        }
        return response;
    }

    private Order updateOrderPaid(Long orderId) {
        // SOLID: This is order-domain behavior embedded in payment service (SRP).
        if (orderId == null) {
            return null;
        }
        Order order = orderRepository.findById(orderId).orElse(null);
        if (order != null) {
            if (order.getStatus() == OrderStatus.CANCELLED) {
                throw new BusinessException("Order already cancelled");
            }
            if (order.getStatus() == OrderStatus.REJECTED) {
                throw new BusinessException("Order already rejected");
            }
            order.setStatus(OrderStatus.PENDING_PROCESSING);
            return orderRepository.save(order);
        }
        return null;
    }
}
