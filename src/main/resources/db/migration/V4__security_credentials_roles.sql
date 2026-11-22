-- V4__security_credentials_roles.sql

CREATE TABLE user_credentials (
                                  id BIGSERIAL PRIMARY KEY,
                                  password_hash VARCHAR(255) NOT NULL,
                                  user_id BIGINT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE user_roles (
                            user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                            role VARCHAR(50) NOT NULL,
                            PRIMARY KEY (user_id, role)
);

-- Índices para optimizar consultas de seguridad
CREATE INDEX idx_user_credentials_user_id ON user_credentials(user_id);
CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);