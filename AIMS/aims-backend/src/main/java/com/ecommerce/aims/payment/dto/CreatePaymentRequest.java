package com.ecommerce.aims.payment.dto;

import com.ecommerce.aims.payment.models.PaymentProvider;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import lombok.Data;

@Data
public class CreatePaymentRequest {
    @NotNull
    private Long orderId;
    private PaymentProvider provider;
    @NotNull
    @DecimalMin(value = "0.1")
    private BigDecimal amount;
    @NotBlank
    private String currency;
    @NotBlank
    private String successReturnUrl;
    @NotBlank
    private String cancelReturnUrl;
}
