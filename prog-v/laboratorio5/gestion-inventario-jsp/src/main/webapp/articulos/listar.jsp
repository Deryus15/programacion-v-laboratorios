<%@ page contentType="text/html;charset=UTF-8" pageEncoding="UTF-8" %>
<%@ taglib uri="jakarta.tags.core" prefix="c" %>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Artículos — Inventario</title>
    <link rel="stylesheet" href="${pageContext.request.contextPath}/css/style.css">
</head>
<body>
<div class="contenedor">
    <header class="encabezado">
        <h1>Gestión de Artículos</h1>
        <a class="boton boton-primario" href="${pageContext.request.contextPath}/articulos?accion=nuevo">
            + Nuevo artículo
        </a>
    </header>

    <c:if test="${not empty error}">
        <div class="alerta alerta-error">${error}</div>
    </c:if>

    <table class="tabla">
        <thead>
        <tr>
            <th>Código de barra</th>
            <th>Nombre</th>
            <th>Acciones</th>
        </tr>
        </thead>
        <tbody>
        <c:forEach var="a" items="${articulos}">
            <tr>
                <td>${a.codigoBarra}</td>
                <td>${a.nombre}</td>
                <td class="acciones">
                    <a href="${pageContext.request.contextPath}/articulos?accion=editar&id=${a.id}">Editar</a>
                    <a href="${pageContext.request.contextPath}/articulos?accion=eliminar&id=${a.id}"
                       class="enlace-peligro"
                       onclick="return confirm('¿Eliminar este artículo?');">Eliminar</a>
                </td>
            </tr>
        </c:forEach>
        <c:if test="${empty articulos}">
            <tr>
                <td colspan="3" class="vacio">No hay artículos registrados.</td>
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
