# Contrato de la API — Reservas de Laboratorios (v1)

**URL base:** `http://localhost:8080/api/reservas`
**Formato:** JSON (UTF-8) en solicitudes y respuestas
**Autenticación:** encabezado `X-API-KEY: unachi-prog5` en POST, PUT y DELETE (RNF-01)

## Recurso `Reserva`

| Campo        | Tipo    | Obligatorio | Regla                                   |
|--------------|---------|-------------|-----------------------------------------|
| id           | entero  | lo asigna el servidor | autoincremental              |
| laboratorio  | texto   | sí          | `LAB-1`, `LAB-2` o `LAB-3` (RF-06)       |
| solicitante  | texto   | sí          | no vacío                                 |
| fecha        | texto   | sí          | `yyyy-MM-dd`                             |
| horaInicio   | texto   | sí          | `HH:mm`, menor que horaFin               |
| horaFin      | texto   | sí          | `HH:mm`                                  |
| estado       | texto   | lo asigna el servidor | `ACTIVA`                       |

## Endpoints

| RF    | Método | Ruta                  | Cuerpo   | Éxito             | Errores posibles   |
|-------|--------|-----------------------|----------|-------------------|--------------------|
| RF-01 | GET    | `/api/reservas`       | —        | 200 + lista       | 500                |
| RF-02 | GET    | `/api/reservas/{id}`  | —        | 200 + reserva     | 400, 404           |
| RF-03 | POST   | `/api/reservas`       | Reserva  | 201 + reserva     | 400, 401, 409      |
| RF-04 | PUT    | `/api/reservas/{id}`  | Reserva  | 200 + reserva     | 400, 401, 404, 409 |
| RF-05 | DELETE | `/api/reservas/{id}`  | —        | 204 (sin cuerpo)  | 401, 404           |

## Ejemplo — crear reserva

Solicitud:
```http
POST /api/reservas HTTP/1.1
Content-Type: application/json
X-API-KEY: unachi-prog5

{"laboratorio":"LAB-3","solicitante":"Ana Pérez","fecha":"2026-10-24","horaInicio":"08:00","horaFin":"10:00"}
```

Respuesta `201 Created`:
```json
{"id":4,"laboratorio":"LAB-3","solicitante":"Ana Pérez","fecha":"2026-10-24","horaInicio":"08:00","horaFin":"10:00","estado":"ACTIVA"}
```

## Formato de error (igual para todos los endpoints)

```json
{"error":409,"mensaje":"Choque de horario con la reserva #1 (07:00-08:35)"}
```

| Código | Significado en esta API                              |
|--------|------------------------------------------------------|
| 400    | Datos incompletos o con formato inválido             |
| 401    | Falta o es incorrecta la `X-API-KEY`                 |
| 404    | La reserva no existe                                 |
| 405    | Método no permitido para esa ruta                    |
| 409    | Choque de horario en el mismo laboratorio (RF-07)    |
| 500    | Error interno del servidor                           |
