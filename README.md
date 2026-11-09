# Programación V — Portafolio de laboratorios

**Estudiante:** Dereck Martinez · **Profesor:** Alexis Flores · Universidad Autónoma de Chiriquí (UNACHI)

Portafolio web que reúne en un solo lugar los 8 laboratorios de Programación V y el proyecto PagaYa: descripción, código fuente, demostración en vivo conectada a cada servidor y documentos originales.

## Ver el portafolio

**Modo completo (ejecuta los laboratorios):** requiere Node.js 18+, JDK 17 y, para los labs 4 y 7, JDK 21.

```
node portafolio/server.js        # o doble clic en iniciar-portafolio.bat
# abre http://localhost:5173
```

Desde la página puedes iniciar y detener cada servidor, ejecutar los programas de consola de los labs 1 y 2 y lanzar peticiones a las APIs de los labs 7 y 8. Para los labs 4 y 5 hace falta MySQL de XAMPP (la página intenta encenderlo) y las bases de `prog-v/laboratorio4/mvc-estudiantes/database.sql` y `prog-v/laboratorio5/gestion-inventario-jsp/db/schema.sql`.

**Modo estático:** basta con abrir `portafolio/web/index.html` (o publicarlo en GitHub Pages). Muestra descripciones, código y salidas de referencia.

## Contenido

| Lab | Tema |
|---|---|
| 1 | Entorno de desarrollo, Maven y MVC base |
| 2 | Maestro-Esclavo, Pipe-Filter y taller de POO |
| 3 | Patrones de comunicación (bus de eventos, Kafka) |
| 4 | MVC con Spring Boot + MySQL |
| 5 | Inventario con JSP en 3 capas (Tomcat 10) |
| 6 | Especificación de requisitos (SRS) |
| 7 | Cliente-servidor ReservaFE (puerto 3000) |
| 8 | ReservasLabAPI, API REST (puerto 8080) |
| — | Proyecto PagaYa (en desarrollo): [repositorio propio](https://github.com/Deryus15/proyecto-pagaya) |

Los labs 4, 5 y 8 usan el puerto 8080: el portafolio detiene uno al iniciar otro.

## Estructura

```
portafolio/   web (HTML/CSS/JS), server.js (lanzador local sin dependencias) y scripts/
prog-v/       código de cada laboratorio (laboratorio1 … laboratorio8, proyecto-pagaya)
```

Tras modificar código de un lab, regenera el visor con `node portafolio/scripts/build-codigo.js`.

> Nota: en `application.properties` del lab 4 la contraseña de la base local se publica como `<tu-contraseña-local>` en el visor; ajústala en tu copia.
