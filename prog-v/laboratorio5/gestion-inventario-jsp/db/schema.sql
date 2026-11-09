-- =====================================================================
-- Sistema de Gestión de Inventario — Script de base de datos (MySQL)
-- =====================================================================

CREATE DATABASE IF NOT EXISTS inventario_db
    CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE inventario_db;

-- Entidad Articulo: id, codigoBarra, nombre
CREATE TABLE IF NOT EXISTS articulo (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    codigo_barra  VARCHAR(50)  NOT NULL UNIQUE,
    nombre        VARCHAR(150) NOT NULL
);

-- Entidad Existencia: id, cantidadExistencia
-- (se agrega articulo_id como llave foránea; ver nota en Existencia.java)
CREATE TABLE IF NOT EXISTS existencia (
    id                    INT AUTO_INCREMENT PRIMARY KEY,
    articulo_id           INT NOT NULL,
    cantidad_existencia   INT NOT NULL DEFAULT 0,
    CONSTRAINT fk_existencia_articulo
        FOREIGN KEY (articulo_id) REFERENCES articulo(id)
        ON DELETE CASCADE,
    CONSTRAINT uq_existencia_articulo UNIQUE (articulo_id)
);

-- Datos de ejemplo (opcional, para probar la aplicación)
INSERT INTO articulo (codigo_barra, nombre) VALUES
    ('750001000001', 'Arroz 1kg'),
    ('750001000002', 'Aceite vegetal 1L'),
    ('750001000003', 'Azúcar 1kg');

INSERT INTO existencia (articulo_id, cantidad_existencia) VALUES
    (1, 50),
    (2, 30),
    (3, 0);
