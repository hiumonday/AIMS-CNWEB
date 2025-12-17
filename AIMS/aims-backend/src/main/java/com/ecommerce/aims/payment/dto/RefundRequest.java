package com.ecommerce.aims.payment.dto;

import jakarta.validation.constraints.DecimalMin;
import java.math.BigDecimal;
import lombok.Data;

@Data
public class RefundRequest {
    private Long transactionId;
    @DecimalMin(value = "0.1")
    private BigDecimal amount;
}
