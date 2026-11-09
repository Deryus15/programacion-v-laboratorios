#!/usr/bin/env node
/**
 * Empaqueta el código fuente de cada laboratorio en web/js/codigo.js
 * para que el portafolio muestre el código incluso sin servidor (p. ej. GitHub Pages).
 * Uso:  node portafolio/scripts/build-codigo.js
 */
const fs = require('fs');
const path = require('path');

const PROG = path.resolve(__dirname, '..', '..', 'prog-v');
const OUT = path.resolve(__dirname, '..', 'web', 'js', 'codigo.js');

const J = 'src/main/java/';
const MANIFEST = {
  lab1: ['laboratorio1/prog5-base/' + J + 'com/unachi/prog5/Main.java',
         'laboratorio1/prog5-base/' + J + 'com/unachi/prog5/model/Student.java',
         'laboratorio1/prog5-base/' + J + 'com/unachi/prog5/view/ConsoleView.java',
         'laboratorio1/prog5-base/' + J + 'com/unachi/prog5/controller/AppController.java',
         'laboratorio1/prog5-base/pom.xml'],
  lab2: ['laboratorio2/patrones/' + J + 'MaestroEsclavoFacturas.java',
         'laboratorio2/patrones/' + J + 'PipeFilterLogs.java',
         'laboratorio2/poo-cuenta-bancaria/src/objetos/CuentaBancaria.java',
         'laboratorio2/poo-cuenta-bancaria/src/objetos/Persona.java',
         'laboratorio2/poo-cuenta-bancaria/src/objetos/Main.java',
         'laboratorio2/taller-poo/codigo_completo/Empleado.java',
         'laboratorio2/taller-poo/codigo_completo/Gerente.java',
         'laboratorio2/taller-poo/codigo_completo/Operario.java',
         'laboratorio2/taller-poo/codigo_completo/Vendedor.java',
         'laboratorio2/taller-poo/codigo_completo/Main.java'],
  lab4: ['laboratorio4/mvc-estudiantes/' + J + 'pa/ac/unachi/mvcestudiantes/MvcEstudiantesApplication.java',
         'laboratorio4/mvc-estudiantes/' + J + 'pa/ac/unachi/mvcestudiantes/model/Estudiante.java',
         'laboratorio4/mvc-estudiantes/' + J + 'pa/ac/unachi/mvcestudiantes/repository/EstudianteRepository.java',
         'laboratorio4/mvc-estudiantes/' + J + 'pa/ac/unachi/mvcestudiantes/service/EstudianteService.java',
         'laboratorio4/mvc-estudiantes/' + J + 'pa/ac/unachi/mvcestudiantes/controller/EstudianteController.java',
         'laboratorio4/mvc-estudiantes/src/main/resources/templates/estudiantes/lista.html',
         'laboratorio4/mvc-estudiantes/src/main/resources/templates/estudiantes/formulario.html',
         'laboratorio4/mvc-estudiantes/src/main/resources/application.properties',
         'laboratorio4/mvc-estudiantes/database.sql'],
  lab5: ['laboratorio5/gestion-inventario-jsp/' + J + 'com/unachi/inventario/modelo/Articulo.java',
         'laboratorio5/gestion-inventario-jsp/' + J + 'com/unachi/inventario/modelo/Existencia.java',
         'laboratorio5/gestion-inventario-jsp/' + J + 'com/unachi/inventario/datos/ConexionBD.java',
         'laboratorio5/gestion-inventario-jsp/' + J + 'com/unachi/inventario/datos/ArticuloDAO.java',
         'laboratorio5/gestion-inventario-jsp/' + J + 'com/unachi/inventario/datos/ExistenciaDAO.java',
         'laboratorio5/gestion-inventario-jsp/' + J + 'com/unachi/inventario/negocio/ArticuloService.java',
         'laboratorio5/gestion-inventario-jsp/' + J + 'com/unachi/inventario/negocio/ExistenciaService.java',
         'laboratorio5/gestion-inventario-jsp/' + J + 'com/unachi/inventario/presentacion/ArticuloServlet.java',
         'laboratorio5/gestion-inventario-jsp/' + J + 'com/unachi/inventario/presentacion/ExistenciaServlet.java',
         'laboratorio5/gestion-inventario-jsp/src/main/webapp/articulos/listar.jsp',
         'laboratorio5/gestion-inventario-jsp/db/schema.sql'],
  lab7: ['laboratorio7/prototipo-java21/' + J + 'Servidor.java',
         'laboratorio7/prototipo-java21/' + J + 'Cliente.java',
         'laboratorio7/prototipo-java21/' + J + 'Carga.java'],
  lab8: ['laboratorio8/ReservasLabAPI/src/reservas/servidor/ServidorReservas.java',
         'laboratorio8/ReservasLabAPI/src/reservas/servidor/ReservasHandler.java',
         'laboratorio8/ReservasLabAPI/src/reservas/negocio/ServicioReservas.java',
         'laboratorio8/ReservasLabAPI/src/reservas/datos/RepositorioReservas.java',
         'laboratorio8/ReservasLabAPI/src/reservas/modelo/Reserva.java',
         'laboratorio8/ReservasLabAPI/src/reservas/cliente/ClienteConsola.java',
         'laboratorio8/ReservasLabAPI/CONTRATO_API.md'],
};

const LANG = { '.java': 'java', '.xml': 'xml', '.html': 'xml', '.jsp': 'xml', '.sql': 'sql', '.properties': 'properties', '.md': 'markdown' };

function limpiar(texto, rel) {
  // Nunca publicar contraseñas, ni siquiera las locales de prueba.
  return texto.replace(/^(\s*spring\.datasource\.password\s*=).*$/gmi, '$1<tu-contraseña-local>')
              .replace(/^﻿/, '');
}

const out = {};
let total = 0;
for (const [lab, files] of Object.entries(MANIFEST)) {
  out[lab] = [];
  for (const rel of files) {
    const abs = path.join(PROG, rel);
    if (!fs.existsSync(abs)) { console.warn('  (falta) ' + rel); continue; }
    const texto = limpiar(fs.readFileSync(abs, 'utf8'), rel);
    out[lab].push({ nombre: path.basename(rel), ruta: rel.replace(/^laboratorio\d\//, ''), lenguaje: LANG[path.extname(rel)] || 'plaintext', lineas: texto.split('\n').length, texto });
    total++;
  }
}
fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, '/* Generado por scripts/build-codigo.js — no editar a mano */\nwindow.CODIGO = ' + JSON.stringify(out) + ';\n');
console.log(`codigo.js generado: ${total} archivos → ${path.relative(process.cwd(), OUT)}`);
