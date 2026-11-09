package com.unachi.inventario.presentacion;

import com.unachi.inventario.negocio.ArticuloService;
import com.unachi.inventario.negocio.ExistenciaService;
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
 * Capa de Presentación — controlador HTTP del módulo "Gestión de Existencias".
 *
 * Acciones soportadas (parámetro "accion"):
 *   - listar     (por defecto) -> GET  /existencias
 *   - movimiento               -> GET  /existencias?accion=movimiento
 *   - registrar (entrada/salida) -> POST /existencias
 */
@WebServlet("/existencias")
public class ExistenciaServlet extends HttpServlet {

    private final ExistenciaService existenciaService = new ExistenciaService();
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
                case "movimiento":
                    mostrarFormularioMovimiento(request, response, null);
                    break;
                default:
                    listar(request, response);
            }
        } catch (SQLException e) {
            throw new ServletException("Error de base de datos en ExistenciaServlet", e);
        }
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        registrarMovimiento(request, response);
    }

    // ---------------------------------------------------------------
    // Listar existencias
    // ---------------------------------------------------------------
    private void listar(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException, SQLException {

        request.setAttribute("existencias", existenciaService.listar());
        RequestDispatcher rd = request.getRequestDispatcher("/existencias/listar.jsp");
        rd.forward(request, response);
    }

    // ---------------------------------------------------------------
    // Formulario de entrada / salida
    // ---------------------------------------------------------------
    private void mostrarFormularioMovimiento(HttpServletRequest request, HttpServletResponse response, String error)
            throws ServletException, IOException, SQLException {

        request.setAttribute("articulos", articuloService.listar());
        if (error != null) {
            request.setAttribute("error", error);
        }
        RequestDispatcher rd = request.getRequestDispatcher("/existencias/movimiento.jsp");
        rd.forward(request, response);
    }

    // ---------------------------------------------------------------
    // Registrar entrada o salida
    // ---------------------------------------------------------------
    private void registrarMovimiento(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        try {
            int articuloId = Integer.parseInt(request.getParameter("articuloId"));
            int cantidad = Integer.parseInt(request.getParameter("cantidad"));
            String tipo = request.getParameter("tipo"); // "entrada" o "salida"

            if ("entrada".equals(tipo)) {
                existenciaService.registrarEntrada(articuloId, cantidad);
            } else {
                existenciaService.registrarSalida(articuloId, cantidad);
            }

            response.sendRedirect(request.getContextPath() + "/existencias");

        } catch (NumberFormatException e) {
            manejarError(request, response, "Debe ingresar valores numéricos válidos.");

        } catch (NegocioException e) {
            manejarError(request, response, e.getMessage());

        } catch (SQLException e) {
            throw new ServletException("Error de base de datos al registrar el movimiento", e);
        }
    }

    private void manejarError(HttpServletRequest request, HttpServletResponse response, String mensaje)
            throws ServletException, IOException {
        try {
            mostrarFormularioMovimiento(request, response, mensaje);
        } catch (SQLException ex) {
            throw new ServletException("Error de base de datos al recargar el formulario", ex);
        }
    }
}
