# Contrato de la API — Parqueo (G2)

Integrantes: Cristian Valdes · Dereck Martinez · Samuel Suira

El servidor del parqueo (Java 8, puerto **8081**) tiene dos contratos: el que **ofrece** a su página (A) y el que **usa** de PagaYa (B).

**Regla de tarifa (capa service, `TarifaService`):** `fracciones = ceil(minutos / 30)` (mínimo 1); cada día completo de 24 h cobra el `tope_diario`; el resto del día cobra `min(fracciones × precio_fraccion, tope_diario)`. Con B/. 0.50 por fracción y tope B/. 6.00: 95 min → 4 fracciones → B/. 2.00; 10 h → B/. 6.00; 26 h → B/. 6.00 + B/. 1.00 = B/. 7.00.

## A. API propia del negocio (página → servidor del grupo, `http://localhost:8081`)

| Método | Ruta | Datos que recibe | Respuesta de éxito | Errores propios |
|---|---|---|---|---|
| POST | `/api/entradas` | `placa` | 201, ticket `DENTRO` con `id` y `entrada`; cabecera `Location` | 400 placa inválida · 409 la placa ya está dentro |
| GET | `/api/tickets/{id}` | — | 200, ticket con minutos y monto calculados; si está `ESPERANDO_PAGO` consulta a PagaYa y actualiza el estado | 404 |
| GET | `/api/tickets?estado=DENTRO` | `estado` o `placa` (opcional) | 200, tickets ordenados por entrada | 400 estado desconocido |
| POST | `/api/salidas` | `placa`, `telefonoCliente` | 201, ticket `ESPERANDO_PAGO` con `minutos`, `monto`, `cobroPagaya` y `venceEn` (si ya había un cobro pendiente, 200 con el mismo) | 400 datos · 404 la placa no está dentro · 422 teléfono sin PagaYa / monto sobre el tope · 503 PagaYa no responde |
| POST | `/api/tickets/{id}/barrera` | — | 200, `ABIERTA`; el ticket pasa a `FUERA` | 404 · 409 cobro no `PAGADO` (queda `DENEGADA` en bitácora) · 503 PagaYa no responde |
| POST | `/api/tickets/{id}/cancelar-salida` | — | 200, ticket vuelve a `DENTRO` | 404 · 409 ya pagado o no está esperando pago · 503 |

Formato de error: `{"error": "mensaje del negocio"}` con el código HTTP que corresponda.

Estados del ticket: `DENTRO → ESPERANDO_PAGO → PAGADO → FUERA`; `ESPERANDO_PAGO → DENTRO` si el cobro se rechaza, vence o se cancela.

## B. Llamadas a PagaYa (servidor del grupo → PagaYa, `http://<IP-DOCENTE>:8080`, cabecera `X-Api-Key`)

La API Key y la URL se leen de `config.properties` (fuera de Git); nunca van en el código ni en la página.

| Momento | Llamada a PagaYa | Si responde bien | Si falla |
|---|---|---|---|
| Registrar salida | `POST /api/cobros` con `Idempotency-Key: parqueo-ticket-{id}-{intento}` y cuerpo `{telefonoCliente, monto, descripcion: "Parqueo {placa}", referencia: "TK-{id}"}` | Guarda `cobro_pagaya` y `vence_en`; ticket `ESPERANDO_PAGO` | **404** teléfono sin cuenta → el ticket sigue `DENTRO` y responde **422** «tu número no tiene PagaYa». **422** monto sobre el tope → ídem. **401** API Key mala → se registra y responde **503**. **Sin respuesta / timeout** → el ticket sigue `DENTRO` y responde **503**, sin caerse |
| Reintento del mismo cobro | Mismo `POST` con la misma `Idempotency-Key` | **200** con `Idempotent-Replayed`: mismo cobro, no se cobra dos veces | **409** misma clave con otros datos → error interno, 503 |
| Consultar ticket / pedir barrera | `GET /api/cobros/{id}` | `PAGADO` → ticket `PAGADO` (la barrera puede abrirse). `RECHAZADO` / `VENCIDO` → ticket vuelve a `DENTRO` (nuevo `intento`). `PENDIENTE` → se mantiene | Muestra el ticket como está, **la barrera permanece cerrada** y la página vuelve a preguntar |
| Cancelar salida | `POST /api/cobros/{id}/anular` | Ticket vuelve a `DENTRO` | **409** (ya se pagó entre tanto) → se vuelve a consultar y se trata como `PAGADO`; **503** si no responde |
| Arranque / salud | `GET /api/salud` | Se registra en el log | Se registra el aviso; el servidor arranca igual |

### Traducción de errores de PagaYa a mensajes del negocio

| PagaYa | Mensaje al conductor |
|---|---|
| 401 / 403 | «No podemos cobrar en este momento, intenta más tarde» (503) |
| 404 teléfono sin cuenta | «Tu número no tiene una cuenta PagaYa» (422) |
| 422 monto sobre el tope | «El monto supera el máximo permitido por cobro» (422) |
| 409 cobro ya no pendiente | «El ticket ya no se puede modificar» (409) |
| Timeout / conexión rechazada | «PagaYa no responde, la barrera sigue cerrada; intenta de nuevo» (503) |
