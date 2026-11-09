// Prototipo de servidor de reservas (Programación V, semana 9).
// Compatible con Java 8 o superior. Solo usa clases del JDK: no requiere Maven ni librerías.
// Compilar:  javac -encoding UTF-8 *.java
// Ejecutar:  java Servidor 4          (4 hilos de trabajo)
//            java Servidor ilimitado  (un hilo nuevo por cada solicitud que llega)
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpServer;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.concurrent.Executors;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class Servidor {

    static class Espacio {
        final int id; final String nombre; final int capacidad;
        Espacio(int id, String nombre, int capacidad) { this.id = id; this.nombre = nombre; this.capacidad = capacidad; }
        String json() { return String.format("{\"id\":%d,\"nombre\":\"%s\",\"capacidad\":%d}", id, nombre, capacidad); }
    }

    static class Reserva {
        final int id; final int espacioId; final String fecha; final String hora; final String solicitante;
        Reserva(int id, int espacioId, String fecha, String hora, String solicitante) {
            this.id = id; this.espacioId = espacioId; this.fecha = fecha; this.hora = hora; this.solicitante = solicitante;
        }
        String json() {
            return String.format("{\"id\":%d,\"espacioId\":%d,\"fecha\":\"%s\",\"hora\":\"%s\",\"solicitante\":\"%s\"}",
                    id, espacioId, fecha, hora, solicitante);
        }
    }

    static final List<Espacio> espacios = Arrays.asList(
            new Espacio(1, "Laboratorio de Cómputo 1", 30),
            new Espacio(2, "Laboratorio de Cómputo 2", 25),
            new Espacio(3, "Auditorio", 120));
    static final List<Reserva> reservas = new ArrayList<>();
    static final AtomicInteger atendidas = new AtomicInteger();

    public static void main(String[] args) throws IOException {
        String modo = args.length > 0 ? args[0] : "4";
        calibrar();
        String p = System.getenv("PORT");
        int puerto = p != null ? Integer.parseInt(p) : 3000;
        HttpServer servidor = HttpServer.create(new InetSocketAddress(puerto), 200);
        servidor.createContext("/api/", Servidor::atender);
        if (modo.equals("ilimitado")) {
            servidor.setExecutor(Executors.newCachedThreadPool());
        } else {
            servidor.setExecutor(Executors.newFixedThreadPool(Integer.parseInt(modo)));
        }
        servidor.start();
        System.out.println("Servidor de reservas en http://localhost:" + puerto + " (hilos: " + modo
                + ", núcleos: " + Runtime.getRuntime().availableProcessors() + ")");
    }

    static void atender(HttpExchange ex) throws IOException {
        atendidas.incrementAndGet();
        String metodo = ex.getRequestMethod();
        URI uri = ex.getRequestURI();
        String ruta = uri.getPath();
        System.out.printf("%s  %-6s %s  [%s]%n", LocalTime.now().toString(), metodo, uri, Thread.currentThread().getName());
        try {
            if (metodo.equals("GET") && ruta.equals("/api/espacios")) {
                List<String> partes = new ArrayList<>();
                for (Espacio e : espacios) partes.add(e.json());
                responder(ex, 200, "[" + String.join(",", partes) + "]");
            } else if (metodo.equals("GET") && ruta.equals("/api/reservas")) {
                List<String> partes = new ArrayList<>();
                synchronized (reservas) {
                    for (Reserva r : reservas) partes.add(r.json());
                }
                responder(ex, 200, "[" + String.join(",", partes) + "]");
            } else if (metodo.equals("POST") && ruta.equals("/api/reservas")) {
                crearReserva(ex);
            } else if (metodo.equals("GET") && ruta.equals("/api/lento")) {
                int ms = parametro(uri, "ms", 500);
                Thread.sleep(ms); // simula esperar a la base de datos: el hilo queda ocupado esperando
                responder(ex, 200, "{\"tipo\":\"espera (E/S)\",\"ms\":" + ms + "}");
            } else if (metodo.equals("GET") && ruta.equals("/api/bloqueante")) {
                int ms = parametro(uri, "ms", 500);
                calculoPesado(ms); // simula un cálculo: el hilo ocupa un núcleo del procesador
                responder(ex, 200, "{\"tipo\":\"cálculo (CPU)\",\"ms\":" + ms + "}");
            } else if (metodo.equals("GET") && ruta.equals("/api/estado")) {
                responder(ex, 200, "{\"estado\":\"ok\",\"solicitudesAtendidas\":" + atendidas.get() + "}");
            } else {
                responder(ex, 404, "{\"error\":\"Ruta no encontrada\"}");
            }
        } catch (InterruptedException e) {
            responder(ex, 500, "{\"error\":\"Interrumpido\"}");
        }
    }

    static void crearReserva(HttpExchange ex) throws IOException {
        String cuerpo = leer(ex.getRequestBody());
        Integer espacioId = numero(cuerpo, "espacioId");
        String fecha = texto(cuerpo, "fecha"), hora = texto(cuerpo, "hora"), solicitante = texto(cuerpo, "solicitante");
        if (espacioId == null || fecha == null || hora == null || solicitante == null) {
            responder(ex, 400, "{\"error\":\"espacioId, fecha, hora y solicitante son obligatorios\"}");
            return;
        }
        boolean existe = false;
        for (Espacio e : espacios) if (e.id == espacioId) existe = true;
        if (!existe) {
            responder(ex, 404, "{\"error\":\"El espacio no existe\"}");
            return;
        }
        Reserva nueva;
        // Sección crítica: solo un hilo a la vez puede verificar y guardar.
        synchronized (reservas) {
            boolean ocupado = false;
            for (Reserva r : reservas) {
                if (r.espacioId == espacioId && r.fecha.equals(fecha) && r.hora.equals(hora)) ocupado = true;
            }
            if (ocupado) {
                responder(ex, 409, "{\"error\":\"Ese espacio ya está reservado en esa fecha y hora\"}");
                return;
            }
            nueva = new Reserva(reservas.size() + 1, espacioId, fecha, hora, solicitante);
            reservas.add(nueva);
        }
        responder(ex, 201, nueva.json());
    }

    // Cálculo pesado: una cantidad FIJA de trabajo que tarda unos 'ms' milisegundos
    // si tiene un núcleo para él solo. Si varios hilos compiten por los núcleos, tarda más.
    static volatile double resultado;
    static long iteracionesPorMs = 1;

    static void calcular(long iteraciones) {
        double x = 0;
        for (long i = 0; i < iteraciones; i++) { x += Math.sqrt(i); }
        resultado = x;
    }

    static void calibrar() {
        for (int i = 0; i < 5; i++) calcular(2_000_000); // calentar el compilador JIT
        long t0 = System.nanoTime();
        calcular(20_000_000);
        long ms = Math.max(1, (System.nanoTime() - t0) / 1_000_000);
        iteracionesPorMs = 20_000_000 / ms;
    }

    static void calculoPesado(int ms) { calcular(iteracionesPorMs * ms); }

    static String leer(InputStream in) throws IOException {
        ByteArrayOutputStream buf = new ByteArrayOutputStream();
        byte[] b = new byte[4096];
        int n;
        while ((n = in.read(b)) != -1) buf.write(b, 0, n);
        return new String(buf.toByteArray(), StandardCharsets.UTF_8);
    }

    static void responder(HttpExchange ex, int codigo, String json) throws IOException {
        byte[] datos = json.getBytes(StandardCharsets.UTF_8);
        ex.getResponseHeaders().set("Content-Type", "application/json; charset=utf-8");
        ex.sendResponseHeaders(codigo, datos.length);
        try (OutputStream os = ex.getResponseBody()) { os.write(datos); }
    }

    // Lectura mínima de JSON plano (en la semana 12 usaremos una librería como Jackson).
    static String texto(String json, String clave) {
        Matcher m = Pattern.compile("\"" + clave + "\"\\s*:\\s*\"([^\"]*)\"").matcher(json);
        return m.find() ? m.group(1) : null;
    }

    static Integer numero(String json, String clave) {
        Matcher m = Pattern.compile("\"" + clave + "\"\\s*:\\s*(-?\\d+)").matcher(json);
        return m.find() ? Integer.valueOf(m.group(1)) : null;
    }

    static int parametro(URI uri, String nombre, int defecto) {
        String q = uri.getQuery();
        if (q == null) return defecto;
        for (String par : q.split("&")) {
            String[] kv = par.split("=");
            if (kv.length == 2 && kv[0].equals(nombre)) return Integer.parseInt(kv[1]);
        }
        return defecto;
    }
}
