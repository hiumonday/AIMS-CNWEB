--liquibase formatted sql

--changeset aims:003-create-permissions-table
CREATE TABLE IF NOT EXISTS permissions (
    id BIGSERIAL PRIMARY KEY,
    object VARCHAR(50) NOT NULL,
    action VARCHAR(50) NOT NULL,
    CONSTRAINT uk_permissions_object_action UNIQUE (object, action)
);

CREATE INDEX idx_permissions_object ON permissions(object);
CREATE INDEX idx_permissions_action ON permissions(action);

--rollback DROP TABLE permissions;
