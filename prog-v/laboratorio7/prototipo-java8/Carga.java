// Envía muchas solicitudes al mismo tiempo y mide cuánto tarda el servidor.
// Ejecutar: java Carga <ruta> <cantidad>
//   java Carga "/api/lento?ms=500" 20
//   java Carga "/api/bloqueante?ms=500" 20
//   java Carga reservas 10      (10 reservas simultáneas del mismo espacio y hora)
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;

public class Carga {
    public static void main(String[] args) throws Exception {
        final String base = Http.base();
        final String ruta = args.length > 0 ? args[0] : "/api/lento?ms=500";
        final int cantidad = args.length > 1 ? Integer.parseInt(args[1]) : 20;

        System.out.printf("Enviando %d solicitudes simultáneas a %s ...%n", cantidad, ruta);
        ExecutorService clientes = Executors.newFixedThreadPool(cantidad);
        final CountDownLatch salida = new CountDownLatch(1); // todos arrancan al mismo tiempo
        List<Future<long[]>> pendientes = new ArrayList<>();
        for (int i = 1; i <= cantidad; i++) {
            final int n = i;
            pendientes.add(clientes.submit(() -> {
                salida.await();
                long t0 = System.currentTimeMillis();
                try {
                    Http.Respuesta r;
                    if (ruta.equals("reservas")) {
                        String json = "{\"espacioId\":3,\"fecha\":\"2026-10-22\",\"hora\":\"09:00\",\"solicitante\":\"Cliente " + n + "\"}";
                        r = Http.enviar("POST", base + "/api/reservas", json);
                    } else {
                        r = Http.enviar("GET", base + ruta, null);
                    }
                    return new long[]{r.codigo, System.currentTimeMillis() - t0};
                } catch (Exception e) {
                    return new long[]{-1, System.currentTimeMillis() - t0};
                }
            }));
        }
        long inicio = System.currentTimeMillis();
        salida.countDown();
        long min = Long.MAX_VALUE, max = 0, suma = 0;
        Map<String, Integer> codigos = new TreeMap<>();
        for (Future<long[]> f : pendientes) {
            long[] r = f.get();
            min = Math.min(min, r[1]); max = Math.max(max, r[1]); suma += r[1];
            String c = r[0] == -1 ? "ERROR" : String.valueOf(r[0]);
            codigos.put(c, codigos.getOrDefault(c, 0) + 1);
        }
        long total = System.currentTimeMillis() - inicio;
        clientes.shutdown();
        System.out.println("Tiempo total:            " + total + " ms");
        System.out.println("Respuesta más rápida:    " + min + " ms");
        System.out.println("Respuesta más lenta:     " + max + " ms");
        System.out.println("Promedio por solicitud:  " + Math.round((double) suma / cantidad) + " ms");
        System.out.println("Códigos de estado:       " + codigos);
    }
}
