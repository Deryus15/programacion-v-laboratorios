package com.unachi.inventario.presentacion;

import com.unachi.inventario.modelo.Articulo;
import com.unachi.inventario.negocio.ArticuloService;
import com.unachi.inventario.negocio.NegocioException;

import jakarta.servlet.RequestDispatcher;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.sql.SQLException;

/**
 * Capa de Presentación — controlador HTTP del módulo "Gestión de Artículos".
 *
 * Este servlet NO contiene reglas de negocio ni SQL: solo recibe la
 * solicitud HTTP, delega en ArticuloService (capa de negocio) y decide
 * a qué JSP reenviar la respuesta.
 *
 * Acciones soportadas (parámetro "accion"):
 *   - listar   (por defecto)  -> GET  /articulos
 *   - nuevo                   -> GET  /articulos?accion=nuevo
 *   - editar                  -> GET  /articulos?accion=editar&id=..
 *   - eliminar                -> GET  /articulos?accion=eliminar&id=..
 *   - guardar (crear/editar)  -> POST /articulos
 */
@WebServlet("/articulos")
public class ArticuloServlet extends HttpServlet {

    private final ArticuloService articuloService = new ArticuloService();

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        String accion = request.getParameter("accion");
        if (accion == null) {
            accion = "listar";
        }

        try {
            switch (accion) {
                case "nuevo":
                    mostrarFormulario(request, response, null);
                    break;
                case "editar":
                    int id = Integer.parseInt(request.getParameter("id"));
                    Articulo articulo = articuloService.buscarPorId(id);
                    mostrarFormulario(request, response, articulo);
                    break;
                case "eliminar":
                    eliminar(request, response);
                    break;
                default:
                    listar(request, response);
            }
        } catch (SQLException e) {
            throw new ServletException("Error de base de datos en ArticuloServlet", e);
        }
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        guardar(request, response);
    }

    // ---------------------------------------------------------------
    // Listar
    // ---------------------------------------------------------------
    private void listar(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException, SQLException {

        request.setAttribute("articulos", articuloService.listar());
        RequestDispatcher rd = request.getRequestDispatcher("/articulos/listar.jsp");
        rd.forward(request, response);
    }

    // ---------------------------------------------------------------
    // Mostrar formulario (nuevo o editar)
    // ---------------------------------------------------------------
    private void mostrarFormulario(HttpServletRequest request, HttpServletResponse response, Articulo articulo)
            throws ServletException, IOException {

        request.setAttribute("articulo", articulo);
        RequestDispatcher rd = request.getRequestDispatcher("/articulos/formulario.jsp");
        rd.forward(request, response);
    }

    // ---------------------------------------------------------------
    // Guardar (crear o modificar según venga o no el id)
    // ---------------------------------------------------------------
    private void guardar(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        String idParam = request.getParameter("id");
        String codigoBarra = request.getParameter("codigoBarra");
        String nombre = request.getParameter("nombre");

        Articulo articulo = new Articulo();
        articulo.setCodigoBarra(codigoBarra);
        articulo.setNombre(nombre);

        try {
            if (idParam != null && !idParam.trim().isEmpty()) {
                articulo.setId(Integer.parseInt(idParam));
                articuloService.modificar(articulo);
            } else {
                articuloService.crear(articulo);
            }
            response.sendRedirect(request.getContextPath() + "/articulos");

        } catch (NegocioException e) {
            // Regla de negocio violada: se muestra el error en el mismo formulario.
            request.setAttribute("error", e.getMessage());
            request.setAttribute("articulo", articulo);
            RequestDispatcher rd = request.getRequestDispatcher("/articulos/formulario.jsp");
            rd.forward(request, response);

        } catch (SQLException e) {
            throw new ServletException("Error de base de datos al guardar el artículo", e);
        }
    }

    // ---------------------------------------------------------------
    // Eliminar
    // ---------------------------------------------------------------
    private void eliminar(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException, SQLException {

        int id = Integer.parseInt(request.getParameter("id"));

        try {
            articuloService.eliminar(id);
            response.sendRedirect(request.getContextPath() + "/articulos");

        } catch (NegocioException e) {
            // Ej.: intentar eliminar un artículo con existencias > 0.
            request.setAttribute("error", e.getMessage());
            request.setAttribute("articulos", articuloService.listar());
            RequestDispatcher rd = request.getRequestDispatcher("/articulos/listar.jsp");
            rd.forward(request, response);
        }
    }
}
