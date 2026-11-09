package com.unachi.inventario.negocio;

import com.unachi.inventario.datos.ArticuloDAO;
import com.unachi.inventario.datos.ExistenciaDAO;
import com.unachi.inventario.modelo.Articulo;
import com.unachi.inventario.modelo.Existencia;

import java.sql.SQLException;
import java.util.List;

/**
 * Capa de Negocio — reglas del módulo "Gestión de Artículos".
 *
 * Reglas implementadas:
 *  - El nombre y el código de barra son obligatorios.
 *  - El código de barra debe ser único en el catálogo.
 *  - Al crear un artículo, se inicializa automáticamente su registro de
 *    existencia en cero (todo artículo debe tener una existencia asociada).
 *  - No se puede eliminar un artículo que aún tiene existencias mayores a cero.
 */
public class ArticuloService {

    private final ArticuloDAO articuloDAO = new ArticuloDAO();
    private final ExistenciaDAO existenciaDAO = new ExistenciaDAO();

    public List<Articulo> listar() throws SQLException {
        return articuloDAO.listarTodos();
    }

    public Articulo buscarPorId(int id) throws SQLException {
        return articuloDAO.buscarPorId(id);
    }

    public void crear(Articulo articulo) throws SQLException, NegocioException {
        validar(articulo, null);

        articuloDAO.crear(articulo);

        // Todo artículo nuevo inicia con existencia en cero.
        Existencia existenciaInicial = new Existencia();
        existenciaInicial.setArticuloId(articulo.getId());
        existenciaInicial.setCantidadExistencia(0);
        existenciaDAO.crear(existenciaInicial);
    }

    public void modificar(Articulo articulo) throws SQLException, NegocioException {
        validar(articulo, articulo.getId());
        articuloDAO.actualizar(articulo);
    }

    public void eliminar(int id) throws SQLException, NegocioException {
        Existencia existencia = existenciaDAO.buscarPorArticulo(id);

        if (existencia != null && existencia.getCantidadExistencia() > 0) {
            throw new NegocioException(
                    "No se puede eliminar el artículo porque aún tiene existencias registradas ("
                            + existencia.getCantidadExistencia() + " unidades)."
            );
        }

        existenciaDAO.eliminarPorArticulo(id);
        articuloDAO.eliminar(id);
    }

    private void validar(Articulo articulo, Integer idExcluir) throws SQLException, NegocioException {
        if (articulo.getNombre() == null || articulo.getNombre().trim().isEmpty()) {
            throw new NegocioException("El nombre del artículo es obligatorio.");
        }
        if (articulo.getCodigoBarra() == null || articulo.getCodigoBarra().trim().isEmpty()) {
            throw new NegocioException("El código de barra es obligatorio.");
        }
        if (articuloDAO.existeCodigoBarra(articulo.getCodigoBarra(), idExcluir)) {
            throw new NegocioException("Ya existe un artículo registrado con ese código de barra.");
        }
    }
}
