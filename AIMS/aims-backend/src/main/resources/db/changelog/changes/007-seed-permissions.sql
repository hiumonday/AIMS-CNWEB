--liquibase formatted sql

--changeset aims:007-seed-permissions
-- User permissions
INSERT INTO permissions (object, action) VALUES ('USER', 'READ');
INSERT INTO permissions (object, action) VALUES ('USER', 'WRITE');
INSERT INTO permissions (object, action) VALUES ('USER', 'ROLE_MANAGE');
INSERT INTO permissions (object, action) VALUES ('USER', 'BLOCK');

-- Product permissions
INSERT INTO permissions (object, action) VALUES ('PRODUCT', 'READ');
INSERT INTO permissions (object, action) VALUES ('PRODUCT', 'WRITE');
INSERT INTO permissions (object, action) VALUES ('PRODUCT', 'DELETE');

-- Stock permissions
INSERT INTO permissions (object, action) VALUES ('STOCK', 'ADJUST');

-- Order permissions
INSERT INTO permissions (object, action) VALUES ('ORDER', 'REVIEW');

--rollback DELETE FROM permissions;
