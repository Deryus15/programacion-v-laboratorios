// Envía muchas solicitudes al mismo tiempo y mide cuánto tarda el servidor.
// Ejecutar: java Carga.java <ruta> <cantidad>
//   java Carga.java "/api/lento?ms=500" 20
//   java Carga.java "/api/bloqueante?ms=500" 20
//   java Carga.java reservas 10      (10 reservas simultáneas del mismo espacio y hora)
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.*;
import java.util.concurrent.CompletableFuture;

public class Carga {
    public static void main(String[] args) {
        String base = System.getenv().getOrDefault("SERVIDOR", "http://localhost:3000");
        String ruta = args.length > 0 ? args[0] : "/api/lento?ms=500";
        int cantidad = args.length > 1 ? Integer.parseInt(args[1]) : 20;
        HttpClient http = HttpClient.newBuilder().version(HttpClient.Version.HTTP_1_1)
                .connectTimeout(Duration.ofSeconds(10)).build();

        System.out.printf("Enviando %d solicitudes simultáneas a %s ...%n", cantidad, ruta);
        long inicio = System.currentTimeMillis();
        List<CompletableFuture<long[]>> pendientes = new ArrayList<>();
        for (int i = 1; i <= cantidad; i++) {
            HttpRequest.Builder b;
            if (ruta.equals("reservas")) {
                String json = "{\"espacioId\":3,\"fecha\":\"2026-10-22\",\"hora\":\"09:00\",\"solicitante\":\"Cliente " + i + "\"}";
                b = HttpRequest.newBuilder(URI.create(base + "/api/reservas")).header("Content-Type", "application/json")
                        .POST(HttpRequest.BodyPublishers.ofString(json));
            } else {
                b = HttpRequest.newBuilder(URI.create(base + ruta));
            }
            long t0 = System.currentTimeMillis();
            pendientes.add(http.sendAsync(b.timeout(Duration.ofSeconds(60)).build(), HttpResponse.BodyHandlers.discarding())
                    .thenApply(r -> new long[]{r.statusCode(), System.currentTimeMillis() - t0})
                    .exceptionally(e -> new long[]{-1, System.currentTimeMillis() - t0}));
        }
        List<long[]> res = pendientes.stream().map(CompletableFuture::join).toList();
        long total = System.currentTimeMillis() - inicio;
        LongSummaryStatistics t = res.stream().mapToLong(r -> r[1]).summaryStatistics();
        Map<String, Integer> codigos = new TreeMap<>();
        res.forEach(r -> codigos.merge(r[0] == -1 ? "ERROR" : String.valueOf(r[0]), 1, Integer::sum));
        System.out.println("Tiempo total:            " + total + " ms");
        System.out.println("Respuesta más rápida:    " + t.getMin() + " ms");
        System.out.println("Respuesta más lenta:     " + t.getMax() + " ms");
        System.out.println("Promedio por solicitud:  " + Math.round(t.getAverage()) + " ms");
        System.out.println("Códigos de estado:       " + codigos);
    }
}
