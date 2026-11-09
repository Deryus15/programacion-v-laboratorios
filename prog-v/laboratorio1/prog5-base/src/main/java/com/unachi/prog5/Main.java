package com.unachi.prog5;

import com.unachi.prog5.controller.AppController;
import com.unachi.prog5.view.ConsoleView;

public class Main {
    public static void main(String[] args) {
        AppController controller = new AppController(new ConsoleView());
        controller.run();
    }
}