package com.ecommerce.aims.payment.services;

import com.ecommerce.aims.payment.dto.CreatePaymentRequest;
import com.ecommerce.aims.payment.dto.PaymentResultResponse;
import com.ecommerce.aims.payment.models.PaymentTransaction;
import com.ecommerce.aims.payment.models.PaymentStatus;
import java.math.RoundingMode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import vn.payos.model.v2.paymentRequests.CreatePaymentLinkRequest;
import vn.payos.model.v2.paymentRequests.CreatePaymentLinkResponse;
import vn.payos.model.v2.paymentRequests.PaymentLink;
import vn.payos.model.v2.paymentRequests.PaymentLinkStatus;

@Service
@RequiredArgsConstructor
public class VietQRService {

    private final VietQRClient vietQRClient;

    public CreatePaymentLinkResponse createPaymentLink(CreatePaymentRequest request) {
        Long orderCode = System.currentTimeMillis() / 1000;

        CreatePaymentLinkRequest paymentData = CreatePaymentLinkRequest.builder()
                .orderCode(orderCode)
                .amount(10000L)
                .description("Thanh toán đơn hàng ")
                .returnUrl(request.getSuccessReturnUrl())
                .cancelUrl(request.getCancelReturnUrl())
                .build();

        return vietQRClient.createPaymentLink(paymentData);
    }

    public PaymentResultResponse generateQr(PaymentTransaction transaction, CreatePaymentRequest request) {
        CreatePaymentLinkRequest paymentData = CreatePaymentLinkRequest.builder()
                .orderCode(transaction.getId())
                .amount(transaction.getAmount().setScale(0, RoundingMode.HALF_UP).longValue())
                .description("AIMS order " + transaction.getOrderId())
                .returnUrl(request.getSuccessReturnUrl())
                .cancelUrl(request.getCancelReturnUrl())
                .build();

        CreatePaymentLinkResponse response = vietQRClient.createPaymentLink(paymentData);
        transaction.setProviderReference(response.getPaymentLinkId());
        transaction.setQrContent(response.getQrCode());
        return PaymentResultResponse.builder()
                .transactionId(transaction.getId())
                .status(PaymentStatus.INIT)
                .qrContent(transaction.getQrContent())
                .providerReference(transaction.getProviderReference())
                .build();
    }

    public PaymentStatus refreshStatus(PaymentTransaction transaction) {
        PaymentLink paymentLink = vietQRClient.getPaymentLink(transaction.getId());
        transaction.setProviderReference(paymentLink.getId());
        PaymentStatus updatedStatus = mapStatus(paymentLink.getStatus());
        if (transaction.getStatus() != PaymentStatus.CAPTURED && transaction.getStatus() != PaymentStatus.REFUNDED) {
            transaction.setStatus(updatedStatus);
        }
        return transaction.getStatus();
    }

    public PaymentLink getPaymentStatus(String id) {
        return vietQRClient.getPaymentLinkStatus(id);
    }

    private PaymentStatus mapStatus(PaymentLinkStatus status) {
        // SOLID: Mapping is hardcoded; new gateway statuses require code changes (OCP).
        return switch (status) {
            case PAID -> PaymentStatus.CAPTURED;
            case CANCELLED, EXPIRED, FAILED, UNDERPAID -> PaymentStatus.FAILED;
            default -> PaymentStatus.INIT;
        };
    }

    @org.springframework.beans.factory.annotation.Autowired
    @org.springframework.context.annotation.Lazy
    private PaymentService paymentService;

    public void handleWebhook(java.util.Map<String, Object> payload) {
        if (payload == null)
            return;
        Object dataObj = payload.get("data");
        if (!(dataObj instanceof java.util.Map))
            return;
        java.util.Map<?, ?> data = (java.util.Map<?, ?>) dataObj;

        String code = (String) payload.get("code");
        if (!"00".equals(code))
            return;

        Object orderCodeObj = data.get("orderCode");
        if (orderCodeObj == null)
            return;

        try {
            Long transactionId = Long.valueOf(orderCodeObj.toString());
            paymentService.markCaptured(transactionId, null);
        } catch (NumberFormatException e) {
            System.err.println("Invalid order code format: " + orderCodeObj);
        } catch (Exception e) { // Catch NotFoundException and others
            System.err.println("Webhook processing failed: " + e.getMessage());
        }
    }
}
