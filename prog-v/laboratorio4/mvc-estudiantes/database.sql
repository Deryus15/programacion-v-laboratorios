CREATE DATABASE IF NOT EXISTS mvc_unachi
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

CREATE USER IF NOT EXISTS 'mvc_user'@'localhost'
IDENTIFIED BY 'MVC2026*';

GRANT ALL PRIVILEGES ON mvc_unachi.* TO 'mvc_user'@'localhost';
FLUSH PRIVILEGES;

USE mvc_unachi;

CREATE TABLE IF NOT EXISTS estudiantes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    cedula VARCHAR(20) NOT NULL UNIQUE,
    nombre VARCHAR(80) NOT NULL,
    apellido VARCHAR(80) NOT NULL,
    correo VARCHAR(120) NOT NULL,
    carrera VARCHAR(120) NOT NULL
);

INSERT INTO estudiantes (cedula, nombre, apellido, correo, carrera)
VALUES
('4-123-456', 'Ana', 'González', 'ana.gonzalez@ejemplo.com', 'Ingeniería de Software'),
('4-234-567', 'Carlos', 'Rodríguez', 'carlos.rodriguez@ejemplo.com', 'Ingeniería de Sistemas');
