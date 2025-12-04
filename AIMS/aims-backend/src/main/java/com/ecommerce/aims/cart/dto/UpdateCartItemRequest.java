package com.ecommerce.aims.cart.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import lombok.Data;

@Data
public class UpdateCartItemRequest {
    @NotNull
    private Long productId;
    @Min(1)
    private Integer quantity;
    private BigDecimal price;
}
