-- Tabla de credenciales de usuario (relación 1:1)
CREATE TABLE user_credentials (
                                  user_id BIGINT PRIMARY KEY,
                                  password_hash VARCHAR(255) NOT NULL,
                                  password_changed_at TIMESTAMP,
                                  CONSTRAINT fk_user_credentials_user FOREIGN KEY (user_id) REFERENCES "user"(id) ON DELETE CASCADE
);

-- Tabla de roles de usuario (relación N:1)
CREATE TABLE user_roles (
                            user_id BIGINT NOT NULL,
                            role VARCHAR(50) NOT NULL,
                            PRIMARY KEY (user_id, role),
                            CONSTRAINT fk_user_roles_user FOREIGN KEY (user_id) REFERENCES "user"(id) ON DELETE CASCADE
);

-- Índices para optimizar búsquedas
CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);