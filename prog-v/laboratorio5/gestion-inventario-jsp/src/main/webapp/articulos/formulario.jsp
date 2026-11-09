<%@ page contentType="text/html;charset=UTF-8" pageEncoding="UTF-8" %>
<%@ taglib uri="jakarta.tags.core" prefix="c" %>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>${empty articulo.id ? 'Nuevo artículo' : 'Editar artículo'}</title>
    <link rel="stylesheet" href="${pageContext.request.contextPath}/css/style.css">
</head>
<body>
<div class="contenedor contenedor-angosto">
    <h1>${empty articulo.id ? 'Nuevo artículo' : 'Editar artículo'}</h1>

    <c:if test="${not empty error}">
        <div class="alerta alerta-error">${error}</div>
    </c:if>

    <form method="post" action="${pageContext.request.contextPath}/articulos" class="formulario">

        <c:if test="${not empty articulo.id}">
            <input type="hidden" name="id" value="${articulo.id}">
        </c:if>

        <label for="codigoBarra">Código de barra</label>
        <input type="text" id="codigoBarra" name="codigoBarra"
               value="${articulo.codigoBarra}" required maxlength="50">

        <label for="nombre">Nombre</label>
        <input type="text" id="nombre" name="nombre"
               value="${articulo.nombre}" required maxlength="150">

        <div class="acciones-formulario">
            <button type="submit" class="boton boton-primario">Guardar</button>
            <a class="boton boton-secundario" href="${pageContext.request.contextPath}/articulos">Cancelar</a>
        </div>
    </form>
</div>
</body>
</html>
