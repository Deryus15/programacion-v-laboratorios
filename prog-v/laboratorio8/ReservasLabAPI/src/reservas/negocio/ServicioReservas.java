package reservas.negocio;

import java.util.Arrays;
import java.util.List;

import reservas.datos.RepositorioReservas;
import reservas.modelo.Reserva;

/**
 * Capa de negocio: aquí viven las REGLAS que salen de los requisitos funcionales.
 * Ni el servidor HTTP ni el cliente conocen estas reglas; solo las consumen.
 */
public class ServicioReservas {

    // RF-06: solo existen estos laboratorios en la Escuela
    private static final List<String> LABORATORIOS = Arrays.asList("LAB-1", "LAB-2", "LAB-3");

    private final RepositorioReservas repo;

    public ServicioReservas(RepositorioReservas repo) {
        this.repo = repo;
    }

    /** RF-01: listar reservas. */
    public List<Reserva> listar() {
        return repo.listarTodas();
    }

    /** RF-02: consultar una reserva por su identificador. */
    public Reserva obtener(int id) {
        Reserva r = repo.buscarPorId(id);
        if (r == null) {
            throw new ValidacionException(404, "No existe la reserva con id " + id);
        }
        return r;
    }

    /** RF-03: registrar una reserva validando datos y choques de horario. */
    public Reserva crear(Reserva r) {
        validarDatos(r);
        validarChoque(r, 0);
        r.setEstado("ACTIVA");
        return repo.guardar(r);
    }

    /** RF-04: modificar una reserva existente. */
    public Reserva actualizar(int id, Reserva cambios) {
        Reserva actual = obtener(id);
        validarDatos(cambios);
        validarChoque(cambios, id);
        actual.setLaboratorio(cambios.getLaboratorio());
        actual.setSolicitante(cambios.getSolicitante());
        actual.setFecha(cambios.getFecha());
        actual.setHoraInicio(cambios.getHoraInicio());
        actual.setHoraFin(cambios.getHoraFin());
        return repo.guardar(actual);
    }

    /** RF-05: cancelar (eliminar) una reserva. */
    public void cancelar(int id) {
        if (!repo.eliminar(id)) {
            throw new ValidacionException(404, "No existe la reserva con id " + id);
        }
    }

    // ---------------- reglas privadas ----------------

    private void validarDatos(Reserva r) {
        if (vacio(r.getLaboratorio()) || vacio(r.getSolicitante()) || vacio(r.getFecha())
                || vacio(r.getHoraInicio()) || vacio(r.getHoraFin())) {
            throw new ValidacionException(400,
                    "Campos obligatorios: laboratorio, solicitante, fecha, horaInicio, horaFin");
        }
        if (!LABORATORIOS.contains(r.getLaboratorio().toUpperCase())) {
            throw new ValidacionException(400, "Laboratorio inválido. Use: " + LABORATORIOS);
        }
        r.setLaboratorio(r.getLaboratorio().toUpperCase());
        if (!r.getFecha().matches("\\d{4}-\\d{2}-\\d{2}")) {
            throw new ValidacionException(400, "La fecha debe tener formato yyyy-MM-dd");
        }
        if (!r.getHoraInicio().matches("\\d{2}:\\d{2}") || !r.getHoraFin().matches("\\d{2}:\\d{2}")) {
            throw new ValidacionException(400, "Las horas deben tener formato HH:mm");
        }
        if (r.getHoraInicio().compareTo(r.getHoraFin()) >= 0) {
            throw new ValidacionException(400, "horaInicio debe ser menor que horaFin");
        }
    }

    /** RF-07: un laboratorio no puede tener dos reservas que se solapen. */
    private void validarChoque(Reserva nueva, int idIgnorado) {
        for (Reserva r : repo.listarPorLaboratorioYFecha(nueva.getLaboratorio(), nueva.getFecha())) {
            if (r.getId() == idIgnorado) {
                continue;
            }
            boolean seSolapan = nueva.getHoraInicio().compareTo(r.getHoraFin()) < 0
                    && r.getHoraInicio().compareTo(nueva.getHoraFin()) < 0;
            if (seSolapan) {
                throw new ValidacionException(409, "Choque de horario con la reserva #" + r.getId()
                        + " (" + r.getHoraInicio() + "-" + r.getHoraFin() + ")");
            }
        }
    }

    private boolean vacio(String s) {
        return s == null || s.trim().isEmpty();
    }
}
