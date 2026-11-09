# Laboratorio 1 — Preparación del Entorno de Desarrollo

**Se ejecuta:** sí. **Necesita XAMPP:** no. **JDK:** 17.
Estado: probado el 30/10/2026 (imprime `Hola Programacion V` y el `Student`).

## Qué hay aquí
- `prog5-base/` — proyecto Maven `com.unachi.prog5:prog5-base` con paquetes `model`, `view`, `controller` y `Main`.
- `enunciado/Guia_Laboratorio1_Moodle.pdf` — guía original del docente (Eclipse).
- `enunciado/Laboratorio1.pdf` — informe ya redactado (versión VS Code).

## Ejecutar
1. Abrir `prog5-base/src/main/java/com/unachi/prog5/Main.java` y pulsar **Run** sobre `main`.
   (o Run and Debug → **Lab1 - Main (MVC base)**)
2. Salida esperada:
```
Hola Programacion V
Modelo: Student{id='2026-001', name='Nombre Apellido'}
```

## Verificar el entorno (parte del lab)
```
java -version    # 17.x
javac -version   # 17.x
mvn -v
git --version
```
