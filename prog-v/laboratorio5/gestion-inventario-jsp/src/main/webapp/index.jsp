<%@ page contentType="text/html;charset=UTF-8" pageEncoding="UTF-8" %>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Sistema de Gestión de Inventario</title>
    <link rel="stylesheet" href="${pageContext.request.contextPath}/css/style.css">
</head>
<body>
<div class="contenedor">
    <header class="encabezado encabezado-centrado">
        <h1>Sistema de Gestión de Inventario</h1>
        <p class="subtitulo">Arquitectura en tres capas — Presentación · Negocio · Datos</p>
    </header>

    <nav class="menu-principal">
        <a class="tarjeta-menu" href="${pageContext.request.contextPath}/articulos">
            <h2>Gestión de Artículos</h2>
            <p>Crear, listar, modificar y eliminar artículos del catálogo.</p>
        </a>
        <a class="tarjeta-menu" href="${pageContext.request.contextPath}/existencias">
            <h2>Gestión de Existencias</h2>
            <p>Consultar existencias y registrar entradas o salidas de inventario.</p>
        </a>
    </nav>
</div>
</body>
</html>
