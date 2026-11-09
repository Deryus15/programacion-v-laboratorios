# Laboratorio 4 — Proyecto MVC (Spring Boot + MySQL/MariaDB)

Proyecto: `mvc-estudiantes/` (Maven, Spring Boot 4.1.1, Thymeleaf, JPA). **Requiere JDK 21.**
Estado: **probado el 30/10/2026** en http://localhost:8080/estudiantes (muestra Ana y Carlos).

## Antes de presentar
1. XAMPP Control Panel -> **Start** en **MySQL**.
2. La base `mvc_unachi` y el usuario `mvc_user` ya están creados (script: `mvc-estudiantes/database.sql`).
3. El puerto 8080 debe estar libre (no correr a la vez que el Tomcat del lab 5).

## Correr en VS Code
1. Abrir `mvc-estudiantes/src/main/java/pa/ac/unachi/mvcestudiantes/MvcEstudiantesApplication.java`.
2. Pulsar **Run** (encima de `main`) o el panel **Spring Boot Dashboard** -> `mvc-estudiantes` -> Start.
3. Abrir http://localhost:8080/estudiantes

## Desde terminal (alternativa)
```
mvn spring-boot:run
```
con `JAVA_HOME` apuntando al JDK 21 (ver `.vscode/settings.json` del workspace).

## Si algo falla
| Síntoma | Causa | Solución |
|---|---|---|
| `release version 21 not supported` | Maven usa JDK 17 | Usar JDK 21 (extensión Pleiades lo trae) |
| `Communications link failure` | MySQL apagado | Start MySQL en XAMPP |
| `Port 8080 was already in use` | Otro servidor en 8080 | Detenerlo |
