# ReservasLabAPI — Ejemplo Semana 10 (Programación V, UNACHI)

Ejemplo de **arquitectura cliente-servidor** en Java 8 donde cada requisito
(funcional y no funcional) se puede señalar en el código.
No usa librerías externas: el servidor es el `HttpServer` incluido en el JDK.

## Estructura (capas dentro del servidor)

```
src/reservas/
├── modelo/     Reserva.java                 → entidad
├── datos/      RepositorioReservas.java     → acceso a datos (en memoria)
├── negocio/    ServicioReservas.java        → reglas RF-01..RF-07
│               ValidacionException.java
├── servidor/   ServidorReservas.java        → main del SERVIDOR (puerto 8080)
│               ReservasHandler.java         → rutas HTTP + RNF-01/02/03
│               Json.java                    → conversión JSON sin librerías
└── cliente/    ClienteConsola.java          → main del CLIENTE (menú + demo)
```

## Dónde está cada requisito

| Requisito | Descripción | Archivo |
|-----------|-------------|---------|
| RF-01..05 | CRUD de reservas | `ServicioReservas`, `ReservasHandler` |
| RF-06 | Solo LAB-1, LAB-2, LAB-3 | `ServicioReservas.validarDatos` |
| RF-07 | Sin choques de horario | `ServicioReservas.validarChoque` |
| RNF-01 Seguridad | `X-API-KEY` para escribir | `ReservasHandler.handle` |
| RNF-02 Rendimiento | ≤ 500 ms, se registra el tiempo | `ReservasHandler` (bitácora) y opción 6 del cliente |
| RNF-03 Interoperabilidad | JSON + códigos HTTP estándar | `Json`, `ReservasHandler.responder` |
| RNF-04 Concurrencia | 10 hilos, estructuras thread-safe | `ServidorReservas`, `RepositorioReservas` |
| RNF-05 Disponibilidad percibida | Timeouts y manejo de servidor caído | `ClienteConsola.enviar` |

## Ejecutar en NetBeans 8.1 (JDK 8)

1. *File → New Project → Java → Java Application*, nombre `ReservasLabAPI`, **desmarcar** "Create Main Class".
2. Copiar la carpeta `src/reservas` dentro de `Source Packages`.
3. *Project Properties → Sources → Encoding: UTF-8*.
4. Clic derecho en `ServidorReservas.java` → **Run File** (queda escuchando).
5. Clic derecho en `ClienteConsola.java` → **Run File** (se abre una segunda pestaña de salida con el menú).

## Ejecutar desde consola

```bash
# Windows: ejecutar.bat   |   Linux/Mac: ./ejecutar.sh
javac -encoding UTF-8 -d build src/reservas/*/*.java
java -cp build reservas.servidor.ServidorReservas        # terminal 1
java -cp build reservas.cliente.ClienteConsola            # terminal 2 (menú)
java -cp build reservas.cliente.ClienteConsola demo       # terminal 2 (demo automática)
```

## Probar con Postman

Importar `ReservasLabAPI.postman_collection.json` (incluye los 9 casos de la demo).

## Para mostrar en clase

1. Ejecute la **demo** y señale en la bitácora del servidor el código HTTP, el tiempo y el hilo de cada solicitud.
2. Detenga el servidor y ejecute el cliente: aparece *"No se pudo conectar"* en lugar de un error sin control (RNF-05).
3. Cambie `HILOS = 1` en `ServidorReservas` y repita la prueba de carga: compare tiempos (RNF-04).
