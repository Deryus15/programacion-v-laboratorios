# Laboratorio 8 — Requisitos cliente-servidor: ReservasLabAPI

**Se ejecuta:** sí. **Necesita XAMPP:** no (datos en memoria). **JDK:** 17 (compatible con 8).
Puerto: **8080** (no correr a la vez que el Tomcat del lab 5 o el Spring Boot del lab 4).
Estado: probado el 30/10/2026 (demo de 9 casos: 201, 409, 400, 404, 200, 204, 401 y carga 20/20).

## Correrlo (Run and Debug)
1. **Lab8 - 1) Servidor API (puerto 8080)** — queda escuchando.
2. **Lab8 - 2) Cliente (demo automática)** — ejecuta los 9 casos y muestra HTTP, tiempo y resultado.
   o **Lab8 - 2) Cliente (menú)** para usarlo a mano.
3. Detener el servidor y volver a lanzar el cliente → debe decir "No se pudo conectar" (RNF-05).

## Alternativa con un clic
Doble clic en `ReservasLabAPI/ejecutar.bat` (compila, abre el servidor en otra ventana y lanza el cliente).

## Postman
Importar `ReservasLabAPI/ReservasLabAPI.postman_collection.json`. Para POST/PUT/DELETE usar el encabezado `X-API-KEY: unachi-prog5`.

## Documentos
- `enunciado/Laboratorio8.pdf` — guía (versión Eclipse).
- `ReservasLabAPI/CONTRATO_API.md` — endpoints y códigos.
- `ReservasLabAPI/README.md` — dónde está cada requisito (RF/RNF) en el código.
