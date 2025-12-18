package com.ecommerce.aims.payment.services;

import com.ecommerce.aims.common.exception.NotFoundException;
import com.ecommerce.aims.order.models.Order;
import com.ecommerce.aims.order.models.OrderStatus;
import com.ecommerce.aims.order.repository.OrderRepository;
import com.ecommerce.aims.payment.dto.PaymentResultResponse;
import com.ecommerce.aims.payment.dto.RefundRequest;
import com.ecommerce.aims.payment.models.PaymentProvider;
import com.ecommerce.aims.payment.models.PaymentStatus;
import com.ecommerce.aims.payment.repository.PaymentTransactionRepository;
import com.ecommerce.aims.payment.models.PaymentTransaction;
import java.util.Objects;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class RefundService {

    // SOLID: This service currently mixes payment refund logic and order status updates.
    private final PaymentTransactionRepository paymentTransactionRepository;
    private final PayPalService payPalService;
    private final OrderRepository orderRepository;

    @Transactional
    public PaymentResultResponse refund(RefundRequest request) {
        Objects.requireNonNull(request, "request must not be null");
        Long transactionId = Objects.requireNonNull(request.getTransactionId(), "transactionId must not be null");
        PaymentTransaction transaction = paymentTransactionRepository.findById(transactionId)
            .orElseThrow(() -> new NotFoundException("Transaction not found"));
        java.math.BigDecimal refundAmount = request.getAmount() != null ? request.getAmount() : transaction.getAmount();
        // SOLID: Provider-specific branching means adding another refund provider edits this method (OCP).
        if (transaction.getProvider() == PaymentProvider.PAYPAL) {
            String captureId = transaction.getCaptureId() != null ? transaction.getCaptureId() : transaction.getProviderReference();
            payPalService.refund(captureId, refundAmount, transaction.getCurrency(), transaction);
        }
        boolean fullRefund = refundAmount != null && transaction.getAmount() != null && refundAmount.compareTo(transaction.getAmount()) >= 0;
        transaction.setStatus(fullRefund ? PaymentStatus.REFUNDED : PaymentStatus.CAPTURED);
        paymentTransactionRepository.save(transaction);
        updateOrderRefunded(transaction.getOrderId(), fullRefund);
        return PaymentResultResponse.builder()
            .transactionId(transaction.getId())
            .status(transaction.getStatus())
            .providerReference(transaction.getProviderReference())
            .build();
    }

    private void updateOrderRefunded(Long orderId, boolean fullRefund) {
        // SOLID: Order status changes are embedded here; consider moving to order domain service.
        if (orderId == null) {
            return;
        }
        Order order = orderRepository.findById(orderId).orElse(null);
        if (order != null && fullRefund) {
            order.setStatus(OrderStatus.REFUNDED);
            orderRepository.save(order);
        }
    }
}
