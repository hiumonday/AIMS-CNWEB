package com.ecommerce.aims.payment.services;

import com.ecommerce.aims.common.exception.NotFoundException;
import com.ecommerce.aims.notification.services.EmailNotificationService;
import com.ecommerce.aims.order.models.Order;
import com.ecommerce.aims.order.repository.OrderRepository;
import com.ecommerce.aims.payment.dto.CreatePaymentRequest;
import com.ecommerce.aims.payment.dto.PaymentResultResponse;
import com.ecommerce.aims.payment.models.PaymentProvider;
import com.ecommerce.aims.payment.models.PaymentStatus;
import com.ecommerce.aims.payment.models.PaymentTransaction;
import com.ecommerce.aims.payment.repository.IPaymentTransactionRepository;
import java.util.Objects;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.ecommerce.aims.order.services.OrderPaymentService;

@Service
@RequiredArgsConstructor
public class PaymentService {

    // SOLID: This service coordinates transaction creation, provider dispatch, and
    // order state updates.
    // Consider splitting orchestration vs. order updates if/when refactoring.
    private final IPaymentTransactionRepository IPaymentTransactionRepository;
    private final PayPalService payPalService;
    private final VietQRService vietQRService;
    private final OrderRepository orderRepository;
    private final EmailNotificationService emailNotificationService;
    private final OrderPaymentService orderPaymentService;

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
        PaymentTransaction saved = IPaymentTransactionRepository.save(transaction);
        PaymentResultResponse response;
        // SOLID: Provider branching here means adding a new provider requires editing
        // this method (OCP).
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
        IPaymentTransactionRepository.save(saved);
        return response;
    }

    @Transactional
    public PaymentResultResponse markCaptured(Long transactionId, String providerReference) {
        Long id = Objects.requireNonNull(transactionId, "transactionId must not be null");
        PaymentTransaction transaction = IPaymentTransactionRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Transaction not found"));
        if (providerReference != null) {
            transaction.setProviderReference(providerReference);
            transaction.setCaptureId(providerReference);
        }

        // Update webhook timestamp
        transaction.setWebhookReceivedAt(java.time.LocalDateTime.now());

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
        IPaymentTransactionRepository.save(transaction);

        // Use OrderPaymentService for robust order handling (stock, cart, etc.)
        orderPaymentService.handlePaymentCaptured(transaction.getOrderId());

        // Send email notification
        // Note: OrderPaymentService saves the order, so we can retrieve it or trust it
        // exists
        emailNotificationService.sendEmail(transaction.getOrderId(), transaction.getId());

        return response;
    }

    @Transactional
    public void capturePayPalOrder(Long orderId, String providerReference, String captureId) {
        if (orderId == null) {
            return;
        }
        PaymentTransaction transaction = IPaymentTransactionRepository.findTopByOrderIdOrderByCreatedAtDesc(orderId)
                .orElse(null);

        if (transaction != null && transaction.getStatus() != PaymentStatus.CAPTURED) {
            if (providerReference != null) {
                transaction.setProviderReference(providerReference);
            }
            if (captureId != null) {
                transaction.setCaptureId(captureId);
            }

            // Update webhook timestamp
            transaction.setWebhookReceivedAt(java.time.LocalDateTime.now());
            transaction.setStatus(PaymentStatus.CAPTURED);
            IPaymentTransactionRepository.save(transaction);

            // Use OrderPaymentService for robust order handling
            orderPaymentService.handlePaymentCaptured(orderId);

            emailNotificationService.sendEmail(orderId, transaction.getId());
        }
    }

}
