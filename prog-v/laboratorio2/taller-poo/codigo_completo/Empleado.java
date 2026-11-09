/**
 * Clase ABSTRACTA Empleado.
 * ---------------------------------------------------------------------
 * Es la clase base de toda la jerarquía de empleados de la empresa.
 * Es "abstracta" porque no tiene sentido crear un objeto genérico
 * "Empleado" sin saber qué tipo específico es (Gerente, Vendedor,
 * Operario) — cada tipo calcula su salario de forma distinta.
 *
 * NO debes modificar este archivo. Solo debes leerlo y entender cómo
 * funciona, porque Gerente, Vendedor y Operario heredan de él.
 * ---------------------------------------------------------------------
 */
public abstract class Empleado {

    // Atributos: el estado que TODO empleado tiene, sin importar su tipo.
    protected String nombre;
    protected String cedula;
    protected double salarioBase;

    // Constructor: inicializa los atributos comunes a todos los empleados.
    public Empleado(String nombre, String cedula, double salarioBase) {
        this.nombre = nombre;
        this.cedula = cedula;
        this.salarioBase = salarioBase;
    }

    // Getters (encapsulamiento): forma controlada de leer los atributos.
    public String getNombre() {
        return nombre;
    }

    public String getCedula() {
        return cedula;
    }

    public double getSalarioBase() {
        return salarioBase;
    }

    /**
     * Método ABSTRACTO: no tiene cuerpo aquí. Cada subclase (Gerente,
     * Vendedor, Operario) ESTÁ OBLIGADA a implementarlo a su manera.
     * Esto es la base del polimorfismo: el mismo nombre de método,
     * comportamientos distintos según el objeto real que lo ejecute.
     */
    public abstract double calcularSalario();

    /**
     * Método normal (no abstracto): todas las subclases lo heredan
     * igual, pero como usa calcularSalario() por dentro, el resultado
     * cambia automáticamente según el tipo real del objeto.
     */
    public String mostrarInfo() {
        return String.format("%-10s | %-12s | %-10s | $%.2f",
                tipoDeEmpleado(), nombre, cedula, calcularSalario());
    }

    /**
     * Método abstracto adicional: cada subclase dice qué tipo de
     * empleado es (útil para mostrarlo en el reporte).
     */
    public abstract String tipoDeEmpleado();
}
