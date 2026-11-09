# Laboratorio 7 — Escenario cliente-servidor ReservaFE (prototipo)

**Se ejecuta:** sí. **Necesita XAMPP:** no (la base es en memoria). **JDK:** 21 (o 8 con `prototipo-java8`).
Puerto: **3000**. Estado: probado el 30/10/2026.

## Orden para correrlo (Run and Debug)
1. **Lab7 - 1) Servidor (4 hilos)** → debe decir `Servidor de reservas en http://localhost:3000`. Dejarlo abierto.
2. **Lab7 - 2) Cliente consola** → 1.ª vez `201`; repetir con otro nombre → `409` (mismo laboratorio y hora).
3. **Lab7 - 3) Carga (/api/lento x20)** → mide tiempos. Medido: 10 solicitudes de 500 ms con 4 hilos → la más lenta tarda ~1.6 s (se encolan en tandas de 4).
4. Navegador: http://localhost:3000/api/espacios y /api/estado
5. Para detener: botón ■ del servidor.

## Códigos que debe dar el POST /api/reservas (Postman)
| Cuerpo | Código |
|---|---|
| `{"espacioId":2,"fecha":"2026-10-21","hora":"10:00","solicitante":"Tu nombre"}` | 201 |
| el mismo otra vez | 409 |
| `espacioId` 9 | 404 |
| `{"espacioId":2}` | 400 |

## Desde terminal (carpeta `prototipo-java21/src/main/java`)
```
java Servidor.java 4
java Cliente.java "Ana Perez"
java Carga.java "/api/lento?ms=500" 20
```
Si las tildes salen mal: `chcp 65001` antes (la terminal de VS Code de este workspace ya lo hace).

## Versión JDK 8
`prototipo-java8/` trae los `.class` compilados: `java Servidor 4` (ver `LEEME.txt`).

## Documentos
`enunciado/Laboratorio7.pdf` — guía del docente.
