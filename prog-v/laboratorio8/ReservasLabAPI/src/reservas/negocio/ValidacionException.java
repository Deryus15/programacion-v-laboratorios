package reservas.negocio;

/**
 * Error de regla de negocio. El servidor lo traduce a un código HTTP
 * (400 Bad Request, 404 Not Found o 409 Conflict).
 */
public class ValidacionException extends RuntimeException {

    private final int codigoHttp;

    public ValidacionException(int codigoHttp, String mensaje) {
        super(mensaje);
        this.codigoHttp = codigoHttp;
    }

    public int getCodigoHttp() {
        return codigoHttp;
    }
}
