import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Function;

/**
 * Ejemplo del patrón FILTRO DE TUBERÍA (Pipe-Filter)
 * Caso de uso: Análisis de logs del sistema.
 *
 * Los datos fluyen a través de una secuencia de FILTROS independientes:
 *   Entrada (logs crudos)
 *     -> Filtro 1: filtrado de errores (nivel ERROR/WARN)
 *     -> Filtro 2: agregación por tipo de error
 *     -> Filtro 3: generación de reporte
 *   -> Salida (reporte de incidencias)
 *
 * Cada filtro se modela como una interfaz funcional Filtro<E, S> que
 * transforma una entrada de tipo E en una salida de tipo S, sin conocer
 * nada de los demás filtros. La clase Tuberia los conecta en secuencia.
 *
 * Compilar:  javac PipeFilterLogs.java
 * Ejecutar:  java PipeFilterLogs
 */
public class PipeFilterLogs {

    // --------------------------------------------------------------
    // Interfaz genérica de un FILTRO: recibe una entrada E y produce
    // una salida S. Extiende Function para poder encadenarse con
    // .andThen(...) si se desea, aunque aquí los conectamos explícitamente
    // en la clase Tuberia para que el flujo quede más visible.
    // --------------------------------------------------------------
    interface Filtro<E, S> extends Function<E, S> { }

    // --------------------------------------------------------------
    // Modelo de datos: una línea de log ya parseada.
    // --------------------------------------------------------------
    record LineaLog(String nivel, String tipoError, String mensaje) { }

    record Incidencia(String tipoError, int ocurrencias) { }

    // --------------------------------------------------------------
    // FILTRO 1: Filtrado de errores.
    // Entrada:  lista de líneas de log crudas.
    // Salida:   solo las líneas de nivel ERROR o WARN.
    // --------------------------------------------------------------
    static class FiltroDeErrores implements Filtro<List<LineaLog>, List<LineaLog>> {
        @Override
        public List<LineaLog> apply(List<LineaLog> logsCrudos) {
            List<LineaLog> filtradas = new ArrayList<>();
            for (LineaLog linea : logsCrudos) {
                if (linea.nivel().equals("ERROR") || linea.nivel().equals("WARN")) {
                    filtradas.add(linea);
                }
            }
            System.out.println("[Filtro 1 - Filtrado de errores] " + logsCrudos.size()
                    + " líneas -> " + filtradas.size() + " relevantes (ERROR/WARN)");
            return filtradas;
        }
    }

    // --------------------------------------------------------------
    // FILTRO 2: Agregación por tipo de error.
    // Entrada:  líneas ya filtradas (solo ERROR/WARN).
    // Salida:   conteo de ocurrencias agrupado por tipo de error.
    // --------------------------------------------------------------
    static class FiltroDeAgregacion implements Filtro<List<LineaLog>, List<Incidencia>> {
        @Override
        public List<Incidencia> apply(List<LineaLog> lineasFiltradas) {
            Map<String, Integer> conteos = new LinkedHashMap<>();
            for (LineaLog linea : lineasFiltradas) {
                conteos.merge(linea.tipoError(), 1, Integer::sum);
            }

            List<Incidencia> incidencias = new ArrayList<>();
            for (Map.Entry<String, Integer> entrada : conteos.entrySet()) {
                incidencias.add(new Incidencia(entrada.getKey(), entrada.getValue()));
            }

            System.out.println("[Filtro 2 - Agregación por tipo] " + incidencias.size()
                    + " tipos de error distintos encontrados");
            return incidencias;
        }
    }

    // --------------------------------------------------------------
    // FILTRO 3: Generación de reporte.
    // Entrada:  incidencias agregadas.
    // Salida:   texto del reporte final, listo para el equipo de soporte.
    // --------------------------------------------------------------
    static class FiltroDeReporte implements Filtro<List<Incidencia>, String> {
        @Override
        public String apply(List<Incidencia> incidencias) {
            StringBuilder reporte = new StringBuilder();
            reporte.append("===== REPORTE DE INCIDENCIAS =====\n");
            for (Incidencia inc : incidencias) {
                reporte.append(String.format("- %-20s : %d ocurrencia(s)%n",
                        inc.tipoError(), inc.ocurrencias()));
            }
            System.out.println("[Filtro 3 - Generación de reporte] reporte final construido");
            return reporte.toString();
        }
    }

    // --------------------------------------------------------------
    // TUBERÍA: conecta los filtros en secuencia. No conoce el contenido
    // de cada filtro, solo los ejecuta uno tras otro pasando la salida
    // de uno como entrada del siguiente.
    // --------------------------------------------------------------
    static class Tuberia {
        private final FiltroDeErrores filtro1 = new FiltroDeErrores();
        private final FiltroDeAgregacion filtro2 = new FiltroDeAgregacion();
        private final FiltroDeReporte filtro3 = new FiltroDeReporte();

        String procesar(List<LineaLog> logsCrudos) {
            List<LineaLog> filtradas = filtro1.apply(logsCrudos);
            List<Incidencia> incidencias = filtro2.apply(filtradas);
            return filtro3.apply(incidencias);
        }
    }

    // --------------------------------------------------------------
    // Programa de demostración.
    // --------------------------------------------------------------
    public static void main(String[] args) {
        // Simulamos logs crudos del servidor (entrada de la tubería).
        List<LineaLog> logsCrudos = List.of(
                new LineaLog("INFO", "-", "Servidor iniciado correctamente"),
                new LineaLog("ERROR", "ConexionBD", "No se pudo conectar a la base de datos"),
                new LineaLog("DEBUG", "-", "Cache actualizada"),
                new LineaLog("WARN", "Timeout", "La respuesta tardó más de 5s"),
                new LineaLog("ERROR", "Autenticacion", "Token expirado"),
                new LineaLog("ERROR", "ConexionBD", "Timeout al conectar a la base de datos"),
                new LineaLog("INFO", "-", "Usuario admin inició sesión"),
                new LineaLog("WARN", "Timeout", "La respuesta tardó más de 5s"),
                new LineaLog("ERROR", "Autenticacion", "Credenciales inválidas")
        );

        Tuberia tuberia = new Tuberia();
        String reporteFinal = tuberia.procesar(logsCrudos);

        System.out.println();
        System.out.println(reporteFinal);
    }
}
