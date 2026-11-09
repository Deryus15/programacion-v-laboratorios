package reservas.servidor;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.time.LocalTime;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;

import reservas.modelo.Reserva;
import reservas.negocio.ServicioReservas;
import reservas.negocio.ValidacionException;

/**
 * Atiende todas las rutas /api/reservas.
 *
 *   GET    /api/reservas        -> RF-01 listar
 *   GET    /api/reservas/{id}   -> RF-02 consultar
 *   POST   /api/reservas        -> RF-03 crear
 *   PUT    /api/reservas/{id}   -> RF-04 actualizar
 *   DELETE /api/reservas/{id}   -> RF-05 cancelar
 *
 * Aquí se hacen visibles varios requisitos NO funcionales:
 *   RNF-01 Seguridad   : encabezado X-API-KEY obligatorio en operaciones de escritura.
 *   RNF-02 Rendimiento : se mide y registra el tiempo de cada solicitud (ms).
 *   RNF-03 Interoperab.: todas las respuestas en JSON UTF-8 con códigos HTTP estándar.
 */
public class ReservasHandler implements HttpHandler {

    private static final String API_KEY = "unachi-prog5";
    private static final String BASE = "/api/reservas";

    private final ServicioReservas servicio;

    public ReservasHandler(ServicioReservas servicio) {
        this.servicio = servicio;
    }

    @Override
    public void handle(HttpExchange ex) throws IOException {
        long inicio = System.nanoTime();
        String metodo = ex.getRequestMethod();
        String ruta = ex.getRequestURI().getPath();
        int codigo;
        String cuerpo;

        try {
            Integer id = extraerId(ruta);

            // RNF-01: solo lectura es pública; escribir requiere API key
            if (!"GET".equals(metodo) && !API_KEY.equals(ex.getRequestHeaders().getFirst("X-API-KEY"))) {
                throw new ValidacionException(401, "Falta o es inválido el encabezado X-API-KEY");
            }

            if ("GET".equals(metodo) && id == null) {
                codigo = 200;
                cuerpo = Json.deLista(servicio.listar());
            } else if ("GET".equals(metodo)) {
                codigo = 200;
                cuerpo = Json.deReserva(servicio.obtener(id));
            } else if ("POST".equals(metodo) && id == null) {
                Reserva r = servicio.crear(Json.aReserva(leerCuerpo(ex)));
                codigo = 201;
                cuerpo = Json.deReserva(r);
            } else if ("PUT".equals(metodo) && id != null) {
                Reserva r = servicio.actualizar(id, Json.aReserva(leerCuerpo(ex)));
                codigo = 200;
                cuerpo = Json.deReserva(r);
            } else if ("DELETE".equals(metodo) && id != null) {
                servicio.cancelar(id);
                codigo = 204;
                cuerpo = "";
            } else {
                throw new ValidacionException(405, "Método " + metodo + " no permitido en " + ruta);
            }
        } catch (ValidacionException e) {
            codigo = e.getCodigoHttp();
            cuerpo = Json.error(codigo, e.getMessage());
        } catch (IllegalArgumentException e) {
            codigo = 400;
            cuerpo = Json.error(400, "Solicitud mal formada: " + e.getMessage());
        } catch (Exception e) {
            codigo = 500;
            cuerpo = Json.error(500, "Error interno del servidor");
            e.printStackTrace();
        }

        responder(ex, codigo, cuerpo);

        // RNF-02: bitácora con tiempo de respuesta
        long ms = (System.nanoTime() - inicio) / 1_000_000;
        System.out.printf("[%s] %-6s %-22s -> %d (%d ms) [%s]%n",
                LocalTime.now().withNano(0), metodo, ruta, codigo, ms, Thread.currentThread().getName());
    }

    /** Devuelve el {id} de /api/reservas/{id}, o null si la ruta es /api/reservas. */
    private Integer extraerId(String ruta) {
        String resto = ruta.substring(BASE.length());
        if (resto.isEmpty() || "/".equals(resto)) {
            return null;
        }
        try {
            return Integer.parseInt(resto.substring(1));
        } catch (NumberFormatException e) {
            throw new ValidacionException(400, "El id debe ser numérico");
        }
    }

    private String leerCuerpo(HttpExchange ex) throws IOException {
        InputStream in = ex.getRequestBody();
        ByteArrayOutputStream buf = new ByteArrayOutputStream();
        byte[] b = new byte[1024];
        int n;
        while ((n = in.read(b)) != -1) {
            buf.write(b, 0, n);
        }
        return new String(buf.toByteArray(), StandardCharsets.UTF_8);
    }

    private void responder(HttpExchange ex, int codigo, String cuerpo) throws IOException {
        byte[] bytes = cuerpo.getBytes(StandardCharsets.UTF_8);
        ex.getResponseHeaders().set("Content-Type", "application/json; charset=UTF-8");
        if (codigo == 204) {
            ex.sendResponseHeaders(204, -1);
        } else {
            ex.sendResponseHeaders(codigo, bytes.length);
            OutputStream os = ex.getResponseBody();
            os.write(bytes);
            os.close();
        }
        ex.close();
    }
}
