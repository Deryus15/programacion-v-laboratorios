package com.unachi.inventario.negocio;

import com.unachi.inventario.datos.ExistenciaDAO;
import com.unachi.inventario.modelo.Existencia;

import java.sql.SQLException;
import java.util.List;

/**
 * Capa de Negocio — reglas del módulo "Gestión de Existencias".
 *
 * Reglas implementadas:
 *  - La cantidad de una entrada o salida debe ser mayor a cero.
 *  - No se puede registrar una salida mayor a la existencia disponible
 *    (esta es la regla que evita que el inventario quede en negativo).
 *  - Toda entrada/salida se aplica sobre el registro de existencia
 *    asociado al artículo (relación 1 a 1 entre Articulo y Existencia).
 */
public class ExistenciaService {

    private final ExistenciaDAO existenciaDAO = new ExistenciaDAO();

    public List<Existencia> listar() throws SQLException {
        return existenciaDAO.listarTodas();
    }

    public Existencia buscarPorArticulo(int articuloId) throws SQLException {
        return existenciaDAO.buscarPorArticulo(articuloId);
    }

    public void registrarEntrada(int articuloId, int cantidad) throws SQLException, NegocioException {
        if (cantidad <= 0) {
            throw new NegocioException("La cantidad de entrada debe ser mayor a cero.");
        }

        Existencia existencia = obtenerExistenciaObligatoria(articuloId);
        int nuevaCantidad = existencia.getCantidadExistencia() + cantidad;
        existenciaDAO.actualizarCantidad(articuloId, nuevaCantidad);
    }

    public void registrarSalida(int articuloId, int cantidad) throws SQLException, NegocioException {
        if (cantidad <= 0) {
            throw new NegocioException("La cantidad de salida debe ser mayor a cero.");
        }

        Existencia existencia = obtenerExistenciaObligatoria(articuloId);

        if (cantidad > existencia.getCantidadExistencia()) {
            throw new NegocioException(
                    "No hay suficiente existencia. Disponible: "
                            + existencia.getCantidadExistencia() + " unidades."
            );
        }

        int nuevaCantidad = existencia.getCantidadExistencia() - cantidad;
        existenciaDAO.actualizarCantidad(articuloId, nuevaCantidad);
    }

    private Existencia obtenerExistenciaObligatoria(int articuloId) throws SQLException, NegocioException {
        Existencia existencia = existenciaDAO.buscarPorArticulo(articuloId);
        if (existencia == null) {
            throw new NegocioException("El artículo seleccionado no tiene un registro de existencia asociado.");
        }
        return existencia;
    }
}
