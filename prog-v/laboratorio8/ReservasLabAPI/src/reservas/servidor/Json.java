package reservas.servidor;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import reservas.modelo.Reserva;

/**
 * Conversión JSON mínima, sin librerías externas (para que el proyecto
 * compile en Java 8 / NetBeans sin agregar JARs).
 * En un proyecto real se usaría Gson o Jackson.
 */
public final class Json {

    private Json() { }

    public static String deReserva(Reserva r) {
        return "{"
                + "\"id\":" + r.getId() + ","
                + "\"laboratorio\":" + texto(r.getLaboratorio()) + ","
                + "\"solicitante\":" + texto(r.getSolicitante()) + ","
                + "\"fecha\":" + texto(r.getFecha()) + ","
                + "\"horaInicio\":" + texto(r.getHoraInicio()) + ","
                + "\"horaFin\":" + texto(r.getHoraFin()) + ","
                + "\"estado\":" + texto(r.getEstado())
                + "}";
    }

    public static String deLista(List<Reserva> lista) {
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < lista.size(); i++) {
            if (i > 0) sb.append(",");
            sb.append(deReserva(lista.get(i)));
        }
        return sb.append("]").toString();
    }

    public static String error(int codigo, String mensaje) {
        return "{\"error\":" + codigo + ",\"mensaje\":" + texto(mensaje) + "}";
    }

    /** Convierte un JSON plano {"clave":"valor",...} en una Reserva. */
    public static Reserva aReserva(String json) {
        Map<String, String> m = parsearPlano(json);
        Reserva r = new Reserva();
        r.setLaboratorio(m.get("laboratorio"));
        r.setSolicitante(m.get("solicitante"));
        r.setFecha(m.get("fecha"));
        r.setHoraInicio(m.get("horaInicio"));
        r.setHoraFin(m.get("horaFin"));
        return r;
    }

    // ------------------------------------------------------------------

    private static String texto(String s) {
        if (s == null) return "null";
        return "\"" + s.replace("\\", "\\\\").replace("\"", "\\\"") + "\"";
    }

    /** Parser sencillo para objetos JSON de un solo nivel. */
    static Map<String, String> parsearPlano(String json) {
        Map<String, String> m = new HashMap<String, String>();
        if (json == null) return m;
        String s = json.trim();
        if (!s.startsWith("{") || !s.endsWith("}")) {
            throw new IllegalArgumentException("El cuerpo debe ser un objeto JSON");
        }
        s = s.substring(1, s.length() - 1);
        int i = 0;
        while (i < s.length()) {
            int ini = s.indexOf('"', i);
            if (ini < 0) break;
            int fin = s.indexOf('"', ini + 1);
            String clave = s.substring(ini + 1, fin);
            int dosPuntos = s.indexOf(':', fin);
            int j = dosPuntos + 1;
            while (j < s.length() && Character.isWhitespace(s.charAt(j))) j++;
            String valor;
            if (j < s.length() && s.charAt(j) == '"') {
                StringBuilder sb = new StringBuilder();
                j++;
                while (j < s.length() && s.charAt(j) != '"') {
                    if (s.charAt(j) == '\\' && j + 1 < s.length()) j++;
                    sb.append(s.charAt(j));
                    j++;
                }
                valor = sb.toString();
                j++;
            } else {
                int coma = s.indexOf(',', j);
                if (coma < 0) coma = s.length();
                valor = s.substring(j, coma).trim();
                j = coma;
            }
            m.put(clave, valor);
            i = j + 1;
        }
        return m;
    }
}
