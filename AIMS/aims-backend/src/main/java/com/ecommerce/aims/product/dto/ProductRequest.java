package com.ecommerce.aims.product.dto;

import com.ecommerce.aims.product.models.BookDetail;
import com.ecommerce.aims.product.models.CdDetail;
import com.ecommerce.aims.product.models.DvdDetail;
import com.ecommerce.aims.product.models.NewspaperDetail;
import com.ecommerce.aims.product.models.ProductStatus;
import com.ecommerce.aims.product.models.ProductType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import java.math.BigDecimal;
import lombok.Data;

@Data
public class ProductRequest {
    @NotNull
    private ProductType productType;
    private ProductStatus status;
    @NotBlank
    private String barcode;
    @NotBlank
    private String title;
    @NotBlank
    private String category;
    private String conditionLabel;
    private String dominantColor;
    private String returnPolicy;

    @PositiveOrZero
    private BigDecimal height;
    @PositiveOrZero
    private BigDecimal width;
    @PositiveOrZero
    private BigDecimal length;
    @PositiveOrZero
    private BigDecimal weight;

    @DecimalMin(value = "0.0", inclusive = false)
    private BigDecimal originalValue;
    @DecimalMin(value = "0.0", inclusive = false)
    private BigDecimal currentPrice;
    @NotNull
    @PositiveOrZero
    private Integer stock;

    private BookDetail bookDetail;
    private NewspaperDetail newspaperDetail;
    private CdDetail cdDetail;
    private DvdDetail dvdDetail;
}
