package com.ecommerce.aims.product.services;

import com.ecommerce.aims.common.dto.PageResponse;
import com.ecommerce.aims.common.exception.NotFoundException;
import com.ecommerce.aims.product.dto.ProductFilterRequest;
import com.ecommerce.aims.product.dto.ProductResponse;
import com.ecommerce.aims.product.models.Product;
import com.ecommerce.aims.product.models.ProductStatus;
import com.ecommerce.aims.product.repository.ProductRepository;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;

    public PageResponse<ProductResponse> listProducts(ProductFilterRequest filterRequest) {
        Objects.requireNonNull(filterRequest, "filterRequest must not be null");
        Specification<Product> spec = Objects.requireNonNull(buildSpecification(filterRequest), "specification must not be null");
        int pageNumber = filterRequest.getPage();
        int pageSize = filterRequest.getSize();
        Page<Product> page = productRepository.findAll(spec, PageRequest.of(pageNumber, pageSize));
        return PageResponse.<ProductResponse>builder()
            .items(page.map(this::toResponse).getContent())
            .page(page.getNumber())
            .size(page.getSize())
            .totalElements(page.getTotalElements())
            .totalPages(page.getTotalPages())
            .build();
    }

    public ProductResponse getProduct(Long id) {
        Long requiredId = Objects.requireNonNull(id, "id must not be null");
        Product product = productRepository.findById(requiredId)
            .orElseThrow(() -> new NotFoundException("Product not found"));
        return toResponse(product);
    }

    private Specification<Product> buildSpecification(ProductFilterRequest request) {
        return (root, query, cb) -> {
            List<jakarta.persistence.criteria.Predicate> predicates = new ArrayList<>();
            if (StringUtils.hasText(request.getQuery())) {
                String like = "%" + request.getQuery().toLowerCase() + "%";
                predicates.add(cb.or(
                    cb.like(cb.lower(root.get("title")), like),
                    cb.like(cb.lower(root.get("category")), like)
                ));
            }
            if (StringUtils.hasText(request.getCategory())) {
                predicates.add(cb.equal(cb.lower(root.get("category")), request.getCategory().toLowerCase()));
            }
//            if (request.getProductType() != null) {
//                predicates.add(cb.equal(root.get("productType"), request.getProductType()));
//            }
            predicates.add(cb.equal(root.get("status"), ProductStatus.ACTIVE));
            if (request.getMinPrice() != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("currentPrice"), request.getMinPrice()));
            }
            if (request.getMaxPrice() != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("currentPrice"), request.getMaxPrice()));
            }
            return cb.and(predicates.toArray(new jakarta.persistence.criteria.Predicate[0]));
        };
    }

    private ProductResponse toResponse(Product product) {
        if (product == null) {
            return null;
        }
        return ProductResponse.builder()
            .id(product.getId())
//            .productType(product.getProductType())
            .status(product.getStatus())
            .barcode(product.getBarcode())
            .title(product.getTitle())
            .category(product.getCategory())
            .conditionLabel(product.getConditionLabel())
            .dominantColor(product.getDominantColor())
            .returnPolicy(product.getReturnPolicy())
            .height(product.getHeight())
            .width(product.getWidth())
            .length(product.getLength())
            .weight(product.getWeight())
            .originalValue(product.getOriginalValue())
            .currentPrice(product.getCurrentPrice())
            .stock(product.getStock())
//            .bookDetail(product.getBookDetail())
//            .newspaperDetail(product.getNewspaperDetail())
//            .cdDetail(product.getCdDetail())
//            .dvdDetail(product.getDvdDetail())
            .build();
    }
}
