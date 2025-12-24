package com.ecommerce.aims.payment.repository;

import com.ecommerce.aims.payment.models.PaymentTransaction;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PaymentTransactionRepository extends JpaRepository<PaymentTransaction, Long> {
    Optional<PaymentTransaction> findTopByOrderIdOrderByCreatedAtDesc(Long orderId);
}
