--liquibase formatted sql

--changeset aims:002-create-roles-table
CREATE TABLE roles (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
);

CREATE INDEX idx_roles_name ON roles(name);

--rollback DROP TABLE roles;
