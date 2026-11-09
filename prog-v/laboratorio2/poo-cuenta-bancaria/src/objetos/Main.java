package objetos;

public class Main {

    public static void main(String[] args) {
        Persona p1 = new Persona();
        CuentaBancaria juan = new CuentaBancaria();
        CuentaBancaria enrique = new CuentaBancaria();

        p1.nombre = "";
        p1.edad = 0;

        juan.setNumerocuenta("1-2000-988");
        juan.setSaldo(10.0);
        System.out.println(juan.getSaldo());
        juan.setSaldo(-25.0);
        System.out.println(juan.getSaldo());
        juan.setEstado(1);
        System.out.println("El estado es " + juan.getEstado());

        enrique.setSaldo(100.00);
        enrique.setNombrecuenta("Enrique");
        System.out.println(enrique.getNombrecuenta() + enrique.getSaldo());
        enrique.setSaldo(1);
        int i = enrique.depositar(0.9);
        if (i == 1)
            System.out.println("Operacion de Deposito Exitosa");
        else {
            System.out.println("Operacion de Deposito No Exitosa");
        }
    }
}