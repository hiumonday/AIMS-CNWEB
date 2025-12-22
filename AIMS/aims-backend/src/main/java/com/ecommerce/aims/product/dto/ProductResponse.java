package com.ecommerce.aims.product.dto;

import com.ecommerce.aims.product.models.ProductStatus;

import java.math.BigDecimal;
import java.util.Map;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ProductResponse {
    private Long id;
    private String typeCode;
    private ProductStatus status;
    private String barcode;
    private String title;
    private String category;
    private String conditionLabel;
    private String dominantColor;
    private String returnPolicy;

    private BigDecimal height;
    private BigDecimal width;
    private BigDecimal length;
    private BigDecimal weight;

    private BigDecimal originalValue;
    private BigDecimal currentPrice;
    private Integer stock;
    private Map<String, Object> attributes;

}
