// Utilidad compartida por Cliente y Carga: envía una solicitud HTTP con HttpURLConnection (Java 8).
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;

public class Http {
    public static class Respuesta {
        public final int codigo; public final String cuerpo;
        Respuesta(int codigo, String cuerpo) { this.codigo = codigo; this.cuerpo = cuerpo; }
    }

    public static Respuesta enviar(String metodo, String url, String json) throws IOException {
        HttpURLConnection con = (HttpURLConnection) new URL(url).openConnection();
        con.setRequestMethod(metodo);
        con.setConnectTimeout(10000);
        con.setReadTimeout(60000);
        if (json != null) {
            con.setDoOutput(true);
            con.setRequestProperty("Content-Type", "application/json");
            try (OutputStream os = con.getOutputStream()) { os.write(json.getBytes(StandardCharsets.UTF_8)); }
        }
        int codigo = con.getResponseCode();
        InputStream in = codigo >= 400 ? con.getErrorStream() : con.getInputStream();
        String cuerpo = "";
        if (in != null) {
            ByteArrayOutputStream buf = new ByteArrayOutputStream();
            byte[] b = new byte[4096];
            int n;
            while ((n = in.read(b)) != -1) buf.write(b, 0, n);
            in.close();
            cuerpo = new String(buf.toByteArray(), StandardCharsets.UTF_8);
        }
        con.disconnect();
        return new Respuesta(codigo, cuerpo);
    }

    public static String base() {
        String s = System.getenv("SERVIDOR");
        return s != null ? s : "http://localhost:3000";
    }
}
