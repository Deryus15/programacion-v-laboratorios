# Guía rápida: cómo leer el proyecto `gestion-inventario-jsp`

(Material del docente, descargado de Moodle el 30/10/2026.)

Esta guía te ayuda a entender **en qué orden leer el código** y **qué pasa realmente cuando haces clic** en la aplicación, sin perderte entre tantos archivos.

## 1. La idea clave: 3 capas, una sola dirección

El proyecto sigue el patrón de **arquitectura en capas**. Antes de leer una sola línea, memoriza esta regla, porque explica el 90% de las decisiones de diseño:

```
Presentación → Negocio → Datos
(Servlet/JSP) (Service) (DAO)
```

- Una capa **solo** le habla a la capa de abajo, nunca la salta.
- El Servlet nunca escribe SQL. El DAO nunca valida reglas de negocio.
- Si ves un Servlet llamando a un DAO directamente, o un DAO con un `if` de reglas del negocio, algo está mal ubicado.

## 2. Orden de lectura recomendado (no leas por carpetas, lee por flujo)

No empieces por `modelo/` ni recorras las carpetas en orden alfabético. Sigue el camino que sigue una petición real del usuario:

| Paso | Archivo | Qué buscar |
|---|---|---|
| 1 | `src/main/webapp/index.jsp` | El punto de entrada visual: dos enlaces, uno por módulo. |
| 2 | `WEB-INF/web.xml` | Solo define `index.jsp` como página de bienvenida. Los Servlets **no** se registran aquí. |
| 3 | `presentacion/ArticuloServlet.java` | Fíjate en `@WebServlet("/articulos")`: así se conecta la URL con la clase, sin pasar por `web.xml`. |
| 4 | `negocio/ArticuloService.java` | Aquí viven las reglas ("código único", "no eliminar con existencia > 0"). |
| 5 | `datos/ArticuloDAO.java` + `datos/ConexionBD.java` | El SQL real y la conexión JDBC. |
| 6 | `webapp/articulos/listar.jsp` y `formulario.jsp` | Lo que finalmente ve el usuario. |
| 7 | Repite 3-6 con `ExistenciaServlet` / `ExistenciaService` / `ExistenciaDAO`. |

**Por qué este orden:** así entiendes primero *qué dispara la acción* (una URL), luego *qué la controla* (Servlet), luego *qué la valida* (Service), luego *qué la guarda* (DAO), y por último *qué se muestra* (JSP). Es el mismo orden en que viaja una petición HTTP.

## 3. Cómo se conectan las piezas: `@WebServlet` en vez de `web.xml`

Un punto que confunde mucho al inicio: **no vas a encontrar los Servlets declarados en `web.xml`**. El proyecto usa anotaciones:

```java
@WebServlet("/articulos")
public class ArticuloServlet extends HttpServlet { ... }
```

Esto significa: *"cualquier petición a `/gestion-inventario/articulos` la atiende esta clase"*. Es el equivalente moderno a escribir `<servlet-mapping>` en XML.

## 4. El "router interno": el parámetro `accion`

Cada Servlet no es una sola función, es varias funciones combinadas usando el parámetro `accion` de la URL. En `ArticuloServlet.doGet()`:

```java
String accion = request.getParameter("accion");
switch (accion) {
case "nuevo": mostrarFormulario(...); break;
case "editar": ... buscarPorId(id) ...; break;
case "eliminar": eliminar(...); break;
default: listar(...); // sin parámetro "accion" -> listar
}
```

Por eso al leer una JSP vas a ver enlaces como:
```
${pageContext.request.contextPath}/articulos?accion=editar&id=${a.id}
```
Ese `?accion=editar&id=5` es literalmente el interruptor que decide qué método interno del Servlet se ejecuta.

**Regla práctica:** `doGet` atiende todo lo que es "ver algo" (listar, mostrar formulario, eliminar); `doPost` atiende "guardar algo" (crear o modificar). Por eso el formulario HTML del `formulario.jsp` envía con `method="post"` hacia la misma URL `/articulos`.

## 5. Trazar un caso completo: "crear un artículo nuevo"

Sigue esta secuencia con el dedo sobre el código, es la mejor forma de entender el patrón:

1. **Usuario hace clic** en "+ Nuevo artículo" en `articulos/listar.jsp` → GET a `/articulos?accion=nuevo`.
2. **`ArticuloServlet.doGet()`** ve `accion=nuevo` → llama a `mostrarFormulario(request, response, null)` → hace `forward` a `formulario.jsp` (formulario vacío).
3. **Usuario llena el formulario** y presiona "Guardar" → el `<form>` hace **POST** a `/articulos`.
4. **`ArticuloServlet.doPost()`** llama a `guardar(...)`. Como no viene `id`, crea un objeto `Articulo` nuevo.
5. **`guardar()`** llama a `articuloService.crear(articulo)` — el Servlet **delega**, no valida nada él mismo.
6. **`ArticuloService.crear()`**:
   - Llama a `validar(...)` (nombre y código obligatorios, código único).
   - Si pasa la validación, llama a `articuloDAO.crear(articulo)`.
   - **Además** crea automáticamente una `Existencia` en cero para ese artículo (`existenciaDAO.crear(...)`). Este paso es fácil de pasar por alto si no lees el Service completo.
7. **`ArticuloDAO.crear()`** ejecuta el `INSERT` real con `PreparedStatement` y recupera el `id` autogenerado.
8. Si todo salió bien, el Servlet hace `response.sendRedirect(".../articulos")` → nueva petición GET → vuelve al paso 1, ahora con el artículo en la lista.
9. Si `ArticuloService` lanza `NegocioException` (ej. código duplicado), el Servlet **atrapa esa excepción**, guarda el mensaje en `request.setAttribute("error", ...)` y hace `forward` de vuelta al mismo formulario, mostrando el error.

> Practica lo mismo con el flujo de **registrar una salida de inventario** en `ExistenciaServlet` / `ExistenciaService.registrarSalida()`: ahí está la regla de negocio más importante del sistema (no dejar el inventario en negativo).

## 6. `forward` vs `redirect`: por qué el código usa uno u otro

Vas a ver dos formas de terminar un método en los Servlets. No es al azar:

| Cuándo se usa | Método | Por qué |
|---|---|---|
| Mostrar una vista con datos que acabas de calcular (listar, mostrar error) | `request.getRequestDispatcher(...).forward(...)` | Reutiliza la misma petición; los `request.setAttribute(...)` siguen disponibles en la JSP. |
| Después de guardar/eliminar con éxito | `response.sendRedirect(...)` | Fuerza una **nueva** petición GET. Evita que si el usuario recarga la página (F5) se reenvíe el mismo POST y se duplique el registro. |

## 7. Cómo leer las JSP sin conocer JSTL de memoria

Las vistas usan la librería **JSTL** (`<%@ taglib ... prefix="c" %>`). Solo necesitas reconocer 3 etiquetas para leer casi cualquier JSP del proyecto:

- `<c:forEach var="a" items="${articulos}"> ... </c:forEach>` → es un `for` que recorre la lista que el Servlet puso con `setAttribute("articulos", ...)`.
- `<c:if test="${not empty error}"> ... </c:if>` → un `if` que solo se muestra si el Servlet mandó un atributo `error`.
- `${a.nombre}` → llama al método `getNombre()` del objeto `a` (esto se llama *Expression Language*, no es magia: `${a.nombre}` = `a.getNombre()`).

**Truco para leer cualquier JSP rápido:** busca primero qué `request.setAttribute(...)` hizo el Servlet antes del `forward`; esos nombres (`articulos`, `articulo`, `error`) son exactamente lo que vas a encontrar dentro de `${...}` en la JSP.

## 8. La capa de datos: qué mirar y qué ignorar por ahora

En `datos/` no necesitas memorizar SQL, solo reconocer el patrón repetido en cada método:

```java
try (Connection con = ConexionBD.obtenerConexion();
     PreparedStatement ps = con.prepareStatement(sql)) {
    ps.setString(1, valor); // llena los "?" del SQL en orden
    ps.executeUpdate();     // o executeQuery() si es un SELECT
}
```

- `ConexionBD.obtenerConexion()` es el único lugar donde se abre una conexión a MySQL — si algo falla de base de datos, empieza a revisar aquí (usuario/contraseña/URL).
- El `try (...)` con paréntesis es un *try-with-resources*: cierra la conexión automáticamente al terminar, aunque haya un error.
- Los `?` en el SQL y los `ps.setX(posición, valor)` deben coincidir en cantidad y orden — es el error más común al modificar un DAO.

## 9. Antes de tocar el código: revisa la relación Articulo–Existencia

El `README.md` explica algo que no es obvio leyendo solo las clases: **cada `Articulo` tiene automáticamente un `Existencia` asociado (relación 1 a 1), creado en cero al momento de crear el artículo.** Si vas a modificar `ArticuloService` o `ExistenciaService`, ten esto presente: son dos tablas separadas pero siempre viajan juntas.

## 10. Checklist para tu análisis del laboratorio

Antes de entregar tu análisis, verifica que puedas responder esto sin ver el código:

- [ ] ¿Qué clase recibe la petición cuando el navegador pide `/articulos?accion=editar&id=3`?
- [ ] ¿En qué archivo está la regla "no eliminar un artículo con existencia > 0" y por qué **no** está en el DAO?
- [ ] ¿Qué diferencia hay entre lo que pasa si guardas con éxito vs. si `NegocioException` se lanza?
- [ ] ¿Por qué crear un artículo también inserta una fila en la tabla `existencia`?
- [ ] Si cambiaras el nombre del parámetro `accion` por `action`, ¿qué archivos tendrías que tocar?

Si puedes responder las cinco, ya entendiste el flujo completo de la aplicación.
