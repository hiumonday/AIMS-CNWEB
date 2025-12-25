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

    @PostMapping({ "/test-email", "/test-emai" })
    public ApiResponse<Void> sendTestEmail(@Valid @RequestBody SendOrderPaymentEmailRequest request) {
        emailNotificationService.sendOrderConfirmationEmail(request);
        return ApiResponse.success(null, "Email queued");
    }

    @PostMapping("/test/user-created")
    public ApiResponse<Void> testUserCreated(@RequestBody java.util.Map<String, String> request) {
        String email = request.getOrDefault("email", "ductranphamminh4924@gmail.com");
        String password = request.getOrDefault("temporaryPassword", "tempPass123");
        emailNotificationService.sendUserCreatedByAdminEmail(email, password);
        return ApiResponse.success(null, "Test email USER_CREATED sent to " + email);
    }

    @PostMapping("/test/user-updated")
    public ApiResponse<Void> testUserUpdated(@RequestBody java.util.Map<String, String> request) {
        String email = request.getOrDefault("email", "ductranphamminh4924@gmail.com");
        emailNotificationService.sendUserUpdatedByAdminEmail(email);
        return ApiResponse.success(null, "Test email USER_UPDATED sent to " + email);
    }

    @PostMapping("/test/user-deleted")
    public ApiResponse<Void> testUserDeleted(@RequestBody java.util.Map<String, String> request) {
        String email = request.getOrDefault("email", "ductranphamminh4924@gmail.com");
        emailNotificationService.sendUserDeletedByAdminEmail(email);
        return ApiResponse.success(null, "Test email USER_DELETED sent to " + email);
    }

    @PostMapping("/test/user-locked")
    public ApiResponse<Void> testUserLocked(@RequestBody java.util.Map<String, String> request) {
        String email = request.getOrDefault("email", "ductranphamminh4924@gmail.com");
        emailNotificationService.sendUserLockedByAdminEmail(email);
        return ApiResponse.success(null, "Test email USER_LOCKED sent to " + email);
    }

    @PostMapping("/test/user-unlocked")
    public ApiResponse<Void> testUserUnlocked(@RequestBody java.util.Map<String, String> request) {
        String email = request.getOrDefault("email", "ductranphamminh4924@gmail.com");
        emailNotificationService.sendUserUnlockedByAdminEmail(email);
        return ApiResponse.success(null, "Test email USER_UNLOCKED sent to " + email);
    }

    @PostMapping("/test/password-reset")
    public ApiResponse<Void> testPasswordReset(@RequestBody java.util.Map<String, String> request) {
        String email = request.getOrDefault("email", "ductranphamminh4924@gmail.com");
        String token = request.getOrDefault("token", "test-token-123");
        emailNotificationService.sendAdminPasswordResetEmail(email, token);
        return ApiResponse.success(null, "Test email PASSWORD_RESET sent to " + email);
    }
}
