/**
 * Clase Operario — VERSIÓN RESUELTA (clave de corrección para el docente).
 * ---------------------------------------------------------------------
 * Un Operario gana su salario base MÁS un pago extra por cada hora
 * adicional trabajada (horas extra).
 *
 * Fórmula: salario final = salarioBase + (horasExtra * pagoPorHoraExtra)
 * ---------------------------------------------------------------------
 */
public class Operario extends Empleado {

    private int horasExtra;
    private double pagoPorHoraExtra;

    public Operario(String nombre, String cedula, double salarioBase,
                     int horasExtra, double pagoPorHoraExtra) {
        super(nombre, cedula, salarioBase);
        this.horasExtra = horasExtra;
        this.pagoPorHoraExtra = pagoPorHoraExtra;
    }

    @Override
    public double calcularSalario() {
        return salarioBase + (horasExtra * pagoPorHoraExtra);
    }

    @Override
    public String tipoDeEmpleado() {
        return "Operario";
    }
}
