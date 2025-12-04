package com.ecommerce.aims.payment.services;

import com.ecommerce.aims.common.exception.NotFoundException;
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
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentTransactionRepository paymentTransactionRepository;
    private final PayPalService payPalService;
    private final VietQRService vietQRService;
    private final OrderRepository orderRepository;

    @Transactional
    public PaymentResultResponse createPayment(CreatePaymentRequest request) {
        Order order = orderRepository.findById(request.getOrderId())
            .orElseThrow(() -> new NotFoundException("Order not found"));
        if (request.getAmount() == null) {
            request.setAmount(order.getTotalWithVat());
        }
        PaymentTransaction transaction = PaymentTransaction.builder()
            .orderId(request.getOrderId())
            .provider(request.getProvider())
            .status(PaymentStatus.INIT)
            .amount(request.getAmount())
            .currency(request.getCurrency())
            .providerReference(UUID.randomUUID().toString())
            .build();
        PaymentTransaction saved = paymentTransactionRepository.save(transaction);
        PaymentResultResponse response;
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
        PaymentTransaction transaction = paymentTransactionRepository.findById(transactionId)
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
        updateOrderPaid(transaction.getOrderId());
        return response;
    }

    private void updateOrderPaid(Long orderId) {
        if (orderId == null) {
            return;
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
            orderRepository.save(order);
        }
    }
}
