package reservas.modelo;

/**
 * Entidad del dominio: una reserva de laboratorio.
 * RF-01..RF-05 trabajan sobre esta clase.
 */
public class Reserva {

    private int id;
    private String laboratorio;   // ej. "LAB-1"
    private String solicitante;   // nombre del docente o estudiante
    private String fecha;         // formato yyyy-MM-dd
    private String horaInicio;    // formato HH:mm
    private String horaFin;       // formato HH:mm
    private String estado;        // ACTIVA | CANCELADA

    public Reserva() {
        this.estado = "ACTIVA";
    }

    public Reserva(String laboratorio, String solicitante, String fecha,
                   String horaInicio, String horaFin) {
        this();
        this.laboratorio = laboratorio;
        this.solicitante = solicitante;
        this.fecha = fecha;
        this.horaInicio = horaInicio;
        this.horaFin = horaFin;
    }

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public String getLaboratorio() { return laboratorio; }
    public void setLaboratorio(String laboratorio) { this.laboratorio = laboratorio; }

    public String getSolicitante() { return solicitante; }
    public void setSolicitante(String solicitante) { this.solicitante = solicitante; }

    public String getFecha() { return fecha; }
    public void setFecha(String fecha) { this.fecha = fecha; }

    public String getHoraInicio() { return horaInicio; }
    public void setHoraInicio(String horaInicio) { this.horaInicio = horaInicio; }

    public String getHoraFin() { return horaFin; }
    public void setHoraFin(String horaFin) { this.horaFin = horaFin; }

    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }

    @Override
    public String toString() {
        return String.format("#%d %s | %s | %s %s-%s | %s",
                id, laboratorio, solicitante, fecha, horaInicio, horaFin, estado);
    }
}
