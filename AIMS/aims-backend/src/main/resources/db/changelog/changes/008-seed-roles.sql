--liquibase formatted sql

--changeset aims:008-seed-roles
-- Insert roles
INSERT INTO roles (name) VALUES ('ROLE_ADMIN');
INSERT INTO roles (name) VALUES ('ROLE_PRODUCT_MANAGER');
INSERT INTO roles (name) VALUES ('ROLE_CUSTOMER');

-- Assign permissions to ROLE_ADMIN (all permissions)
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'ROLE_ADMIN';

-- Assign permissions to ROLE_PRODUCT_MANAGER
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'ROLE_PRODUCT_MANAGER'
  AND (
    (p.object = 'PRODUCT' AND p.action IN ('READ', 'WRITE', 'DELETE'))
    OR (p.object = 'STOCK' AND p.action = 'ADJUST')
    OR (p.object = 'ORDER' AND p.action = 'REVIEW')
  );

-- Assign permissions to ROLE_CUSTOMER
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'ROLE_CUSTOMER'
  AND p.object = 'PRODUCT'
  AND p.action = 'READ';

--rollback DELETE FROM role_permissions; DELETE FROM roles;
