package com.ecommerce.aims.product.models;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "products")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private ProductType productType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    @Builder.Default
    private ProductStatus status = ProductStatus.ACTIVE;

    @Column(nullable = false, unique = true)
    private String barcode;
    @Column(nullable = false)
    private String title;
    @Column(nullable = false)
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

    @Column(nullable = false)
    private Integer stock;

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "book_detail_id")
    private BookDetail bookDetail;

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "newspaper_detail_id")
    private NewspaperDetail newspaperDetail;

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "cd_detail_id")
    private CdDetail cdDetail;

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "dvd_detail_id")
    private DvdDetail dvdDetail;

    @Builder.Default
    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL)
    private List<ProductHistory> history = new ArrayList<>();
}
