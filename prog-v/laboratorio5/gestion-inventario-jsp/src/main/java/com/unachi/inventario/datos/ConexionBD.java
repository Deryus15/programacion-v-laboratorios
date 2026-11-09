package com.unachi.inventario.datos;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

/**
 * Capa de Datos — utilidad de conexión JDBC.
 *
 * Centraliza la configuración de acceso a la base de datos para que
 * los DAO no repitan esta lógica. Ajusta URL, USUARIO y PASSWORD según
 * tu entorno (local, AWS RDS, etc.).
 */
public final class ConexionBD {

    private static final String URL =
            "jdbc:mysql://localhost:3306/inventario_db?useSSL=false&serverTimezone=UTC&characterEncoding=UTF-8";
    private static final String USUARIO = "root";
    private static final String PASSWORD = "";

    static {
        try {
            Class.forName("com.mysql.cj.jdbc.Driver");
        } catch (ClassNotFoundException e) {
            throw new RuntimeException("No se encontró el driver JDBC de MySQL en el classpath.", e);
        }
    }

    private ConexionBD() {
        // Clase utilitaria: no se instancia.
    }

    public static Connection obtenerConexion() throws SQLException {
        return DriverManager.getConnection(URL, USUARIO, PASSWORD);
    }
}
