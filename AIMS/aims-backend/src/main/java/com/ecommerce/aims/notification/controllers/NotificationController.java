package com.ecommerce.aims.notification.controllers;

import com.ecommerce.aims.common.dto.ApiResponse;
import com.ecommerce.aims.notification.dto.SendEmailRequest;
import com.ecommerce.aims.notification.dto.SendOrderPaymentEmailRequest;
import com.ecommerce.aims.notification.models.EmailTemplateType;
import com.ecommerce.aims.notification.services.EmailNotificationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final EmailNotificationService emailNotificationService;

    @PostMapping("/email")
    public ApiResponse<Void> sendEmail(@Valid @RequestBody SendEmailRequest request) {
        EmailTemplateType templateType = request.getTemplateType() != null
            ? request.getTemplateType()
            : EmailTemplateType.ORDER_CONFIRMATION;
        emailNotificationService.sendEmail(request.getTo(), request.getSubject(), request.getBody(), templateType);
        return ApiResponse.success(null, "Email sent");
    }

    @PostMapping("/order-payment-email")
    public ApiResponse<Void> sendOrderPaymentEmail(@Valid @RequestBody SendOrderPaymentEmailRequest request) {
        emailNotificationService.sendEmail(request.getOrderId(), request.getTransactionId());
        return ApiResponse.success(null, "Email sent");
    }

    @PostMapping({"/test-email", "/test-emai"})
    public ApiResponse<Void> sendTestEmail(@Valid @RequestBody SendOrderPaymentEmailRequest request) {
        emailNotificationService.sendOrderConfirmationEmail(request);
        return ApiResponse.success(null, "Email queued");
    }
}
