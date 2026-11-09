package com.unachi.inventario.negocio;

/**
 * Excepción propia de la capa de Negocio.
 * Se lanza cuando se viola una regla del negocio (no un error técnico de
 * base de datos), por ejemplo: código de barra duplicado, cantidad de
 * salida mayor a la existencia disponible, etc.
 *
 * La capa de Presentación captura este tipo de excepción para mostrar
 * el mensaje directamente al usuario en el formulario correspondiente.
 */
public class NegocioException extends Exception {

    public NegocioException(String mensaje) {
        super(mensaje);
    }
}
