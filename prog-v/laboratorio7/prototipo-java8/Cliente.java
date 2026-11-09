// Cliente de consola: consulta los espacios y crea una reserva.
// Ejecutar: java Cliente "Nombre del solicitante"
import java.net.ConnectException;

public class Cliente {
    public static void main(String[] args) throws Exception {
        String base = Http.base();
        String solicitante = args.length > 0 ? args[0] : "Estudiante";
        try {
            Http.Respuesta r1 = Http.enviar("GET", base + "/api/espacios", null);
            System.out.println("Espacios disponibles: " + r1.cuerpo);

            String json = String.format("{\"espacioId\":1,\"fecha\":\"2026-10-20\",\"hora\":\"07:00\",\"solicitante\":\"%s\"}", solicitante);
            Http.Respuesta r2 = Http.enviar("POST", base + "/api/reservas", json);
            System.out.println("Respuesta del servidor: " + r2.codigo + " " + r2.cuerpo);
        } catch (ConnectException e) {
            System.out.println("No se pudo conectar con el servidor en " + base + ". ¿Está encendido?");
        }
    }
}
