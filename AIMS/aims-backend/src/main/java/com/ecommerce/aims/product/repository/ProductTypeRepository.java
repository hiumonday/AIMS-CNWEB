package com.ecommerce.aims.product.repository;

import com.ecommerce.aims.product.models.ProductType;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProductTypeRepository extends JpaRepository<ProductType, Long> {
    Optional<ProductType> findByCodeIgnoreCase(String code);
}
