package com.unachi.prog5.controller;

import com.unachi.prog5.model.Student;
import com.unachi.prog5.view.ConsoleView;

public class AppController {
    private final ConsoleView view;

    public AppController(ConsoleView view) {
        this.view = view;
    }

    public void run() {
        Student s = new Student("2026-001", "Nombre Apellido");
        view.showMessage("Hola Programacion V");
        view.showMessage("Modelo: " + s.summary());
    }
}