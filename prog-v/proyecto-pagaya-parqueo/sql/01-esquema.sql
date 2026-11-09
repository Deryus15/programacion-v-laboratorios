-- Parqueo (G2) · modelo de datos propio
-- Motor: MySQL / MariaDB. Ejecutar:  mysql -u root < sql/01-esquema.sql
-- Regla: nunca se copian saldos ni datos de cuentas de PagaYa; solo el id del cobro.

CREATE DATABASE IF NOT EXISTS parqueo_db
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE parqueo_db;

-- Tarifa vigente: fracción de 30 min y tope por día
CREATE TABLE IF NOT EXISTS tarifa (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  minutos_fraccion INT          NOT NULL,          -- 30
  precio_fraccion  DECIMAL(6,2) NOT NULL,          -- B/. por cada fracción iniciada
  tope_diario      DECIMAL(6,2) NOT NULL,          -- máximo a cobrar por día de 24 h
  vigente          BOOLEAN      NOT NULL DEFAULT TRUE,
  CONSTRAINT ck_tarifa CHECK (minutos_fraccion > 0 AND precio_fraccion > 0 AND tope_diario >= precio_fraccion)
);

-- Ticket de estacionamiento: aquí se guarda el id del cobro de PagaYa y el estado PROPIO
CREATE TABLE IF NOT EXISTS ticket (
  id               BIGINT AUTO_INCREMENT PRIMARY KEY,
  placa            VARCHAR(10)  NOT NULL,
  entrada          DATETIME     NOT NULL,
  salida           DATETIME     NULL,              -- se llena al registrar la salida
  minutos          INT          NULL,              -- minutos estacionado (calculado en el servidor)
  monto            DECIMAL(8,2) NULL,              -- tarifa calculada con fracciones y tope
  estado           VARCHAR(16)  NOT NULL,          -- DENTRO, ESPERANDO_PAGO, PAGADO, FUERA
  telefono_cliente CHAR(8)      NULL,
  cobro_pagaya     BIGINT       NULL,              -- id del cobro en PagaYa
  intento          INT          NOT NULL DEFAULT 0,-- número de cobro (para la Idempotency-Key)
  vence_en         DATETIME     NULL,              -- vencimiento del cobro informado por PagaYa
  KEY ix_ticket_placa (placa, estado),
  KEY ix_ticket_estado (estado, entrada)
);

-- Bitácora de la barrera de salida (solo se abre con cobro PAGADO)
CREATE TABLE IF NOT EXISTS evento_barrera (
  id        BIGINT AUTO_INCREMENT PRIMARY KEY,
  ticket_id BIGINT      NOT NULL,
  momento   DATETIME    NOT NULL,
  resultado VARCHAR(12) NOT NULL,                  -- ABIERTA, DENEGADA
  motivo    VARCHAR(80) NULL,
  FOREIGN KEY (ticket_id) REFERENCES ticket(id)
);

INSERT INTO tarifa (minutos_fraccion, precio_fraccion, tope_diario, vigente)
SELECT 30, 0.50, 6.00, TRUE WHERE NOT EXISTS (SELECT 1 FROM tarifa);
