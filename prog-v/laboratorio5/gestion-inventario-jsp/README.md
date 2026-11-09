# Sistema de Gestión de Inventario — JSP en 3 capas

Aplicación web en JSP/Servlets que implementa el **patrón de capas**
(Presentación · Negocio · Datos) para el caso de estudio del sistema de
gestión de inventario (Programación V, Eje Temático N.° 2).

## Módulos funcionales

- **Gestión de Artículos**: crear, listar, modificar y eliminar.
- **Gestión de Existencias**: registrar entradas y salidas de inventario.

## Entidades

| Entidad    | Campos                                                                 |
|------------|-------------------------------------------------------------------------|
| Articulo   | `id`, `codigoBarra`, `nombre`                                           |
| Existencia | `id`, `cantidadExistencia` (+ `articuloId` agregado, ver nota abajo)    |

> **Nota sobre `Existencia`:** el enunciado original solo pedía `id` y
> `cantidadExistencia`. Se agregó `articuloId` como llave foránea hacia
> `Articulo`, porque sin ese vínculo el sistema no tendría forma de saber
> a qué artículo pertenece cada cantidad registrada. Es una relación 1 a 1:
> cada artículo tiene exactamente un registro de existencia, que se crea
> automáticamente (en cero) al registrar el artículo.

## Arquitectura en tres capas

```
src/main/java/com/unachi/inventario/
├── modelo/            Entidades (Articulo, Existencia) — sin lógica
├── datos/              CAPA DE DATOS
│   ├── ConexionBD.java     Utilidad de conexión JDBC
│   ├── ArticuloDAO.java    SQL de la tabla articulo
│   └── ExistenciaDAO.java  SQL de la tabla existencia
├── negocio/            CAPA DE NEGOCIO
│   ├── ArticuloService.java    Reglas: campos obligatorios, código único,
│   │                           no eliminar con existencia > 0
│   ├── ExistenciaService.java  Reglas: cantidad > 0, no permitir salida
│   │                           mayor a la existencia disponible
│   └── NegocioException.java   Excepción para errores de regla de negocio
└── presentacion/        CAPA DE PRESENTACIÓN (controladores)
    ├── ArticuloServlet.java
    └── ExistenciaServlet.java

src/main/webapp/         CAPA DE PRESENTACIÓN (vistas)
├── index.jsp
├── articulos/{listar,formulario}.jsp
├── existencias/{listar,movimiento}.jsp
├── css/style.css
└── WEB-INF/web.xml
```

**Regla de dependencia entre capas:** Presentación → Negocio → Datos.
Los Servlets nunca llaman directamente a un DAO ni escriben SQL; los DAO
nunca validan reglas de negocio. Esto es justamente lo que se pidió
analizar en el Laboratorio N.° 5 del curso.

## Requisitos para ejecutar

- JDK 11 o superior
- Apache Tomcat 9 (o cualquier servidor compatible con Servlet 4.0 / JSP 2.3)
- MySQL 5.7+ u 8.x
- Maven 3.6+

## Pasos para desplegar

1. **Crear la base de datos:**
   ```bash
   mysql -u root -p < db/schema.sql
   ```

2. **Configurar la conexión** (si tu usuario/contraseña de MySQL son
   distintos a los valores por defecto) en:
   `src/main/java/com/unachi/inventario/datos/ConexionBD.java`

3. **Compilar el proyecto:**
   ```bash
   mvn clean package
   ```
   Esto genera `target/gestion-inventario.war`.

4. **Desplegar en Tomcat:**
   Copia el archivo `.war` a la carpeta `webapps/` de tu instalación de
   Tomcat, o despliégalo desde el Tomcat Manager.

5. **Abrir en el navegador:**
   ```
   http://localhost:8080/gestion-inventario/
   ```

## Flujo de uso sugerido

1. Entra a **Gestión de Artículos** y crea un artículo (código de barra +
   nombre). Al guardarlo, el sistema crea automáticamente su registro de
   existencia en cero.
2. Entra a **Gestión de Existencias** → **Registrar entrada / salida**,
   selecciona el artículo, el tipo de movimiento y la cantidad.
3. Verifica en el listado de existencias que la cantidad se actualizó.
4. Intenta registrar una salida mayor a la existencia disponible: el
   sistema debe rechazarla (regla de negocio en `ExistenciaService`).
5. Intenta eliminar un artículo con existencia mayor a cero: el sistema
   también debe rechazarlo (regla de negocio en `ArticuloService`).

## Compatibilidad Tomcat 10.1
Esta versión fue migrada a Jakarta EE para ejecutarse en Apache Tomcat 10.1.x.
- Servlet API: `jakarta.servlet-api` 6.0.0
- JSTL: Jakarta Tags/JSTL 3.x
- Mapeos principales: `/articulos` y `/existencias`
- URL esperada: `http://localhost:8080/gestion-inventario/articulos`
