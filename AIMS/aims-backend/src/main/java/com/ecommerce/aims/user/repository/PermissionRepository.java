package com.ecommerce.aims.user.repository;

import com.ecommerce.aims.user.models.Permission;
import com.ecommerce.aims.user.models.PermissionAction;
import com.ecommerce.aims.user.models.PermissionObject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PermissionRepository extends JpaRepository<Permission, Long> {
    Optional<Permission> findByObjectAndAction(PermissionObject object, PermissionAction action);
}
