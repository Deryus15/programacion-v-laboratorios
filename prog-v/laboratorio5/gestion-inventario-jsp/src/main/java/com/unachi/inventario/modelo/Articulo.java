package com.unachi.inventario.modelo;

/**
 * Entidad Articulo.
 * Campos: id, codigoBarra, nombre.
 */
public class Articulo {

    private int id;
    private String codigoBarra;
    private String nombre;

    public Articulo() {
    }

    public Articulo(int id, String codigoBarra, String nombre) {
        this.id = id;
        this.codigoBarra = codigoBarra;
        this.nombre = nombre;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getCodigoBarra() {
        return codigoBarra;
    }

    public void setCodigoBarra(String codigoBarra) {
        this.codigoBarra = codigoBarra;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }
}
