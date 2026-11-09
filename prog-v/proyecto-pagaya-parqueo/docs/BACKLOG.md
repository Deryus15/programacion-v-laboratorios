# Backlog del MVP — Parqueo (G2)

Integrantes: Cristian Valdes · Dereck Martinez · Samuel Suira

Formato: *Como [rol] quiero [acción] para [beneficio]*. Criterio: *Dado … cuando … entonces …*

| # | Prioridad | Historia | Criterio de aceptación | Endpoints |
|---|-----------|----------|------------------------|-----------|
| 1 | Alta | Como **operador** quiero registrar la entrada de un vehículo por su placa para empezar a contar el tiempo | Dado un vehículo con placa válida que no está dentro, cuando registro la entrada, entonces se crea un ticket `DENTRO` con la hora de entrada; si la placa ya está dentro veo el aviso (409) | `POST /api/entradas` |
| 2 | Alta (regla propia) | Como **conductor** quiero ver cuánto debo según mi tiempo para saber el costo antes de salir | Dado un vehículo dentro, cuando consulto mi ticket, entonces veo minutos y monto calculados por fracciones de 30 min (cada fracción iniciada cuenta) con tope diario (p. ej. 95 min = 4 fracciones = B/. 2.00; 10 h = B/. 6.00) | `GET /api/tickets/{id}` |
| 3 | Alta (pago) | Como **conductor** quiero pagar mi salida con PagaYa para no usar efectivo | Dado un vehículo dentro, cuando registro la salida con mi celular, entonces el cobro aparece en mi billetera; si mi número no tiene PagaYa veo el aviso y el ticket sigue `DENTRO` | `POST /api/salidas` → `POST /api/cobros` |
| 4 | Alta (regla propia) | Como **operador** quiero que la barrera solo se abra con el cobro pagado para que nadie salga sin pagar | Dado un ticket con cobro `PAGADO`, cuando pido abrir la barrera, entonces se abre y el ticket pasa a `FUERA`; si el cobro está pendiente, rechazado o vencido, entonces se deniega (409) y queda en la bitácora | `POST /api/tickets/{id}/barrera` → `GET /api/cobros/{id}` |
| 5 | Media | Como **conductor** quiero cancelar una salida pendiente o reintentar si el cobro venció o fue rechazado para no quedar bloqueado | Dado un ticket `ESPERANDO_PAGO`, cuando cancelo (o el cobro vence/se rechaza), entonces PagaYa anula el cobro y el ticket vuelve a `DENTRO`, listo para un nuevo cobro | `POST /api/tickets/{id}/cancelar-salida` → `.../anular` |
| 6 | Media | Como **operador** quiero ver los vehículos que están dentro para controlar la ocupación | Dado que hay vehículos dentro, cuando abro el panel, entonces aparecen con su placa, hora de entrada y estado, ordenados por entrada | `GET /api/tickets?estado=DENTRO` |

## Siguientes pasos (fuera del MVP)
Inicio de sesión, notificaciones al celular, reportes avanzados de ingresos, control de capacidad máxima y tarifas por tipo de vehículo.
