package com.ecommerce.aims.payment.services;

import com.ecommerce.aims.payment.dto.CreatePaymentRequest;
import com.ecommerce.aims.payment.dto.PaymentResultResponse;
import com.ecommerce.aims.payment.models.PaymentTransaction;
import com.ecommerce.aims.payment.models.PaymentStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import vn.payos.model.v2.paymentRequests.CreatePaymentLinkRequest;
import vn.payos.model.v2.paymentRequests.CreatePaymentLinkResponse;

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
        VietQRClient.VietQrCreateResponse response = vietQRClient.createQr(transaction.getOrderId(),
                transaction.getAmount(), "AIMS order " + transaction.getOrderId());
        transaction.setProviderReference(response.getTransactionId());
        transaction.setQrContent(response.getQrContent() != null ? response.getQrContent() : response.getQrImage());
        return PaymentResultResponse.builder()
                .transactionId(transaction.getId())
                .status(PaymentStatus.INIT)
                .qrContent(transaction.getQrContent())
                .providerReference(transaction.getProviderReference())
                .build();
    }
}
