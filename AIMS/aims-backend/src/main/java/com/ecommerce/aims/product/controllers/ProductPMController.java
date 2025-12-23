package com.ecommerce.aims.product.controllers;

import com.ecommerce.aims.common.dto.ApiResponse;
import com.ecommerce.aims.common.dto.PageResponse;
import com.ecommerce.aims.product.dto.BulkDeleteRequest;
import com.ecommerce.aims.product.dto.BulkDeleteResponse;
import com.ecommerce.aims.product.dto.ProductFilterRequest;
import com.ecommerce.aims.product.dto.ProductRequest;
import com.ecommerce.aims.product.dto.ProductResponse;
import com.ecommerce.aims.product.dto.StockAdjustmentRequest;
import com.ecommerce.aims.product.services.ProductAdminService;
import com.ecommerce.aims.product.services.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/pm/products")
@RequiredArgsConstructor
public class ProductPMController {

    private final ProductAdminService productAdminService;
    private final ProductService productService;

    @PostMapping
    public ApiResponse<ProductResponse> create(@Valid @RequestBody ProductRequest request) {
        return ApiResponse.success(productAdminService.create(request), "Product created");
    }

    @GetMapping
    public ApiResponse<PageResponse<ProductResponse>> list(@Valid ProductFilterRequest filter) {
        return ApiResponse.success(productService.listProductsForPM(filter), "Products fetched");
    }

    @GetMapping("/{productId}")
    public ApiResponse<ProductResponse> get(@PathVariable Long productId) {
        return ApiResponse.success(productService.getProduct(productId), "Product detail");
    }

    @PutMapping("/{productId}")
    public ApiResponse<ProductResponse> update(@PathVariable Long productId, @Valid @RequestBody ProductRequest request) {
        return ApiResponse.success(productAdminService.update(productId, request), "Product updated");
    }

    @DeleteMapping("/{productId}")
    public ApiResponse<Void> delete(@PathVariable Long productId) {
        productAdminService.deleteOrDeactivate(productId);
        return ApiResponse.success(null, "Product removed or deactivated");
    }

    @PostMapping("/bulk-delete")
    public ApiResponse<BulkDeleteResponse> bulkDelete(@Valid @RequestBody BulkDeleteRequest request) {
        return ApiResponse.success(
            productAdminService.bulkDelete(request.getProductIds()), 
            "Bulk delete operation completed"
        );
    }

    @PostMapping("/{productId}/adjust-stock")
    public ApiResponse<ProductResponse> adjustStock(
        @PathVariable Long productId,
        @Valid @RequestBody StockAdjustmentRequest request
    ) {
        return ApiResponse.success(
            productAdminService.adjustStock(productId, request),
            "Stock adjusted successfully"
        );
    }
}
