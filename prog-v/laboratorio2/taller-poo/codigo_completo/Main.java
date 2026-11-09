import java.util.ArrayList;
import java.util.List;

/**
 * Clase Main — YA ESTÁ COMPLETA, no la modifiques todavía.
 * ---------------------------------------------------------------------
 * Aquí está la magia del POLIMORFISMO: creamos una sola lista de tipo
 * Empleado (la clase base), pero dentro guardamos objetos de tres tipos
 * DISTINTOS (Gerente, Vendedor, Operario).
 *
 * Cuando recorremos la lista y llamamos empleado.mostrarInfo(), Java
 * decide EN TIEMPO DE EJECUCIÓN cuál versión de calcularSalario() usar,
 * según el tipo REAL del objeto — no según el tipo de la variable.
 * Eso es polimorfismo: "una interfaz, muchas formas".
 * ---------------------------------------------------------------------
 */
public class Main {
    public static void main(String[] args) {

        // Una sola lista de tipo Empleado (la clase base / abstracta)...
        List<Empleado> nomina = new ArrayList<>();

        // ...pero llena de objetos de subclases distintas.
        nomina.add(new Gerente("Ana Pérez", "8-123-456", 1200.00, 400.00));
        nomina.add(new Vendedor("Luis Gómez", "4-789-012", 800.00, 5000.00, 0.05));
        nomina.add(new Vendedor("Carla Ruiz", "1-456-789", 800.00, 12000.00, 0.05));
        nomina.add(new Operario("José Ríos", "9-321-654", 700.00, 10, 4.50));

        System.out.println("===== REPORTE DE NÓMINA =====");
        System.out.printf("%-10s | %-12s | %-10s | %s%n", "Tipo", "Nombre", "Cédula", "Salario final");
        System.out.println("---------------------------------------------------------------");

        double totalNomina = 0;

        // Mismo método llamado sobre CADA objeto, comportamiento distinto
        // según el tipo real (¡esto es polimorfismo en acción!).
        for (Empleado empleado : nomina) {
            System.out.println(empleado.mostrarInfo());
            totalNomina += empleado.calcularSalario();
        }

        System.out.println("---------------------------------------------------------------");
        System.out.printf("TOTAL A PAGAR ESTE MES: $%.2f%n", totalNomina);

        // ------------------------------------------------------------
        // Extra: instanceof — a veces necesitamos saber el tipo real
        // de un objeto para hacer algo específico de esa subclase.
        // ------------------------------------------------------------
        System.out.println();
        System.out.println("===== VENDEDORES CON COMISIÓN DESTACADA (> $500) =====");
        for (Empleado empleado : nomina) {
            if (empleado instanceof Vendedor) {
                Vendedor v = (Vendedor) empleado; // downcasting
                double comision = v.calcularSalario() - v.getSalarioBase();
                if (comision > 500) {
                    System.out.printf("%s generó una comisión de $%.2f%n", v.getNombre(), comision);
                }
            }
        }
    }
}
