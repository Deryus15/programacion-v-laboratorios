<%@ page contentType="text/html;charset=UTF-8" pageEncoding="UTF-8" %>
<%@ taglib uri="jakarta.tags.core" prefix="c" %>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Registrar movimiento de inventario</title>
    <link rel="stylesheet" href="${pageContext.request.contextPath}/css/style.css">
</head>
<body>
<div class="contenedor contenedor-angosto">
    <h1>Registrar entrada o salida</h1>

    <c:if test="${not empty error}">
        <div class="alerta alerta-error">${error}</div>
    </c:if>

    <form method="post" action="${pageContext.request.contextPath}/existencias" class="formulario">

        <label for="articuloId">Artículo</label>
        <select id="articuloId" name="articuloId" required>
            <option value="">-- Seleccione un artículo --</option>
            <c:forEach var="a" items="${articulos}">
                <option value="${a.id}">${a.nombre} (${a.codigoBarra})</option>
            </c:forEach>
        </select>

        <label for="tipo">Tipo de movimiento</label>
        <select id="tipo" name="tipo" required>
            <option value="entrada">Entrada</option>
            <option value="salida">Salida</option>
        </select>

        <label for="cantidad">Cantidad</label>
        <input type="number" id="cantidad" name="cantidad" min="1" required>

        <div class="acciones-formulario">
            <button type="submit" class="boton boton-primario">Registrar</button>
            <a class="boton boton-secundario" href="${pageContext.request.contextPath}/existencias">Cancelar</a>
        </div>
    </form>
</div>
</body>
</html>
