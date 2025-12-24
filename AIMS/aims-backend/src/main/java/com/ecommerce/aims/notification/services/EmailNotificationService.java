package com.ecommerce.aims.notification.services;

import com.ecommerce.aims.notification.models.EmailTemplateType;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailNotificationService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.from:${spring.mail.username:no-reply@localhost}}")
    private String fromAddress;

    public void sendEmail(String to, String subject, String body, EmailTemplateType templateType) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromAddress);
        message.setTo(to);
        message.setSubject(subject);
        message.setText(body);
        mailSender.send(message);
    }

    // TODO: Duc implement function nay
    public void sendPasswordResetEmail(String email, String token) {

    }

    // TODO: Duc implement function nay
    public void sendAdminPasswordResetEmail(String email, String token) {

    }

    // TODO: Duc implement function nay
    public void sendUserCreatedByAdminEmail(String email, String temporaryPassword) {

    }

    // TODO: Duc implement function nay
    public void sendUserUpdatedByAdminEmail(String email) {

    }

    // TODO: Duc implement function nay
    public void sendUserDeletedByAdminEmail(String email) {

    }

    // TODO: Duc implement function nay
    public void sendUserLockedByAdminEmail(String email) {

    }

    // TODO: Duc implement function nay
    public void sendUserUnlockedByAdminEmail(String email) {

    }
}
