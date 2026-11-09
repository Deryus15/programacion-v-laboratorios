package com.unachi.inventario.datos;

import com.unachi.inventario.modelo.Articulo;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;

/**
 * Capa de Datos — acceso a la tabla "articulo".
 * Solo contiene lógica de persistencia (SQL). Ninguna regla de negocio
 * debe vivir aquí: eso corresponde a la capa de negocio (ArticuloService).
 */
public class ArticuloDAO {

    public void crear(Articulo articulo) throws SQLException {
        String sql = "INSERT INTO articulo (codigo_barra, nombre) VALUES (?, ?)";
        try (Connection con = ConexionBD.obtenerConexion();
             PreparedStatement ps = con.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {

            ps.setString(1, articulo.getCodigoBarra());
            ps.setString(2, articulo.getNombre());
            ps.executeUpdate();

            try (ResultSet rs = ps.getGeneratedKeys()) {
                if (rs.next()) {
                    articulo.setId(rs.getInt(1));
                }
            }
        }
    }

    public List<Articulo> listarTodos() throws SQLException {
        List<Articulo> lista = new ArrayList<>();
        String sql = "SELECT id, codigo_barra, nombre FROM articulo ORDER BY nombre";

        try (Connection con = ConexionBD.obtenerConexion();
             PreparedStatement ps = con.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {

            while (rs.next()) {
                lista.add(mapearArticulo(rs));
            }
        }
        return lista;
    }

    public Articulo buscarPorId(int id) throws SQLException {
        String sql = "SELECT id, codigo_barra, nombre FROM articulo WHERE id = ?";

        try (Connection con = ConexionBD.obtenerConexion();
             PreparedStatement ps = con.prepareStatement(sql)) {

            ps.setInt(1, id);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return mapearArticulo(rs);
                }
            }
        }
        return null;
    }

    /**
     * Verifica si ya existe un artículo con el código de barra dado.
     * @param idExcluir si no es null, excluye ese id de la búsqueda
     *                  (útil al validar durante una edición).
     */
    public boolean existeCodigoBarra(String codigoBarra, Integer idExcluir) throws SQLException {
        String sql = "SELECT COUNT(*) FROM articulo WHERE codigo_barra = ?"
                + (idExcluir != null ? " AND id <> ?" : "");

        try (Connection con = ConexionBD.obtenerConexion();
             PreparedStatement ps = con.prepareStatement(sql)) {

            ps.setString(1, codigoBarra);
            if (idExcluir != null) {
                ps.setInt(2, idExcluir);
            }
            try (ResultSet rs = ps.executeQuery()) {
                rs.next();
                return rs.getInt(1) > 0;
            }
        }
    }

    public void actualizar(Articulo articulo) throws SQLException {
        String sql = "UPDATE articulo SET codigo_barra = ?, nombre = ? WHERE id = ?";

        try (Connection con = ConexionBD.obtenerConexion();
             PreparedStatement ps = con.prepareStatement(sql)) {

            ps.setString(1, articulo.getCodigoBarra());
            ps.setString(2, articulo.getNombre());
            ps.setInt(3, articulo.getId());
            ps.executeUpdate();
        }
    }

    public void eliminar(int id) throws SQLException {
        String sql = "DELETE FROM articulo WHERE id = ?";

        try (Connection con = ConexionBD.obtenerConexion();
             PreparedStatement ps = con.prepareStatement(sql)) {

            ps.setInt(1, id);
            ps.executeUpdate();
        }
    }

    private Articulo mapearArticulo(ResultSet rs) throws SQLException {
        Articulo articulo = new Articulo();
        articulo.setId(rs.getInt("id"));
        articulo.setCodigoBarra(rs.getString("codigo_barra"));
        articulo.setNombre(rs.getString("nombre"));
        return articulo;
    }
}
