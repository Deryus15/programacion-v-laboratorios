// Cliente de consola: consulta los espacios y crea una reserva.
// Ejecutar: java Cliente.java "Nombre del solicitante"
import java.net.ConnectException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

public class Cliente {
    public static void main(String[] args) throws Exception {
        String base = System.getenv().getOrDefault("SERVIDOR", "http://localhost:3000");
        String solicitante = args.length > 0 ? args[0] : "Estudiante";
        HttpClient http = HttpClient.newBuilder().version(HttpClient.Version.HTTP_1_1).build();
        try {
            HttpResponse<String> r1 = http.send(HttpRequest.newBuilder(URI.create(base + "/api/espacios")).build(),
                    HttpResponse.BodyHandlers.ofString());
            System.out.println("Espacios disponibles: " + r1.body());

            String json = String.format("{\"espacioId\":1,\"fecha\":\"2026-10-20\",\"hora\":\"07:00\",\"solicitante\":\"%s\"}", solicitante);
            HttpRequest post = HttpRequest.newBuilder(URI.create(base + "/api/reservas"))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(json)).build();
            HttpResponse<String> r2 = http.send(post, HttpResponse.BodyHandlers.ofString());
            System.out.println("Respuesta del servidor: " + r2.statusCode() + " " + r2.body());
        } catch (ConnectException e) {
            System.out.println("No se pudo conectar con el servidor en " + base + ". ¿Está encendido?");
        }
    }
}
