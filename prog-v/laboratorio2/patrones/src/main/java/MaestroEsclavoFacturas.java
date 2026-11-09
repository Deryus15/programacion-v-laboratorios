import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.*;

/**
 * Ejemplo del patrón MAESTRO-ESCLAVO (Master-Slave)
 * Caso de uso: Procesamiento distribuido de un lote de facturas.
 *
 * El MAESTRO (clase CoordinadorFacturacion) divide el lote de facturas en
 * sublotes independientes y se los asigna a varios ESCLAVOS (tareas
 * NodoDeCalculo), que se ejecutan en paralelo usando un ExecutorService.
 * Cada esclavo calcula el ITBMS y el total de su sublote sin necesitar
 * información de los demás. El maestro combina los resultados parciales
 * en un único reporte consolidado.
 *
 * Compilar:  javac MaestroEsclavoFacturas.java
 * Ejecutar:  java MaestroEsclavoFacturas
 */
public class MaestroEsclavoFacturas {

    // --------------------------------------------------------------
    // Modelo de datos: una factura simple con su monto sin impuestos.
    // --------------------------------------------------------------
    record Factura(int id, double montoSinImpuesto) { }

    // --------------------------------------------------------------
    // Resultado parcial que devuelve cada ESCLAVO al maestro.
    // --------------------------------------------------------------
    record ResultadoParcial(int idNodo, int facturasProcesadas,
                             double totalSinImpuesto, double totalItbms,
                             double totalConImpuesto) { }

    // --------------------------------------------------------------
    // ESCLAVO: procesa un sublote de facturas de forma independiente.
    // Implementa Callable<ResultadoParcial> para poder ejecutarse en
    // un hilo del pool y devolver un resultado a través de un Future.
    // --------------------------------------------------------------
    static class NodoDeCalculo implements Callable<ResultadoParcial> {
        private static final double TASA_ITBMS = 0.07;

        private final int idNodo;
        private final List<Factura> sublote;

        NodoDeCalculo(int idNodo, List<Factura> sublote) {
            this.idNodo = idNodo;
            this.sublote = sublote;
        }

        @Override
        public ResultadoParcial call() {
            double totalSinImpuesto = 0.0;
            for (Factura f : sublote) {
                totalSinImpuesto += f.montoSinImpuesto();
            }
            double totalItbms = totalSinImpuesto * TASA_ITBMS;
            double totalConImpuesto = totalSinImpuesto + totalItbms;

            System.out.printf("  [Esclavo %d] procesó %d facturas -> subtotal: %.2f, ITBMS: %.2f%n",
                    idNodo, sublote.size(), totalSinImpuesto, totalItbms);

            return new ResultadoParcial(idNodo, sublote.size(),
                    totalSinImpuesto, totalItbms, totalConImpuesto);
        }
    }

    // --------------------------------------------------------------
    // MAESTRO: divide el trabajo, distribuye a los esclavos y
    // consolida los resultados parciales en un reporte final.
    // --------------------------------------------------------------
    static class CoordinadorFacturacion {

        ResultadoParcial procesarLote(List<Factura> lote, int cantidadEsclavos) {

            // 1) Dividir el lote en sublotes lo más parejos posible.
            List<List<Factura>> sublotes = dividirEnSublotes(lote, cantidadEsclavos);

            // 2) Crear un pool de hilos: uno por esclavo.
            ExecutorService pool = Executors.newFixedThreadPool(cantidadEsclavos);
            List<Future<ResultadoParcial>> futuros = new ArrayList<>();

            System.out.println("[Maestro] Repartiendo " + lote.size() + " facturas en "
                    + sublotes.size() + " sublotes...");

            // 3) Distribuir subtareas: cada sublote se manda a un esclavo distinto.
            for (int i = 0; i < sublotes.size(); i++) {
                NodoDeCalculo esclavo = new NodoDeCalculo(i + 1, sublotes.get(i));
                futuros.add(pool.submit(esclavo));
            }

            // 4) Recoger los resultados parciales (esperando a cada esclavo).
            double totalSinImpuesto = 0.0;
            double totalItbms = 0.0;
            double totalConImpuesto = 0.0;
            int facturasProcesadas = 0;

            try {
                for (Future<ResultadoParcial> futuro : futuros) {
                    ResultadoParcial parcial = futuro.get(); // bloquea hasta tener el resultado
                    totalSinImpuesto += parcial.totalSinImpuesto();
                    totalItbms += parcial.totalItbms();
                    totalConImpuesto += parcial.totalConImpuesto();
                    facturasProcesadas += parcial.facturasProcesadas();
                }
            } catch (InterruptedException | ExecutionException e) {
                throw new RuntimeException("Error al recolectar resultados de un esclavo", e);
            } finally {
                pool.shutdown();
            }

            // 5) Consolidar en el reporte final.
            return new ResultadoParcial(0, facturasProcesadas,
                    totalSinImpuesto, totalItbms, totalConImpuesto);
        }

        private List<List<Factura>> dividirEnSublotes(List<Factura> lote, int cantidadEsclavos) {
            List<List<Factura>> sublotes = new ArrayList<>();
            int tamanoBase = lote.size() / cantidadEsclavos;
            int resto = lote.size() % cantidadEsclavos;
            int inicio = 0;

            for (int i = 0; i < cantidadEsclavos; i++) {
                int tamanoSublote = tamanoBase + (i < resto ? 1 : 0);
                if (tamanoSublote == 0) continue;
                int fin = inicio + tamanoSublote;
                sublotes.add(lote.subList(inicio, fin));
                inicio = fin;
            }
            return sublotes;
        }
    }

    // --------------------------------------------------------------
    // Programa de demostración.
    // --------------------------------------------------------------
    public static void main(String[] args) {
        // Generamos un lote de ejemplo (20 facturas simuladas).
        List<Factura> lote = new ArrayList<>();
        for (int i = 1; i <= 20; i++) {
            double monto = 50 + (i * 7.35); // montos variados de ejemplo
            lote.add(new Factura(i, monto));
        }

        CoordinadorFacturacion maestro = new CoordinadorFacturacion();
        ResultadoParcial reporte = maestro.procesarLote(lote, 4); // 4 esclavos

        System.out.println();
        System.out.println("===== REPORTE CONSOLIDADO DE FACTURACIÓN =====");
        System.out.printf("Facturas procesadas : %d%n", reporte.facturasProcesadas());
        System.out.printf("Subtotal            : %.2f%n", reporte.totalSinImpuesto());
        System.out.printf("Total ITBMS (7%%)    : %.2f%n", reporte.totalItbms());
        System.out.printf("TOTAL CON IMPUESTO   : %.2f%n", reporte.totalConImpuesto());
    }
}
