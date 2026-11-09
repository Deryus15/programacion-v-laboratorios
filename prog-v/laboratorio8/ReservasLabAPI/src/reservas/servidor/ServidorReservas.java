package reservas.servidor;

import java.io.IOException;
import java.net.InetSocketAddress;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

import com.sun.net.httpserver.HttpServer;

import reservas.datos.RepositorioReservas;
import reservas.modelo.Reserva;
import reservas.negocio.ServicioReservas;

/**
 * SERVIDOR de la arquitectura cliente-servidor.
 * Usa el HttpServer que viene incluido en el JDK (Java 6+), así no hace falta
 * instalar Spring Boot, Tomcat ni ningún JAR adicional.
 *
 * Ejecutar: java -cp build reservas.servidor.ServidorReservas
 */
public class ServidorReservas {

    public static final int PUERTO = 8080;

    // RNF-04 (Concurrencia): hasta 10 solicitudes atendidas en paralelo
    private static final int HILOS = 10;

    public static void main(String[] args) throws IOException {
        // Ensamblado de capas: datos -> negocio -> servidor
        RepositorioReservas repo = new RepositorioReservas();
        ServicioReservas servicio = new ServicioReservas(repo);
        cargarDatosDemo(servicio);

        HttpServer server = HttpServer.create(new InetSocketAddress(PUERTO), 0);
        server.createContext("/api/reservas", new ReservasHandler(servicio));

        ExecutorService pool = Executors.newFixedThreadPool(HILOS);
        server.setExecutor(pool);
        server.start();

        System.out.println("==============================================");
        System.out.println(" Servidor de Reservas de Laboratorios - UNACHI");
        System.out.println(" Escuchando en http://localhost:" + PUERTO + "/api/reservas");
        System.out.println(" Hilos de atención: " + HILOS);
        System.out.println(" (Ctrl+C para detener)");
        System.out.println("==============================================");
    }

    private static void cargarDatosDemo(ServicioReservas s) {
        s.crear(new Reserva("LAB-1", "Prof. Flores", "2026-10-22", "07:00", "08:35"));
        s.crear(new Reserva("LAB-2", "Grupo PROG V", "2026-10-22", "09:00", "10:30"));
        s.crear(new Reserva("LAB-1", "Club de Robótica", "2026-10-23", "14:00", "16:00"));
    }
}
