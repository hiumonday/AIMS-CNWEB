package com.ecommerce.aims.product.dto;

import com.ecommerce.aims.product.models.BookDetail;
import com.ecommerce.aims.product.models.CdDetail;
import com.ecommerce.aims.product.models.DvdDetail;
import com.ecommerce.aims.product.models.NewspaperDetail;
import com.ecommerce.aims.product.models.ProductStatus;
import com.ecommerce.aims.product.models.ProductType;
import java.math.BigDecimal;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ProductResponse {
    private Long id;
    private ProductType productType;
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

    private BookDetail bookDetail;
    private NewspaperDetail newspaperDetail;
    private CdDetail cdDetail;
    private DvdDetail dvdDetail;
}
