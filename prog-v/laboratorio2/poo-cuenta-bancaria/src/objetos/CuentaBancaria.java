package objetos;

public class CuentaBancaria {
    private String numerocuenta;
    private String nombrecuenta;
    private double saldo;
    private int tipocuenta;
    private int estado; // 1 activa 0 inactiva

    public int getEstado() {
        return estado;
    }

    public void setEstado(int estado) {
        if ((estado == 0) || (estado == 1))
            this.estado = estado;
    }

    public String getNumerocuenta() {
        return numerocuenta;
    }

    public void setNumerocuenta(String numerocuenta) {
        this.numerocuenta = numerocuenta;
    }

    public String getNombrecuenta() {
        return nombrecuenta;
    }

    public void setNombrecuenta(String nombrecuenta) {
        this.nombrecuenta = nombrecuenta;
    }

    public double getSaldo() {
        return saldo;
    }

    public void setSaldo(double saldo) {
        if (saldo > 0) {
            this.saldo = saldo;
        }
    }

    public int getTipocuenta() {
        return tipocuenta;
    }

    public void setTipocuenta(int tipocuenta) {
        this.tipocuenta = tipocuenta;
    }

    public int depositar(double monto) {
        if (monto > 0) {
            this.saldo += monto;
            return 1;
        } else
            return 0;
    }
}