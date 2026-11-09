/**
 * Clase Vendedor — VERSIÓN RESUELTA (clave de corrección para el docente).
 * ---------------------------------------------------------------------
 * Un Vendedor gana su salario base MÁS una comisión, que es un
 * porcentaje del monto total de ventas que realizó en el mes.
 *
 * Fórmula: salario final = salarioBase + (montoVentas * porcentajeComision)
 * ---------------------------------------------------------------------
 */
public class Vendedor extends Empleado {

    private double montoVentas;
    private double porcentajeComision;

    public Vendedor(String nombre, String cedula, double salarioBase,
                     double montoVentas, double porcentajeComision) {
        super(nombre, cedula, salarioBase);
        this.montoVentas = montoVentas;
        this.porcentajeComision = porcentajeComision;
    }

    @Override
    public double calcularSalario() {
        return salarioBase + (montoVentas * porcentajeComision);
    }

    @Override
    public String tipoDeEmpleado() {
        return "Vendedor";
    }
}
