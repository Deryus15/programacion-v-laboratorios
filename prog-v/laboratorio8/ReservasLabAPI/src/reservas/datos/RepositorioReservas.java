package reservas.datos;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

import reservas.modelo.Reserva;

/**
 * Capa de acceso a datos (en memoria para el ejemplo).
 *
 * RNF-04 (Concurrencia): el servidor atiende varias solicitudes a la vez,
 * por eso se usa ConcurrentHashMap y AtomicInteger en lugar de HashMap e int.
 * En el proyecto real esta clase se reemplaza por JDBC + MySQL/PostgreSQL
 * sin tocar las demás capas.
 */
public class RepositorioReservas {

    private final Map<Integer, Reserva> tabla = new ConcurrentHashMap<Integer, Reserva>();
    private final AtomicInteger secuencia = new AtomicInteger(0);

    public Reserva guardar(Reserva r) {
        if (r.getId() == 0) {
            r.setId(secuencia.incrementAndGet());
        }
        tabla.put(r.getId(), r);
        return r;
    }

    public Reserva buscarPorId(int id) {
        return tabla.get(id);
    }

    public List<Reserva> listarTodas() {
        List<Reserva> lista = new ArrayList<Reserva>(tabla.values());
        lista.sort((a, b) -> Integer.compare(a.getId(), b.getId()));
        return lista;
    }

    public List<Reserva> listarPorLaboratorioYFecha(String lab, String fecha) {
        List<Reserva> res = new ArrayList<Reserva>();
        for (Reserva r : tabla.values()) {
            if (r.getLaboratorio().equalsIgnoreCase(lab) && r.getFecha().equals(fecha)) {
                res.add(r);
            }
        }
        return res;
    }

    public boolean eliminar(int id) {
        return tabla.remove(id) != null;
    }
}
