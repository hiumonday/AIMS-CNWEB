package com.ecommerce.aims.user.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(
    name = "permissions",
    uniqueConstraints = @UniqueConstraint(columnNames = {"object", "action"})
)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Permission {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PermissionObject object;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PermissionAction action;

    public String toAuthority() {
        return "PERM_" + object.name() + ":" + action.name();
    }
}
