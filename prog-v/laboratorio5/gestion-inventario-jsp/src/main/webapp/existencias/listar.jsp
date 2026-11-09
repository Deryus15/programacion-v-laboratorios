<%@ page contentType="text/html;charset=UTF-8" pageEncoding="UTF-8" %>
<%@ taglib uri="jakarta.tags.core" prefix="c" %>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Existencias — Inventario</title>
    <link rel="stylesheet" href="${pageContext.request.contextPath}/css/style.css">
</head>
<body>
<div class="contenedor">
    <header class="encabezado">
        <h1>Gestión de Existencias</h1>
        <a class="boton boton-primario" href="${pageContext.request.contextPath}/existencias?accion=movimiento">
            + Registrar entrada / salida
        </a>
    </header>

    <c:if test="${not empty error}">
        <div class="alerta alerta-error">${error}</div>
    </c:if>

    <table class="tabla">
        <thead>
        <tr>
            <th>Código de barra</th>
            <th>Artículo</th>
            <th>Existencia actual</th>
        </tr>
        </thead>
        <tbody>
        <c:forEach var="e" items="${existencias}">
            <tr>
                <td>${e.codigoBarraArticulo}</td>
                <td>${e.nombreArticulo}</td>
                <td class="${e.cantidadExistencia == 0 ? 'texto-alerta' : ''}">
                    ${e.cantidadExistencia}
                </td>
            </tr>
        </c:forEach>
        <c:if test="${empty existencias}">
            <tr>
                <td colspan="3" class="vacio">No hay existencias registradas.</td>
            </tr>
        </c:if>
        </tbody>
    </table>

    <p class="enlace-volver">
        <a href="${pageContext.request.contextPath}/index.jsp">&larr; Volver al menú principal</a>
    </p>
</div>
</body>
</html>
