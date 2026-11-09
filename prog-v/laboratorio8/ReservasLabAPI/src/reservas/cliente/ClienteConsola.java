package reservas.cliente;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.ConnectException;
import java.net.HttpURLConnection;
import java.net.SocketTimeoutException;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.Scanner;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;

/**
 * CLIENTE de la arquitectura cliente-servidor (aplicación de consola).
 * Solo conoce el CONTRATO de la API (rutas, métodos y JSON); no conoce
 * las clases internas del servidor.
 *
 * Ejecutar:  java -cp build reservas.cliente.ClienteConsola
 *            java -cp build reservas.cliente.ClienteConsola demo   (sin menú)
 */
public class ClienteConsola {

    private static final String URL_BASE = "http://localhost:8080/api/reservas";
    private static final String API_KEY = "unachi-prog5";

    // RNF-05 (Disponibilidad percibida): el cliente no se queda colgado
    private static final int TIMEOUT_CONEXION_MS = 3000;
    private static final int TIMEOUT_LECTURA_MS = 5000;

    public static void main(String[] args) throws Exception {
        if (args.length > 0 && "demo".equals(args[0])) {
            demoAutomatica();
            return;
        }
        Scanner sc = new Scanner(System.in, "UTF-8");
        int op;
        do {
            System.out.println();
            System.out.println("===== CLIENTE RESERVAS DE LABORATORIO =====");
            System.out.println("1. Listar reservas            (GET)");
            System.out.println("2. Consultar reserva por id   (GET)");
            System.out.println("3. Crear reserva              (POST)");
            System.out.println("4. Modificar reserva          (PUT)");
            System.out.println("5. Cancelar reserva           (DELETE)");
            System.out.println("6. Prueba de carga RNF (20 solicitudes simultáneas)");
            System.out.println("0. Salir");
            System.out.print("Opción: ");
            op = leerEntero(sc);
            switch (op) {
                case 1: mostrar(enviar("GET", URL_BASE, null)); break;
                case 2:
                    System.out.print("Id: ");
                    mostrar(enviar("GET", URL_BASE + "/" + leerEntero(sc), null));
                    break;
                case 3: mostrar(enviar("POST", URL_BASE, pedirDatos(sc))); break;
                case 4:
                    System.out.print("Id a modificar: ");
                    int id = leerEntero(sc);
                    mostrar(enviar("PUT", URL_BASE + "/" + id, pedirDatos(sc)));
                    break;
                case 5:
                    System.out.print("Id a cancelar: ");
                    mostrar(enviar("DELETE", URL_BASE + "/" + leerEntero(sc), null));
                    break;
                case 6: pruebaDeCarga(20); break;
                case 0: System.out.println("Hasta luego."); break;
                default: System.out.println("Opción inválida.");
            }
        } while (op != 0);
    }

    // ------------------------------------------------------------------
    //  Comunicación HTTP
    // ------------------------------------------------------------------

    /** Resultado simple de una llamada HTTP. */
    static class Respuesta {
        final int codigo;
        final String cuerpo;
        final long ms;
        Respuesta(int codigo, String cuerpo, long ms) {
            this.codigo = codigo;
            this.cuerpo = cuerpo;
            this.ms = ms;
        }
    }

    static Respuesta enviar(String metodo, String url, String json) {
        long t0 = System.currentTimeMillis();
        HttpURLConnection con = null;
        try {
            con = (HttpURLConnection) new URL(url).openConnection();
            con.setRequestMethod(metodo);
            con.setConnectTimeout(TIMEOUT_CONEXION_MS);
            con.setReadTimeout(TIMEOUT_LECTURA_MS);
            con.setRequestProperty("Accept", "application/json");
            con.setRequestProperty("X-API-KEY", API_KEY);
            if (json != null) {
                con.setDoOutput(true);
                con.setRequestProperty("Content-Type", "application/json; charset=UTF-8");
                OutputStream os = con.getOutputStream();
                os.write(json.getBytes(StandardCharsets.UTF_8));
                os.close();
            }
            int codigo = con.getResponseCode();
            InputStream in = codigo >= 400 ? con.getErrorStream() : con.getInputStream();
            String cuerpo = in == null ? "" : leerTodo(in);
            return new Respuesta(codigo, cuerpo, System.currentTimeMillis() - t0);
        } catch (ConnectException e) {
            return new Respuesta(-1, "No se pudo conectar: ¿el servidor está encendido?",
                    System.currentTimeMillis() - t0);
        } catch (SocketTimeoutException e) {
            return new Respuesta(-1, "Tiempo de espera agotado (timeout)",
                    System.currentTimeMillis() - t0);
        } catch (IOException e) {
            return new Respuesta(-1, "Error de red: " + e.getMessage(),
                    System.currentTimeMillis() - t0);
        } finally {
            if (con != null) con.disconnect();
        }
    }

    // ------------------------------------------------------------------
    //  RNF: prueba de rendimiento / concurrencia
    // ------------------------------------------------------------------

    static void pruebaDeCarga(int n) throws Exception {
        System.out.println("Enviando " + n + " solicitudes GET en paralelo...");
        ExecutorService pool = Executors.newFixedThreadPool(n);
        List<Future<Respuesta>> futuros = new ArrayList<Future<Respuesta>>();
        long t0 = System.currentTimeMillis();
        for (int i = 0; i < n; i++) {
            futuros.add(pool.submit(() -> enviar("GET", URL_BASE, null)));
        }
        long max = 0, suma = 0;
        int ok = 0;
        for (Future<Respuesta> f : futuros) {
            Respuesta r = f.get();
            if (r.codigo == 200) ok++;
            suma += r.ms;
            max = Math.max(max, r.ms);
        }
        pool.shutdown();
        long total = System.currentTimeMillis() - t0;
        System.out.printf("Exitosas: %d/%d | promedio: %d ms | máximo: %d ms | total: %d ms%n",
                ok, n, suma / n, max, total);
        System.out.println(max <= 500
                ? "CUMPLE RNF-02 (tiempo de respuesta <= 500 ms)"
                : "NO CUMPLE RNF-02 (tiempo de respuesta <= 500 ms)");
    }

    // ------------------------------------------------------------------
    //  Demo automática (útil para proyectar en clase)
    // ------------------------------------------------------------------

    static void demoAutomatica() throws Exception {
        paso("1) Listar reservas iniciales");
        mostrar(enviar("GET", URL_BASE, null));

        paso("2) Crear reserva válida (201 Created)");
        mostrar(enviar("POST", URL_BASE, json("LAB-3", "Ana Pérez", "2026-10-24", "08:00", "10:00")));

        paso("3) Crear reserva que choca con #1 (409 Conflict)");
        mostrar(enviar("POST", URL_BASE, json("LAB-1", "Luis Gómez", "2026-10-22", "08:00", "09:00")));

        paso("4) Crear reserva con datos incompletos (400 Bad Request)");
        mostrar(enviar("POST", URL_BASE, "{\"laboratorio\":\"LAB-2\"}"));

        paso("5) Consultar reserva inexistente (404 Not Found)");
        mostrar(enviar("GET", URL_BASE + "/99", null));

        paso("6) Modificar reserva #2 (200 OK)");
        mostrar(enviar("PUT", URL_BASE + "/2", json("LAB-2", "Grupo PROG V", "2026-10-22", "10:30", "12:00")));

        paso("7) Cancelar reserva #3 (204 No Content)");
        mostrar(enviar("DELETE", URL_BASE + "/3", null));

        paso("8) Escribir sin API key (401 Unauthorized) - RNF-01 Seguridad");
        mostrar(enviarSinClave());

        paso("9) Prueba de carga - RNF-02 Rendimiento / RNF-04 Concurrencia");
        pruebaDeCarga(20);
    }

    private static Respuesta enviarSinClave() throws IOException {
        HttpURLConnection con = (HttpURLConnection) new URL(URL_BASE + "/1").openConnection();
        con.setRequestMethod("DELETE");
        con.setConnectTimeout(TIMEOUT_CONEXION_MS);
        con.setReadTimeout(TIMEOUT_LECTURA_MS);
        int codigo = con.getResponseCode();
        InputStream in = con.getErrorStream();
        return new Respuesta(codigo, in == null ? "" : leerTodo(in), 0);
    }

    // ------------------------------------------------------------------
    //  Utilidades
    // ------------------------------------------------------------------

    private static String pedirDatos(Scanner sc) {
        System.out.print("Laboratorio (LAB-1/LAB-2/LAB-3): ");
        String lab = sc.nextLine().trim();
        System.out.print("Solicitante: ");
        String sol = sc.nextLine().trim();
        System.out.print("Fecha (yyyy-MM-dd): ");
        String fecha = sc.nextLine().trim();
        System.out.print("Hora inicio (HH:mm): ");
        String hi = sc.nextLine().trim();
        System.out.print("Hora fin (HH:mm): ");
        String hf = sc.nextLine().trim();
        return json(lab, sol, fecha, hi, hf);
    }

    private static String json(String lab, String sol, String fecha, String hi, String hf) {
        return "{\"laboratorio\":\"" + lab + "\",\"solicitante\":\"" + sol
                + "\",\"fecha\":\"" + fecha + "\",\"horaInicio\":\"" + hi
                + "\",\"horaFin\":\"" + hf + "\"}";
    }

    private static void mostrar(Respuesta r) {
        String estado = r.codigo == -1 ? "SIN CONEXIÓN" : "HTTP " + r.codigo;
        System.out.println("  <- " + estado + " (" + r.ms + " ms)");
        if (!r.cuerpo.isEmpty()) {
            System.out.println("  " + r.cuerpo.replace("},{", "},\n   {"));
        }
    }

    private static void paso(String t) {
        System.out.println();
        System.out.println(">>> " + t);
    }

    private static int leerEntero(Scanner sc) {
        try {
            return Integer.parseInt(sc.nextLine().trim());
        } catch (NumberFormatException e) {
            return -99;
        }
    }

    private static String leerTodo(InputStream in) throws IOException {
        ByteArrayOutputStream buf = new ByteArrayOutputStream();
        byte[] b = new byte[1024];
        int n;
        while ((n = in.read(b)) != -1) buf.write(b, 0, n);
        in.close();
        return new String(buf.toByteArray(), StandardCharsets.UTF_8);
    }
}
