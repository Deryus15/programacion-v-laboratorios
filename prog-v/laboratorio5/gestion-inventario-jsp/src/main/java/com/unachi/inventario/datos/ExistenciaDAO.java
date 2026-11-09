package com.unachi.inventario.datos;

import com.unachi.inventario.modelo.Existencia;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;

/**
 * Capa de Datos — acceso a la tabla "existencia".
 * Al igual que ArticuloDAO, solo contiene sentencias SQL. Las reglas de
 * negocio (por ejemplo, no permitir una salida mayor a la existencia
 * disponible) se validan en ExistenciaService, no aquí.
 */
public class ExistenciaDAO {

    public void crear(Existencia existencia) throws SQLException {
        String sql = "INSERT INTO existencia (articulo_id, cantidad_existencia) VALUES (?, ?)";

        try (Connection con = ConexionBD.obtenerConexion();
             PreparedStatement ps = con.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {

            ps.setInt(1, existencia.getArticuloId());
            ps.setInt(2, existencia.getCantidadExistencia());
            ps.executeUpdate();

            try (ResultSet rs = ps.getGeneratedKeys()) {
                if (rs.next()) {
                    existencia.setId(rs.getInt(1));
                }
            }
        }
    }

    public Existencia buscarPorArticulo(int articuloId) throws SQLException {
        String sql = "SELECT e.id, e.articulo_id, e.cantidad_existencia, a.nombre, a.codigo_barra "
                + "FROM existencia e "
                + "JOIN articulo a ON a.id = e.articulo_id "
                + "WHERE e.articulo_id = ?";

        try (Connection con = ConexionBD.obtenerConexion();
             PreparedStatement ps = con.prepareStatement(sql)) {

            ps.setInt(1, articuloId);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return mapearExistencia(rs);
                }
            }
        }
        return null;
    }

    public List<Existencia> listarTodas() throws SQLException {
        List<Existencia> lista = new ArrayList<>();
        String sql = "SELECT e.id, e.articulo_id, e.cantidad_existencia, a.nombre, a.codigo_barra "
                + "FROM existencia e "
                + "JOIN articulo a ON a.id = e.articulo_id "
                + "ORDER BY a.nombre";

        try (Connection con = ConexionBD.obtenerConexion();
             PreparedStatement ps = con.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {

            while (rs.next()) {
                lista.add(mapearExistencia(rs));
            }
        }
        return lista;
    }

    public void actualizarCantidad(int articuloId, int nuevaCantidad) throws SQLException {
        String sql = "UPDATE existencia SET cantidad_existencia = ? WHERE articulo_id = ?";

        try (Connection con = ConexionBD.obtenerConexion();
             PreparedStatement ps = con.prepareStatement(sql)) {

            ps.setInt(1, nuevaCantidad);
            ps.setInt(2, articuloId);
            ps.executeUpdate();
        }
    }

    public void eliminarPorArticulo(int articuloId) throws SQLException {
        String sql = "DELETE FROM existencia WHERE articulo_id = ?";

        try (Connection con = ConexionBD.obtenerConexion();
             PreparedStatement ps = con.prepareStatement(sql)) {

            ps.setInt(1, articuloId);
            ps.executeUpdate();
        }
    }

    private Existencia mapearExistencia(ResultSet rs) throws SQLException {
        Existencia existencia = new Existencia();
        existencia.setId(rs.getInt("id"));
        existencia.setArticuloId(rs.getInt("articulo_id"));
        existencia.setCantidadExistencia(rs.getInt("cantidad_existencia"));
        existencia.setNombreArticulo(rs.getString("nombre"));
        existencia.setCodigoBarraArticulo(rs.getString("codigo_barra"));
        return existencia;
    }
}
