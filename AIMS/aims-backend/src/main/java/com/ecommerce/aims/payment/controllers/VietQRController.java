package com.ecommerce.aims.payment.controllers;

import com.ecommerce.aims.payment.dto.CreatePaymentRequest;
import com.ecommerce.aims.payment.services.VietQRService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import vn.payos.model.v2.paymentRequests.CreatePaymentLinkResponse;

@RestController
@RequestMapping("/api/payments/vietqr")
@RequiredArgsConstructor
public class VietQRController {

    private final VietQRService vietQRService;

    @PostMapping("/create-embedded-payment-link")
    public CreatePaymentLinkResponse createPaymentLink(
            @RequestBody CreatePaymentRequest request) {
        return vietQRService.createPaymentLink(request);
    }
}
