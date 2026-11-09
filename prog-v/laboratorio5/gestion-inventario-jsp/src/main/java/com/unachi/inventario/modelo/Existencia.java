package com.unachi.inventario.modelo;

/**
 * Entidad Existencia.
 * Campos solicitados: id, cantidadExistencia.
 *
 * NOTA: se agrega articuloId como llave foránea hacia Articulo, ya que una
 * existencia siempre pertenece a un artículo concreto; sin este vínculo no
 * sería posible saber de qué artículo es la cantidad registrada.
 *
 * Los campos nombreArticulo y codigoBarraArticulo son transitorios (no se
 * guardan en la tabla existencia): se llenan solo para mostrar información
 * legible en las pantallas de listado, evitando así hacer una segunda
 * consulta desde la capa de presentación.
 */
public class Existencia {

    private int id;
    private int articuloId;
    private int cantidadExistencia;

    // Campos de solo lectura para mostrar en pantalla (no se persisten)
    private String nombreArticulo;
    private String codigoBarraArticulo;

    public Existencia() {
    }

    public Existencia(int id, int articuloId, int cantidadExistencia) {
        this.id = id;
        this.articuloId = articuloId;
        this.cantidadExistencia = cantidadExistencia;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public int getArticuloId() {
        return articuloId;
    }

    public void setArticuloId(int articuloId) {
        this.articuloId = articuloId;
    }

    public int getCantidadExistencia() {
        return cantidadExistencia;
    }

    public void setCantidadExistencia(int cantidadExistencia) {
        this.cantidadExistencia = cantidadExistencia;
    }

    public String getNombreArticulo() {
        return nombreArticulo;
    }

    public void setNombreArticulo(String nombreArticulo) {
        this.nombreArticulo = nombreArticulo;
    }

    public String getCodigoBarraArticulo() {
        return codigoBarraArticulo;
    }

    public void setCodigoBarraArticulo(String codigoBarraArticulo) {
        this.codigoBarraArticulo = codigoBarraArticulo;
    }
}
