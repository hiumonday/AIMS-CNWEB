--liquibase formatted sql

--changeset aims:009-seed-default-admin
-- Insert default admin user
-- Password: admin123 (BCrypt hash with strength 10)
INSERT INTO users (email, password, status, created_at, updated_at)
VALUES (
    'admin@aims.com',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
    'ACTIVE',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- Assign ROLE_ADMIN to default admin
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u
CROSS JOIN roles r
WHERE u.email = 'admin@aims.com'
  AND r.name = 'ROLE_ADMIN';

--rollback DELETE FROM user_roles WHERE user_id = (SELECT id FROM users WHERE email = 'admin@aims.com'); DELETE FROM users WHERE email = 'admin@aims.com';
