# README2 — Cómo correr cada laboratorio (Programación V)

Última verificación: **30/10/2026**. Todo lo marcado ✅ se ejecutó y respondió bien desde la línea de comandos.

## Portafolio web (todo en un solo lugar)
Doble clic en `iniciar-portafolio.bat` (o `node portafolio/server.js`) → http://localhost:5173. Desde ahí se ven la descripción, el código y los documentos de cada lab, y se inician/detienen los servidores (labs 4, 5, 7, 8), se ejecutan los labs 1 y 2 y se prueban las APIs. Repo: https://github.com/Deryus15/programacion-v-laboratorios. Detalle en `README.md`.

## Cómo abrirlo en VS Code (probado el 30/10/2026 con VS Code real)
1. VS Code → **File → Open Folder** → `...\Programacion-V-Laboratorios\prog-v`
2. Si pregunta por confiar en la carpeta → **Confiar** (sin eso Java no arranca).
3. Espera a que abajo diga **Java: Ready** (la primera vez tarda 1–2 min).
4. En la barra izquierda verás `laboratorio1` … `laboratorio8`. Cada uno tiene su `README.md`.
5. **Para ejecutar: abre el archivo con `main` y pulsa el botón ▷ (Run Java) arriba a la derecha del editor.** La salida sale en la terminal de abajo.
   - El ▷ usa la configuración de `.vscode/launch.json` de esa clase (por eso el Cliente del lab 7 sale con "Ana Perez" y el del lab 8 con `demo`).
6. **Si ves "not a valid java project" o "Project configuration is not up-to-date":** abre el `pom.xml` de ese laboratorio y pulsa **Mayús+Alt+U** (Reload Projects). Es normal la primera vez.
7. Tu VS Code **autoguarda**: no escribas texto con el foco en un archivo por accidente.

## ¿Qué debo encender?
| Lab | ¿Se ejecuta? | XAMPP / MySQL | Qué más |
|---|---|---|---|
| 1 | ✅ | NO | — |
| 2 | ✅ | NO | — |
| 3 | No (documento) | NO | — |
| 4 | ✅ | **SÍ: MySQL** | puerto 8080 libre, JDK 21 |
| 5 | ✅ | **SÍ: MySQL** | Tomcat 10 desde VS Code, puerto 8080 libre |
| 6 | No (documento) | NO | — |
| 7 | ✅ | NO | puerto 3000 |
| 8 | ✅ | NO | puerto 8080 libre |

**XAMPP: solo MySQL** (botón *Start* en la fila MySQL). **Apache no hace falta.**
Si el panel de XAMPP diera problemas, doble clic en `iniciar-mysql.bat` (y `detener-mysql.bat` para apagarlo).
**Los labs 4, 5 y 8 usan el puerto 8080: corre de a uno.**

## Qué archivo ejecutar, lab por lab
**Lab 1** — `laboratorio1/prog5-base/src/main/java/com/unachi/prog5/Main.java` → Run.
**Lab 2** — `laboratorio2/patrones/src/main/java/MaestroEsclavoFacturas.java` y `PipeFilterLogs.java`; `laboratorio2/poo-cuenta-bancaria/src/objetos/Main.java`; `laboratorio2/taller-poo/codigo_completo/Main.java` → ▷ en cada uno.
**Lab 3 y 6** — solo documentos (PDF en `enunciado/`).
**Lab 4** — MySQL encendido → `laboratorio4/mvc-estudiantes/src/main/java/pa/ac/unachi/mvcestudiantes/MvcEstudiantesApplication.java` → Run → http://localhost:8080/estudiantes (deben salir Ana y Carlos).
**Lab 5 (Tomcat)** — MySQL encendido, luego (probado así en VS Code):
  1. En el explorador abre `laboratorio5/gestion-inventario-jsp/target/` → clic derecho en **`gestion-inventario.war`** → **Run on Server**.
     (Si no existe el WAR: clic derecho en el `pom.xml` → Maven → package, o panel Maven → Lifecycle → package.)
  2. Elige el servidor **apache-tomcat-10.0.0** → "Do you want to edit optional deployment parameters?" → **No**.
  3. Espera a ver `Catalina.start Server startup` y `Deployment of web application archive ...gestion-inventario.war`.
  4. http://localhost:8080/gestion-inventario/ → `/articulos` y `/existencias` (Arroz 50, Aceite 30, Azúcar 0).
  - Para parar: panel **Servers** → clic derecho en el servidor → Stop.
  - No uses "Run on Server" sobre el `pom.xml`: registra el pom como despliegue y no publica nada (404).
  - El panel Servers también muestra un despliegue viejo de OneDrive (tu copia anterior): no estorba, tiene otro nombre de contexto.
**Lab 7** — abre `prototipo-java21/src/main/java/` y pulsa ▷ en orden: `Servidor.java` → `Cliente.java` (1.ª vez 201, 2.ª vez 409) → `Carga.java`. Puerto 3000. Para parar el servidor: botón ■ de la barra de depuración o cierra su terminal.
**Lab 8** — `ReservasLabAPI/src/reservas/servidor/ServidorReservas.java` (▷) → luego `ReservasLabAPI/src/reservas/cliente/ClienteConsola.java` (▷: ejecuta la demo de 9 casos). Menú interactivo: Run and Debug → "Lab8 - 2b) Cliente (menú interactivo)". O doble clic en `ReservasLabAPI/ejecutar.bat`.

## Si algo falla
| Síntoma | Solución |
|---|---|
| Lab 4/5: error de conexión a la base | Falta **Start MySQL** en XAMPP |
| `Port 8080 was already in use` | Hay otro lab/servidor en 8080: detenerlo |
| Lab 4: `release version 21 not supported` | Maven con JDK 17; usar JDK 21 (lo trae la extensión Pleiades) |
| Lab 5: 404 | No se publicó: clic derecho en el servidor → Publish Server (Full) |
| Tildes raras en consola | `chcp 65001` (la terminal de este workspace ya lo hace) |

## Qué se hizo en el equipo (para que lo sepas)
- **MySQL de XAMPP estaba dañado** y se reconstruyó. El `data` viejo está en `C:\xampp\mysql\data_viejo_30-10-2026` y hay respaldo en `respaldos/mysql-data-30-10-2026/`. Tu base `rrhh_examen` se rescató y está importada (volcado en `respaldos/rrhh_examen-volcado-30-10-2026.sql`).
- Bases importadas: `inventario_db` (lab 5), `mvc_unachi` + usuario `mvc_user` (lab 4).
- Archivos de Moodle (zips, .docx, guías) en `recursos-moodle/`.
- No se instaló nada: Tomcat 10.0.0 ya lo tenía tu extensión.

## Tareas pendientes en Moodle (ver `asignaciones-pendientes/pendientes.md`)
- **Proyecto Paga YA** — vence **01/11/2026 00:00** (sin entregar).
- **Laboratorio Patrones Arquitectónicos** — vencida el 11/09/2026 (sin entregar).
No se entregó nada en Moodle; eso lo haces tú (o me lo pides y lo confirmamos antes).

## Qué sí y qué no se comprobó
- **Sí, dentro de VS Code real** (con ▷ y Run on Server): labs 1, 2, 4, 5, 7 y 8.
- **No comprobado:** el botón Start/Stop del panel de XAMPP (MySQL lo encendí con `iniciar-mysql.bat`, que ejecuta el mismo comando que el panel), y el **Spring Boot Dashboard** de VS Code (el lab 4 corrió con ▷ sobre `MvcEstudiantesApplication.java`).
- Si algún botón se comporta distinto en tu equipo, dime cuál y lo ajusto.
