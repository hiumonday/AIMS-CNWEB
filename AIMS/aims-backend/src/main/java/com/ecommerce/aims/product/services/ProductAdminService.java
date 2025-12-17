package com.ecommerce.aims.product.services;

import com.ecommerce.aims.common.exception.BusinessException;
import com.ecommerce.aims.common.exception.NotFoundException;
import com.ecommerce.aims.common.util.MoneyUtils;
import com.ecommerce.aims.product.dto.ProductRequest;
import com.ecommerce.aims.product.dto.ProductResponse;
import com.ecommerce.aims.product.models.Product;
import com.ecommerce.aims.product.models.ProductHistory;
import com.ecommerce.aims.product.models.ProductStatus;
import com.ecommerce.aims.product.models.ProductType;
import com.ecommerce.aims.product.repository.ProductHistoryRepository;
import com.ecommerce.aims.product.repository.ProductRepository;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Objects;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ProductAdminService {

    private final ProductRepository productRepository;
    private final ProductHistoryRepository historyRepository;

    @Transactional
    public ProductResponse create(ProductRequest request) {
        Objects.requireNonNull(request, "request must not be null");
        validateRequest(request);
        Product product = new Product();
        applyRequest(product, request);
        product.setStatus(request.getStatus() != null ? request.getStatus() : ProductStatus.ACTIVE);
        Product saved = Objects.requireNonNull(productRepository.save(product));
        Objects.requireNonNull(historyRepository.save(ProductHistory.builder().product(saved).action("CREATE").note("Created product").build()));
        return toResponse(saved);
    }

    @Transactional
    public ProductResponse update(Long id, ProductRequest request) {
        Long requiredId = Objects.requireNonNull(id, "id must not be null");
        Objects.requireNonNull(request, "request must not be null");
        validateRequest(request);
        Product product = productRepository.findById(requiredId)
            .orElseThrow(() -> new NotFoundException("Product not found"));
        applyRequest(product, request);
        Product saved = Objects.requireNonNull(productRepository.save(product));
        Objects.requireNonNull(historyRepository.save(ProductHistory.builder().product(saved).action("UPDATE").note("Updated product").build()));
        return toResponse(saved);
    }

    @Transactional
    public void deleteOrDeactivate(Long id) {
        Long requiredId = Objects.requireNonNull(id, "id must not be null");
        Product product = productRepository.findById(requiredId)
            .orElseThrow(() -> new NotFoundException("Product not found"));
        LocalDate today = LocalDate.now();
        LocalDateTime start = today.atStartOfDay();
        LocalDateTime end = today.plusDays(1).atStartOfDay();
        long deletesToday = historyRepository.countByActionAndCreatedAtBetween("DELETE", start, end);
        if (deletesToday >= 20) {
            throw new BusinessException("Daily delete limit reached");
        }
        Integer stock = product.getStock();
        if (stock != null && stock > 0) {
            product.setStatus(ProductStatus.DEACTIVATED);
            productRepository.save(product);
            Objects.requireNonNull(historyRepository.save(ProductHistory.builder().product(product).action("DEACTIVATE").note("Stock remaining, deactivated").build()));
            return;
        }
        Objects.requireNonNull(historyRepository.save(ProductHistory.builder().product(null).action("DELETE").note("Deleted product " + product.getId()).build()));
        productRepository.delete(product);
    }

    private void applyRequest(Product product, ProductRequest request) {
        Objects.requireNonNull(product, "product must not be null");
        Objects.requireNonNull(request, "request must not be null");
        if (request.getOriginalValue() != null && request.getCurrentPrice() != null) {
            if (!MoneyUtils.isWithinPriceRule(request.getOriginalValue(), request.getCurrentPrice())) {
                throw new BusinessException("Current price must be between 30% and 150% of original value");
            }
        }
        product.setProductType(request.getProductType());
        product.setStatus(request.getStatus() != null ? request.getStatus() : ProductStatus.ACTIVE);
        product.setBarcode(request.getBarcode());
        product.setTitle(request.getTitle());
        product.setCategory(request.getCategory());
        product.setConditionLabel(request.getConditionLabel());
        product.setDominantColor(request.getDominantColor());
        product.setReturnPolicy(request.getReturnPolicy());
        product.setHeight(request.getHeight());
        product.setWidth(request.getWidth());
        product.setLength(request.getLength());
        product.setWeight(request.getWeight());
        product.setOriginalValue(request.getOriginalValue());
        product.setCurrentPrice(request.getCurrentPrice());
        product.setStock(request.getStock());
        product.setBookDetail(request.getBookDetail());
        product.setNewspaperDetail(request.getNewspaperDetail());
        product.setCdDetail(request.getCdDetail());
        product.setDvdDetail(request.getDvdDetail());
    }

    private void validateRequest(ProductRequest request) {
        Objects.requireNonNull(request, "request must not be null");
        if (request.getOriginalValue() != null && request.getOriginalValue().signum() <= 0) {
            throw new BusinessException("Original value must be positive");
        }
        if (request.getCurrentPrice() != null && request.getCurrentPrice().signum() <= 0) {
            throw new BusinessException("Current price must be positive");
        }
        if (request.getStock() != null && request.getStock() < 0) {
            throw new BusinessException("Stock cannot be negative");
        }
        ProductType type = request.getProductType();
        if (type == ProductType.BOOK && request.getBookDetail() == null) {
            throw new BusinessException("Book details are required for BOOK type");
        }
        if (type == ProductType.NEWSPAPER && request.getNewspaperDetail() == null) {
            throw new BusinessException("Newspaper details are required for NEWSPAPER type");
        }
        if (type == ProductType.CD && request.getCdDetail() == null) {
            throw new BusinessException("CD details are required for CD type");
        }
        if (type == ProductType.DVD && request.getDvdDetail() == null) {
            throw new BusinessException("DVD details are required for DVD type");
        }
    }

    private ProductResponse toResponse(Product product) {
        Product requiredProduct = Objects.requireNonNull(product, "product must not be null");
        return ProductResponse.builder()
            .id(requiredProduct.getId())
            .productType(requiredProduct.getProductType())
            .status(requiredProduct.getStatus())
            .barcode(requiredProduct.getBarcode())
            .title(requiredProduct.getTitle())
            .category(requiredProduct.getCategory())
            .conditionLabel(requiredProduct.getConditionLabel())
            .dominantColor(requiredProduct.getDominantColor())
            .returnPolicy(requiredProduct.getReturnPolicy())
            .height(requiredProduct.getHeight())
            .width(requiredProduct.getWidth())
            .length(requiredProduct.getLength())
            .weight(requiredProduct.getWeight())
            .originalValue(requiredProduct.getOriginalValue())
            .currentPrice(requiredProduct.getCurrentPrice())
            .stock(requiredProduct.getStock())
            .bookDetail(requiredProduct.getBookDetail())
            .newspaperDetail(requiredProduct.getNewspaperDetail())
            .cdDetail(requiredProduct.getCdDetail())
            .dvdDetail(requiredProduct.getDvdDetail())
            .build();
    }
}
