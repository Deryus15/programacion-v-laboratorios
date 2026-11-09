/**
 * Clase Gerente — EJEMPLO COMPLETO Y RESUELTO.
 * ---------------------------------------------------------------------
 * Úsala como modelo para completar Vendedor.java y Operario.java.
 * No necesitas modificar este archivo.
 *
 * Un Gerente gana su salario base MÁS un bono fijo por dirección de
 * equipo.
 * ---------------------------------------------------------------------
 */
public class Gerente extends Empleado {

    // Atributo PROPIO de Gerente (no existe en la clase base Empleado).
    private double bonoDireccion;

    // Constructor: primero inicializa lo que es común (con super(...)),
    // luego lo que es propio de esta subclase.
    public Gerente(String nombre, String cedula, double salarioBase, double bonoDireccion) {
        super(nombre, cedula, salarioBase);
        this.bonoDireccion = bonoDireccion;
    }

    // Implementación PROPIA de calcularSalario() para un Gerente.
    @Override
    public double calcularSalario() {
        return salarioBase + bonoDireccion;
    }

    @Override
    public String tipoDeEmpleado() {
        return "Gerente";
    }
}
