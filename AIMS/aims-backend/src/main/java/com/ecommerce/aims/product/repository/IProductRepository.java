package com.ecommerce.aims.product.repository;

import com.ecommerce.aims.product.models.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface IProductRepository extends JpaRepository<Product, Long>, JpaSpecificationExecutor<Product> {
}
