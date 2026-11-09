# Práctica: Arquitectura MVC con Spring Boot, Eclipse y MariaDB

## Objetivo general
Desarrollar una aplicación web CRUD utilizando el patrón MVC y una arquitectura por capas.

## Objetivos específicos
Al finalizar la práctica, el estudiante podrá:

1. Explicar la función de Model, View y Controller.
2. Crear un proyecto Spring Boot en Eclipse.
3. Configurar una conexión a MariaDB.
4. Crear una entidad JPA.
5. Utilizar Spring Data JPA mediante un Repository.
6. Crear una capa Service.
7. Implementar un Controller.
8. Crear vistas con Thymeleaf y Bootstrap.
9. Implementar operaciones CRUD.

---

# 1. Arquitectura

Navegador
    |
    v
Controller
    |
    v
Service
    |
    v
Repository
    |
    v
MariaDB

El resultado vuelve mediante:

MariaDB -> Repository -> Service -> Controller -> View -> Navegador

## Model
Representa la información del sistema.

Clase:
`Estudiante.java`

## View
Representa la interfaz que ve el usuario.

Archivos:
- `lista.html`
- `formulario.html`

## Controller
Recibe las solicitudes HTTP y decide qué operación ejecutar.

Clase:
`EstudianteController.java`

## Service
Contiene la lógica de negocio.

Clase:
`EstudianteService.java`

## Repository
Gestiona el acceso a la base de datos.

Clase:
`EstudianteRepository.java`

---

# 2. Requisitos

- Eclipse IDE
- JDK 21
- Maven
- MariaDB
- Navegador web

---

# 3. Crear la base de datos

Ejecute:

```sql
CREATE DATABASE mvc_unachi;
```

O ejecute directamente el archivo:

`database.sql`

---

# 4. Importar el proyecto en Eclipse

1. Abrir Eclipse.
2. Seleccionar:
   File > Import
3. Seleccionar:
   Maven > Existing Maven Projects
4. Seleccionar la carpeta `mvc-estudiantes`.
5. Eclipse detectará el archivo `pom.xml`.
6. Presionar Finish.
7. Espere a que Maven descargue las dependencias.

Si Eclipse muestra errores de dependencias:

Project > Maven > Update Project

---

# 5. Revisar application.properties

```properties
spring.datasource.url=jdbc:mariadb://localhost:3306/mvc_unachi
spring.datasource.username=mvc_user
spring.datasource.password=MVC2026*
```

Cambie usuario o contraseña si su instalación utiliza otros valores.

---

# 6. Ejecutar el proyecto

Desde Eclipse:

1. Buscar `MvcEstudiantesApplication.java`.
2. Clic derecho.
3. Run As > Java Application

También puede utilizar:

```bash
mvn spring-boot:run
```

Luego abra:

http://localhost:8080

---

# 7. Operaciones del CRUD

## CREATE
Nuevo estudiante:

GET `/estudiantes/nuevo`

Guardar:

POST `/estudiantes/guardar`

## READ
Listado:

GET `/estudiantes`

## UPDATE
Editar:

GET `/estudiantes/editar/{id}`

## DELETE
Eliminar:

GET `/estudiantes/eliminar/{id}`

---

# 8. Flujo de una petición

Ejemplo: listar estudiantes.

### Paso 1
El navegador solicita:

`GET /estudiantes`

### Paso 2
Spring ejecuta:

```java
@GetMapping
public String listar(...)
```

### Paso 3
El Controller llama:

```java
service.listar(buscar)
```

### Paso 4
El Service llama al Repository.

```java
repository.findAll()
```

### Paso 5
JPA consulta MariaDB.

### Paso 6
El Controller envía los estudiantes al Model:

```java
model.addAttribute("estudiantes", ...)
```

### Paso 7
Thymeleaf procesa:

`lista.html`

### Paso 8
El navegador recibe HTML.

---

# 9. Actividad para los estudiantes

## Parte A
Ejecute el proyecto y registre tres estudiantes.

## Parte B
Modifique un estudiante.

## Parte C
Elimine un estudiante.

## Parte D
Utilice el buscador.

## Parte E
Agregue un nuevo atributo:

`telefono`

Debe modificar:

1. Base de datos.
2. Entidad.
3. Formulario.
4. Tabla de listado.

---

# 10. Reto adicional

Agregar el campo:

`semestre`

y crear un filtro para mostrar estudiantes por semestre.

---

# 11. Preguntas de análisis

1. ¿Por qué el Controller no debería conectarse directamente a MariaDB?
2. ¿Cuál es la diferencia entre Repository y Service?
3. ¿Qué función realiza `@Entity`?
4. ¿Qué función realiza `@Controller`?
5. ¿Qué hace `@GetMapping`?
6. ¿Qué hace `@PostMapping`?
7. ¿Qué ventaja proporciona `JpaRepository`?
8. ¿Qué información pasa el Controller a la View?
9. ¿Qué ocurriría si se elimina la capa Service?
10. ¿Cómo ayuda MVC al mantenimiento del software?

---

# 12. Ejercicio evaluativo

Modificar el sistema para administrar cursos.

Entidad `Curso`:

- id
- codigo
- nombre
- creditos
- profesor

Debe implementar:

- Listar
- Crear
- Editar
- Eliminar
- Buscar

El estudiante deberá crear:

- Curso.java
- CursoRepository.java
- CursoService.java
- CursoController.java
- lista.html
- formulario.html

Esto permite comprobar que comprende la arquitectura y no solamente copia el ejemplo.
