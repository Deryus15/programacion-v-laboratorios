package com.unachi.prog5.model;

public class Student {
    private final String id;
    private final String name;

    public Student(String id, String name) {
        this.id = id;
        this.name = name;
    }

    public String summary() {
        return "Student{id='" + id + "', name='" + name + "'}";
    }
}