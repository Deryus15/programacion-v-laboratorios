# Laboratorio 5 — Gestión de Inventario (JSP en 3 capas)

Proyecto: `gestion-inventario-jsp/` (Maven, WAR, Jakarta Servlet, Tomcat 10).
Estado: **probado el 30/10/2026**, abre en http://localhost:8080/gestion-inventario/ con los 3 artículos de ejemplo.

## Antes de presentar (una sola vez por sesión)
1. Abrir XAMPP Control Panel y pulsar **Start** en **MySQL** (Apache no hace falta).
2. La base `inventario_db` ya está importada (script: `gestion-inventario-jsp/db/schema.sql`).
   Si hiciera falta reimportarla: phpMyAdmin → Importar → `schema.sql`.

## Correr en VS Code (extensión Community Server Connector)
1. Abrir la carpeta `gestion-inventario-jsp` en VS Code.
2. Compilar: panel **Maven** → `gestion-inventario` → Lifecycle → **package**
   (o en la terminal: `mvn clean package`). Genera `target/gestion-inventario.war`.
3. En el explorador, clic derecho en `target/gestion-inventario.war` → **Run on Server**.
4. Elegir **apache-tomcat-10.0.0** (ya está configurado en el panel **Servers**) y responder **No** a
   "optional deployment parameters". Esperar `Catalina.start Server startup` en la salida.
   (No usar Run on Server sobre el `pom.xml`: no despliega nada.)
5. Abrir http://localhost:8080/gestion-inventario/ (probado en VS Code el 30/10/2026).
6. Para detenerlo: panel **Servers** → clic derecho en el servidor → Stop.

## Verificación rápida
- `/gestion-inventario/articulos` lista: Arroz 1kg, Aceite vegetal 1L, Azúcar 1kg.
- `/gestion-inventario/existencias` muestra 50, 30 y 0 de existencia.

## Si algo falla
| Síntoma | Causa | Solución |
|---|---|---|
| Error de conexión / página en blanco | MySQL apagado | Start MySQL en XAMPP |
| `Address already in use: 8080` | Otro servidor en 8080 (p. ej. Spring del lab 4) | Detener el otro |
| 404 | WAR no publicado | Publish Server (Full) |
