/* Portafolio Programación V — lógica de la página.
   Funciona en dos modos:
   · Con servidor local (node portafolio/server.js): ejecuta y conecta los laboratorios.
   · Estático (p. ej. GitHub Pages): muestra descripciones, código y salidas de referencia. */
(function () {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = s => String(s).replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const P = Object.assign({ nombre: 'Estudiante', cedula: '', materia: 'Programación V', profesor: 'Profesor', universidad: 'Universidad', siglas: '', anio: new Date().getFullYear(), github: '', repo: '', carpetaMaterial: 'prog-v' }, window.PERFIL || {});
  const GH = `https://github.com/${P.repo}/blob/main/${P.carpetaMaterial}/`;
  /* Publicado (GitHub Pages u otro host): no hay servidores, se muestran las ejecuciones reales capturadas. */
  const HOSTED = !['localhost', '127.0.0.1', '[::1]'].includes(location.hostname);
  const CAP = window.CAPTURAS || null;
  /* Servidor EN VIVO: en local es el propio server.js (mismo origen). En la página publicada, config.js indica la URL
     del contenedor en la nube; si no responde (apagado o despertando) se muestran las ejecuciones grabadas. */
  const BACKEND = (window.PORTAFOLIO_BACKEND || '').replace(/\/$/, '');
  const API = HOSTED ? BACKEND : '';
  const frameUrl = u => HOSTED ? u.replace(/^http:\/\/localhost:8080/, API) : u;   // las apps de los labs 4 y 5 salen del mismo servidor
  const repoOK = () => HOSTED || state.online;      // documentos del enunciado servidos como archivos (repo/…)

  /* ============ DATOS DE LOS LABORATORIOS ============ */
  const pdf = (n, files) => files.map(f => ({ t: f.replace(/\.pdf$/, '').replace(/_/g, ' '), p: `laboratorio${n}/enunciado/${f}`, pdf: true }));
  const LABS = [
    { id: 'lab1', n: '01', titulo: 'Preparación del entorno de desarrollo', corto: 'JDK 17, Maven, Git y un MVC mínimo funcionando.',
      resumen: 'Primer contacto con el stack de la materia: se prepara el entorno completo (JDK, Maven, Git, VS Code) y se crea un proyecto Maven con la estructura base del patrón Modelo-Vista-Controlador que se usará en todo el semestre.',
      tags: [['Java 17', 'k'], ['Maven'], ['MVC'], ['Consola', 'd']],
      puntos: [['Objetivo', 'Dejar un entorno reproducible y verificar que compila y ejecuta desde cero.'], ['Qué se construyó', 'Proyecto prog5-base con paquetes model, view y controller más una clase Main.'], ['Resultado', 'Imprime el saludo y el modelo Student, comprobando la cadena JDK → Maven → ejecución.']],
      codigo: 'lab1',
      live: { kind: 'run', progs: [{ id: 'lab1', label: 'Ejecutar Main (MVC base)', ref: "Hola Programacion V\nModelo: Student{id='2026-001', name='Nombre Apellido'}" }] },
      docs: pdf(1, ['Guia_Laboratorio1_Moodle.pdf', 'Laboratorio1.pdf']) },

    { id: 'lab2', n: '02', titulo: 'Patrones Maestro-Esclavo y Pipe-Filter', corto: 'Concurrencia, flujos por filtros y un taller de POO.',
      resumen: 'Implementación de dos patrones arquitectónicos clásicos en Java: Maestro-Esclavo (un coordinador reparte el trabajo entre hilos trabajadores) y Pipe-Filter (los datos fluyen por filtros independientes). Se complementa con el taller de programación orientada a objetos: herencia y polimorfismo.',
      tags: [['Java 17', 'k'], ['Concurrencia'], ['Patrones'], ['POO'], ['Consola', 'd']],
      puntos: [['Maestro-Esclavo', 'Procesa 20 facturas en 4 sublotes en paralelo y consolida el total con impuesto.'], ['Pipe-Filter', 'Analiza logs: 9 líneas → 6 relevantes → clasificación por tipo de error.'], ['Taller POO', 'Empleado, Gerente, Vendedor y Operario: polimorfismo en un reporte de nómina.']],
      codigo: 'lab2',
      live: { kind: 'run', progs: [
        { id: 'lab2-maestro', label: 'Maestro-Esclavo', ref: '20 facturas procesadas en 4 sublotes\nTOTAL CON IMPUESTO: 2721.55' },
        { id: 'lab2-pipe', label: 'Pipe-Filter', ref: '9 líneas de log → 6 relevantes\n3 tipos de error detectados' },
        { id: 'lab2-cuenta', label: 'Cuenta bancaria', ref: '10.0\n10.0\nEl estado es 1\nEnrique100.0\nDeposito Exitosa' },
        { id: 'lab2-poo', label: 'Taller POO', ref: 'Reporte de nómina\n…\nTOTAL A PAGAR $4795.00' }] },
      docs: [...pdf(2, ['Guia_Laboratorio2_Moodle.pdf', 'Laboratorio2.pdf']), { t: 'Diagrama Maestro-Esclavo', p: 'laboratorio2/enunciado/maestroesclavo.png', img: true }, { t: 'Diagrama Pipe-Filter', p: 'laboratorio2/enunciado/pipefilter.png', img: true }] },

    { id: 'lab3', n: '03', titulo: 'Patrones de comunicación', corto: 'Bus de eventos, broker y P2P: el caso Netflix / Kafka.',
      resumen: 'Investigación sobre cómo se comunican los componentes de un sistema distribuido. Se compara el patrón Broker, la arquitectura Peer-to-Peer y el Bus de eventos, y se analiza un caso real: Netflix usando Apache Kafka.',
      tags: [['Investigación', 'd'], ['Bus de eventos', 'k'], ['Kafka'], ['Arquitectura']],
      puntos: [['Broker', 'Un intermediario central: el cliente solo conoce al broker.'], ['Peer-to-Peer', 'Cada nodo es cliente y servidor a la vez; no existe un centro.'], ['Bus de eventos', 'Los componentes publican y se suscriben a eventos sin conocerse entre sí (Kafka en Netflix).']],
      codigo: null, live: null, docs: pdf(3, ['Laboratorio3.pdf', 'Guia_Laboratorio3_Moodle.pdf']) },

    { id: 'lab4', n: '04', titulo: 'Proyecto MVC con Spring Boot', corto: 'CRUD de estudiantes: Spring Boot, Thymeleaf y MySQL.',
      resumen: 'Aplicación web MVC completa con Spring Boot 4, Thymeleaf para las vistas y JPA sobre MySQL/MariaDB. Controlador, servicio, repositorio y modelo separados: un CRUD de estudiantes con formulario de alta y edición.',
      tags: [['Spring Boot', 'k'], ['Thymeleaf'], ['JPA'], ['MySQL'], ['JDK 21', 'd']],
      puntos: [['Capas', 'Controller → Service → Repository → Entity, con inyección de dependencias.'], ['Vistas', 'Plantillas Thymeleaf para listar, crear y editar estudiantes.'], ['Datos', 'Base mvc_unachi en MySQL con usuario dedicado (script database.sql incluido).']],
      codigo: 'lab4',
      live: { kind: 'server', svc: 'lab4', puerto: 8080, nota: 'Enciende MySQL automáticamente y arranca Spring Boot (puede tardar ~1 minuto la primera vez). Comparte el puerto 8080 con los labs 5 y 8: al iniciar uno se detiene el otro.', frame: 'http://localhost:8080/estudiantes', links: [['Lista de estudiantes', 'http://localhost:8080/estudiantes'], ['Nuevo estudiante', 'http://localhost:8080/estudiantes/nuevo']] },
      docs: pdf(4, ['Laboratorio4.pdf']) },

    { id: 'lab5', n: '05', titulo: 'Gestión de inventario con JSP', corto: 'Arquitectura en 3 capas sobre Tomcat 10 y MySQL.',
      resumen: 'Sistema de inventario con Servlets y JSP desplegado como WAR en Tomcat 10. Arquitectura en tres capas bien delimitadas: presentación (servlets + JSP), negocio (servicios con validaciones) y datos (DAO sobre JDBC).',
      tags: [['Jakarta Servlet', 'k'], ['JSP'], ['Tomcat 10'], ['JDBC'], ['3 capas']],
      puntos: [['Presentación', 'ArticuloServlet y ExistenciaServlet atienden las peticiones y despachan a los JSP.'], ['Negocio', 'ArticuloService y ExistenciaService validan reglas (p. ej. no sacar más de lo que hay).'], ['Datos', 'ArticuloDAO y ExistenciaDAO con ConexionBD centralizada; esquema en schema.sql.']],
      codigo: 'lab5',
      live: { kind: 'server', svc: 'lab5', puerto: 8080, nota: 'Enciende MySQL y despliega el WAR en un Tomcat 10 temporal. Datos de ejemplo: Arroz 50, Aceite 30, Azúcar 0.', frame: 'http://localhost:8080/gestion-inventario/', links: [['Inicio', 'http://localhost:8080/gestion-inventario/'], ['Artículos', 'http://localhost:8080/gestion-inventario/articulos'], ['Existencias', 'http://localhost:8080/gestion-inventario/existencias']] },
      docs: pdf(5, ['Laboratorio5.pdf']) },

    { id: 'lab6', n: '06', titulo: 'Especificación de requisitos (SRS)', corto: 'RF, RNF y plantilla SRS del sistema de inventario.',
      resumen: 'Documento de ingeniería de requisitos: se redactan los requisitos funcionales y no funcionales del sistema de inventario y se organizan en una plantilla SRS simplificada. El sistema que describe es el que se implementó en el laboratorio 5.',
      tags: [['SRS', 'k'], ['Requisitos'], ['Documento', 'd']],
      puntos: [['RF', 'Qué debe hacer el sistema: gestionar artículos y registrar entradas y salidas.'], ['RNF', 'Cómo debe comportarse: rendimiento, seguridad, mantenibilidad.'], ['Trazabilidad', 'Cada requisito se refleja en el código del laboratorio 5 (JSP + Tomcat + MySQL).']],
      codigo: null, live: null, docs: pdf(6, ['Laboratorio6.pdf']) },

    { id: 'lab7', n: '07', titulo: 'Escenario cliente-servidor: ReservaFE', corto: 'Servidor HTTP con pool de hilos y pruebas de carga.',
      resumen: 'Prototipo de un servidor de reservas escrito solo con el JDK 21: servidor HTTP con un pool de 4 hilos, un cliente de consola y un generador de carga. Sirve para observar cómo se encolan las solicitudes cuando hay más peticiones que hilos.',
      tags: [['Java 21', 'k'], ['HTTP', ''], ['Hilos'], ['REST'], ['Puerto 3000', 'd']],
      puntos: [['Códigos HTTP', '201 al crear, 409 si el espacio ya está reservado a esa hora, 404 si no existe, 400 si faltan datos.'], ['Concurrencia', 'Con 4 hilos, 10 solicitudes de 500 ms tardan ~1.6 s: se atienden en tandas.'], ['Sin dependencias', 'Solo clases del JDK (com.sun.net.httpserver); base de datos en memoria.']],
      codigo: 'lab7',
      live: { kind: 'api', svc: 'lab7', puerto: 3000, base: '/proxy/7', nota: 'Las peticiones pasan por el proxy del portafolio (sin problemas de CORS) hasta el servidor real en el puerto 3000.',
        reqs: [
          { l: 'GET /api/espacios', m: 'GET', p: '/api/espacios' },
          { l: 'GET /api/estado', m: 'GET', p: '/api/estado' },
          { l: 'GET /api/reservas', m: 'GET', p: '/api/reservas' },
          { l: 'POST reserva (201 → 409)', m: 'POST', p: '/api/reservas', b: { espacioId: 2, fecha: '2026-10-21', hora: '10:00', solicitante: P.nombre } },
          { l: 'POST espacio 9 (404)', m: 'POST', p: '/api/reservas', b: { espacioId: 9, fecha: '2026-10-21', hora: '10:00', solicitante: P.nombre } },
          { l: 'POST incompleto (400)', m: 'POST', p: '/api/reservas', b: { espacioId: 2 } },
          { l: 'GET /api/lento (500 ms)', m: 'GET', p: '/api/lento?ms=500' }] },
      docs: pdf(7, ['Laboratorio7.pdf']) },

    { id: 'lab8', n: '08', titulo: 'ReservasLabAPI', corto: 'API REST completa con autenticación y validación.',
      resumen: 'API REST de reservas de laboratorios con arquitectura por capas (servidor, negocio, datos, modelo), autenticación por API key, validación de horarios y cliente de consola. Cada requisito funcional y no funcional se traza hasta el código.',
      tags: [['Java 17', 'k'], ['REST'], ['API key'], ['JSON'], ['Puerto 8080', 'd']],
      puntos: [['Endpoints', 'GET/POST /api/reservas y GET/PUT/DELETE /api/reservas/{id}.'], ['Reglas', 'LAB-1…3, horarios válidos, sin choques (409) y API key en operaciones de escritura (401).'], ['Cliente', 'Demo automática de 9 casos: 201, 409, 400, 404, 200, 204, 401 y carga 20/20.']],
      codigo: 'lab8',
      live: { kind: 'api', svc: 'lab8', puerto: 8080, base: '/proxy/8', key: 'unachi-prog5', nota: 'Las operaciones de escritura envían el encabezado X-API-KEY automáticamente (salvo la prueba de 401). Comparte el puerto 8080 con los labs 4 y 5.',
        reqs: [
          { l: 'GET lista', m: 'GET', p: '/api/reservas' },
          { l: 'GET #1', m: 'GET', p: '/api/reservas/1' },
          { l: 'GET #999 (404)', m: 'GET', p: '/api/reservas/999' },
          { l: 'POST válida (201 → 409)', m: 'POST', p: '/api/reservas', k: 1, save: 1, b: { laboratorio: 'LAB-3', solicitante: P.nombre, fecha: '2026-10-24', horaInicio: '08:00', horaFin: '10:00' } },
          { l: 'POST sin API key (401)', m: 'POST', p: '/api/reservas', b: { laboratorio: 'LAB-3', solicitante: P.nombre, fecha: '2026-10-25', horaInicio: '08:00', horaFin: '10:00' } },
          { l: 'POST inválida (400)', m: 'POST', p: '/api/reservas', k: 1, b: { laboratorio: 'LAB-9', solicitante: '' } },
          { l: 'DELETE última creada (204)', m: 'DELETE', p: '/api/reservas/{last}', k: 1 }] },
      docs: [...pdf(8, ['Laboratorio8.pdf']), { t: 'Contrato de la API', p: 'laboratorio8/ReservasLabAPI/CONTRATO_API.md', md: true }] },
  ];

  /* ============ UTILIDADES DE INTERFAZ ============ */
  const SET = '!<>-_\\/[]{}=+*^?#0123456789ABCDEF';
  function decrypt(el, ms = 900) {
    if (reduce) return;
    const fin = el.dataset.final || (el.dataset.final = el.textContent);
    if (el._dec) cancelAnimationFrame(el._dec);
    const t0 = performance.now(), n = fin.length;
    const step = now => {
      const k = Math.min(1, (now - t0) / ms);
      let s = '';
      for (let i = 0; i < n; i++) {
        const c = fin[i];
        s += (c === ' ' || i < k * n * 1.15 - 2) ? c : SET[Math.floor(Math.random() * SET.length)];
      }
      el.textContent = s;
      if (k < 1) el._dec = requestAnimationFrame(step); else el.textContent = fin;
    };
    el._dec = requestAnimationFrame(step);
  }

  /* Resaltado de sintaxis propio (sin librerías) */
  const KW = 'abstract|assert|boolean|break|byte|case|catch|char|class|const|continue|default|do|double|else|enum|extends|final|finally|float|for|if|implements|import|instanceof|int|interface|long|new|package|private|protected|public|record|return|short|static|super|switch|this|throw|throws|try|var|void|volatile|while|true|false|null';
  const SQLKW = 'create|table|database|insert|into|values|select|from|where|primary|key|foreign|references|not|null|auto_increment|default|use|drop|if|exists|unique|grant|all|privileges|on|to|identified|by|flush|int|varchar|decimal|date|datetime|timestamp|engine|charset|constraint|check|update|set|delete|user|current_timestamp';
  const RULES = {
    java: [new RegExp(`(\\/\\*[\\s\\S]*?\\*\\/|\\/\\/[^\\n]*)|("(?:\\\\.|[^"\\\\\\n])*"|'(?:\\\\.|[^'\\\\\\n])')|(@\\w+)|\\b(${KW})\\b|\\b(\\d[\\d_]*(?:\\.\\d+)?[LlFfDd]?)\\b|\\b([A-Z][A-Za-z0-9_]*)\\b|\\b([a-z_]\\w*)(?=\\()`, 'g'), ['c', 's', 'a', 'k', 'n', 't', 'f']],
    sql: [new RegExp(`(--[^\\n]*|\\/\\*[\\s\\S]*?\\*\\/)|('(?:''|[^'])*'|\`[^\`]*\`)|\\b(${SQLKW})\\b|\\b(\\d+(?:\\.\\d+)?)\\b`, 'gi'), ['c', 's', 'k', 'n']],
    xml: [/(<!--[\s\S]*?-->|<%--[\s\S]*?--%>)|(<%[\s\S]*?%>)|("[^"\n]*")|(<\/?[\w:.-]+|\/?>)|(\$\{[^}\n]*\})|\b([\w:.-]+)(?==)/g, ['c', 'k', 's', 't', 'f', 'n']],
    properties: [/(#[^\n]*)|^([\w.\-]+)(?=\s*=)|(\$\{[^}\n]*\})/gm, ['c', 't', 'f']],
    markdown: [/(```[\s\S]*?```|`[^`\n]+`)|(^#{1,6} .*$)|(\*\*[^*\n]+\*\*)/gm, ['s', 'k', 't']],
  };
  function highlight(text, lang) {
    const rule = RULES[lang];
    const toks = [];
    if (!rule) toks.push(['', text]);
    else {
      const [re, cls] = rule; let last = 0, m; re.lastIndex = 0;
      while ((m = re.exec(text))) {
        if (m[0] === '') { re.lastIndex++; continue; }
        if (m.index > last) toks.push(['', text.slice(last, m.index)]);
        const gi = m.findIndex((v, i) => i > 0 && v !== undefined);
        toks.push([cls[gi - 1], m[0]]); last = m.index + m[0].length;
      }
      if (last < text.length) toks.push(['', text.slice(last)]);
    }
    const lines = [''];
    for (const [c, s] of toks) {
      const parts = s.split('\n');
      parts.forEach((p, i) => {
        if (i > 0) lines.push('');
        if (p) lines[lines.length - 1] += c ? `<span class="t-${c}">${esc(p)}</span>` : esc(p);
      });
    }
    return lines.map(l => `<span class="ln">${l || '&#8203;'}</span>`).join('');
  }

  /* ============ CONSTRUCCIÓN DE LA PÁGINA ============ */
  const state = { online: false, svc: {}, jdk21: false, tomcat: false };
  const docUrl = d => d.ext ? d.ext : repoOK() ? 'repo/' + d.p : GH + d.p;
  const ICON = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/></svg>';

  /* ============ PORTADA (editor de código) Y PIE, a partir de perfil.js ============ */
  const NUM = ['', 'Un', 'Dos', 'Tres', 'Cuatro', 'Cinco', 'Seis', 'Siete', 'Ocho', 'Nueve', 'Diez'];
  const cut = (t, n) => t.length > n ? t.slice(0, n - 1) + '…' : t;
  function buildChrome() {
    document.title = `Portafolio · ${P.materia} · ${P.nombre}`;
    const md = $('meta[name=description]'); if (md) md.content = `Portafolio de laboratorios de ${P.materia}${P.siglas ? ' (' + P.siglas + ')' : ''}: código, demostraciones en vivo y documentación. Estudiante: ${P.nombre}. Profesor: ${P.profesor}.`;
    const ini = P.nombre.split(/\s+/).filter(Boolean).map(w => w[0]).join('').slice(0, 3).toUpperCase();
    $('#brand span').textContent = `${ini} / ${P.materia.replace(/\s+/g, '-').toUpperCase()}`;
    $('#h1').textContent = `${P.nombre} — Portafolio de ${P.materia}`;
    $('#pie').innerHTML = `<p><b>${esc(P.nombre)}</b>${P.cedula ? ' · ' + esc(P.cedula) : ''} · ${esc(P.materia)} · Prof. ${esc(P.profesor)} · ${esc(P.universidad)}</p><p>Hecho con HTML, CSS y JavaScript puros${P.github ? ' · <a href="https://github.com/' + esc(P.github) + '" style="color:var(--acc)">github.com/' + esc(P.github) + '</a>' : ''}</p>`;
    $('#indiceTitulo').textContent = `${NUM[LABS.length] || LABS.length} laboratorios, un solo lugar`;
  }

  function buildHero() {
    const kw = t => `<span class="t-k">${t}</span>`, ty = t => `<span class="t-t">${t}</span>`, fn = t => `<span class="t-f">${t}</span>`;
    const nu = t => `<span class="t-n">${t}</span>`, cm = t => `<span class="t-c">${esc(t)}</span>`, q = t => `<span class="t-s">"${esc(t)}"</span>`;
    const L = [], add = (plain, html, href) => L.push({ plain, html: html == null ? esc(plain) : html, href });
    add(`// Portafolio · ${P.materia} · ${P.siglas || P.universidad} · ${P.anio}`, cm(`// Portafolio · ${P.materia} · ${P.siglas || P.universidad} · ${P.anio}`));
    add('public class Portafolio {', `${kw('public')} ${kw('class')} ${ty('Portafolio')} {`);
    add(`    String estudiante = "${P.nombre}";`, `    ${ty('String')} estudiante = ${q(P.nombre)};`);
    if (P.cedula) add(`    String cedula = "${P.cedula}";`, `    ${ty('String')} cedula = ${q(P.cedula)};`);
    add(`    String profesor = "${P.profesor}";`, `    ${ty('String')} profesor = ${q(P.profesor)};`);
    add('    public static void main(String[] args) {', `    ${kw('public')} ${kw('static')} ${kw('void')} ${fn('main')}(${ty('String')}[] args) {`);
    add('        Lab[] labs = {', `        ${ty('Lab')}[] labs = {`);
    LABS.forEach((l, i) => { const t = cut(l.titulo, 34); add(`            new Lab(${i + 1}, "${t}"),`, `            ${kw('new')} ${ty('Lab')}(${nu(i + 1)}, ${q(t)}),`, '#' + l.id); });
    add('        };', null);
    add('        entrar(labs);', `        ${fn('entrar')}(labs);`, '#indice');
    add('    }', null); add('}', null);

    const rows = L.map((r, i) => {
      const n = Math.max(1, r.plain.length), st = `style="--n:${n};--d:${i * 65}ms;--dur:${Math.min(520, 70 + n * 11)}ms"`;
      const inner = r.html || '&#8203;';
      return r.href ? `<a class="il cl" href="${r.href}" ${st}>${inner}</a>` : `<span class="il" ${st}>${inner}</span>`;
    }).join('');
    $('#heroIn').innerHTML = `<div class="ide" id="ide">
      <div class="ide-bar"><i></i><i></i><i></i><span>Portafolio.java</span><em>${esc(P.materia)}</em></div>
      <div class="ide-body"><code>${rows}</code></div>
      <div class="ide-foot"><span class="dot on"></span><span>compilado sin errores · ${LABS.length} laboratorios</span><a class="run" href="#indice">▶ Run</a></div>
    </div>`;

    // Interacción con el entorno: la ventana se inclina hacia el cursor, una luz la recorre y los clics lanzan ondas en el fondo.
    const hero = $('#inicio'), ide = $('#ide');
    if (!reduce) {
      hero.addEventListener('pointermove', e => {
        const r = hero.getBoundingClientRect(), dx = (e.clientX - r.left) / r.width - .5, dy = (e.clientY - r.top) / Math.min(r.height, innerHeight) - .5;
        ide.style.setProperty('--ry', (dx * 7).toFixed(2) + 'deg'); ide.style.setProperty('--rx', (-dy * 5).toFixed(2) + 'deg');
        const b = ide.getBoundingClientRect(); ide.style.setProperty('--sx', (e.clientX - b.left) + 'px'); ide.style.setProperty('--sy', (e.clientY - b.top) + 'px');
      }, { passive: true });
      hero.addEventListener('pointerleave', () => { ide.style.setProperty('--rx', '0deg'); ide.style.setProperty('--ry', '0deg'); });
    }
    ide.addEventListener('click', e => { const a = e.target.closest('a'); if (a) window.dispatchEvent(new CustomEvent('ojo:pulso', { detail: { x: e.clientX, y: e.clientY } })); });
  }

  function buildIndex() {
    $('#cards').innerHTML = LABS.map(l => `
      <a class="card rv" href="#${l.id}" data-lab="${l.id}">
        <div class="n"><span>${l.n}</span><span class="dot" data-dot="${l.live && l.live.svc ? l.live.svc : ''}" ${l.live && l.live.svc ? '' : 'hidden'}></span></div>
        <h3>${esc(l.titulo)}</h3><p>${esc(l.corto)}</p><span class="go">Ver laboratorio →</span>
      </a>`).join('');
    $('#rail').innerHTML = `<a href="#inicio" data-t="inicio" aria-label="Portada">INICIO</a><a href="#indice" data-t="indice" aria-label="Índice">ÍNDICE</a>` +
      LABS.map(l => `<a href="#${l.id}" data-t="${l.id}" aria-label="${esc(l.titulo)}">${l.n}</a>`).join('');
  }

  function labHTML(l) {
    const tabs = [];
    if (l.codigo) tabs.push(['code', 'Código fuente']);
    if (l.live) tabs.push(['live', 'En vivo']);
    if (l.docs.length) tabs.push(['docs', 'Documentos']);
    return `
    <section class="blk lab" id="${l.id}" data-lab="${l.id}">
      <div class="lab-head">
        <div class="bignum rv">${l.n}</div>
        <div class="rv">
          <div class="chips">${l.tags.map(([t, k]) => `<span class="chip ${k || ''}">${esc(t)}</span>`).join('')}</div>
          <h3 data-decrypt>${esc(l.titulo)}</h3>
          <p>${esc(l.resumen)}</p>
          <ul class="points">${l.puntos.map(([a, b]) => `<li><b>${esc(a)}</b>${esc(b)}</li>`).join('')}</ul>
        </div>
      </div>
      ${tabs.length ? `<div class="panel rv">
        <div class="tabs" role="tablist">${tabs.map(([k, t], i) => `<button class="tab" role="tab" id="${l.id}-t-${k}" aria-controls="${l.id}-p-${k}" aria-selected="${i === 0}" data-k="${k}">${t}</button>`).join('')}</div>
        ${tabs.map(([k], i) => `<div class="pane ${i === 0 ? 'show' : ''}" role="tabpanel" id="${l.id}-p-${k}" aria-labelledby="${l.id}-t-${k}" data-k="${k}"></div>`).join('')}
      </div>` : ''}
    </section>`;
  }

  /* ---- Visor de código ---- */
  function mountCode(l, pane) {
    const files = (window.CODIGO && window.CODIGO[l.codigo]) || [];
    if (!files.length) { pane.innerHTML = '<div class="live"><div class="note">El código no está disponible en este momento.</div></div>'; return; }
    pane.innerHTML = `<div class="code"><div class="files" role="listbox" aria-label="Archivos"></div><div class="viewer"><div class="viewer-bar"><span class="fn"></span><button type="button">Copiar</button></div><pre><code></code></pre></div></div>`;
    const list = $('.files', pane), code = $('code', pane), fn = $('.fn', pane), btn = $('button', pane);
    let cur = 0;
    list.innerHTML = files.map((f, i) => `<button type="button" class="file" role="option" data-i="${i}">${ICON}<span>${esc(f.nombre)}<small>${esc(f.ruta.split('/').slice(0, -1).slice(-2).join('/'))}</small></span></button>`).join('');
    const show = i => {
      cur = i; const f = files[i];
      $$('.file', list).forEach((b, j) => { b.classList.toggle('act', j === i); b.setAttribute('aria-selected', j === i); });
      code.innerHTML = highlight(f.texto, f.lenguaje);
      fn.textContent = `${f.ruta}  ·  ${f.lineas} líneas`;
      $('.viewer', pane).scrollTop = 0;
    };
    list.addEventListener('click', e => { const b = e.target.closest('.file'); if (b) show(+b.dataset.i); });
    btn.addEventListener('click', async () => {
      try { await navigator.clipboard.writeText(files[cur].texto); btn.textContent = '¡Copiado!'; } catch { btn.textContent = 'No se pudo'; }
      setTimeout(() => btn.textContent = 'Copiar', 1400);
    });
    show(0);
  }

  /* ---- Terminal con efecto de escritura ---- */
  function term(title) {
    const d = document.createElement('div'); d.className = 'term';
    d.innerHTML = `<div class="term-bar"><i></i><i></i><i></i><span>${esc(title)}</span></div><pre aria-live="polite"></pre>`;
    const pre = $('pre', d); let tok = 0;
    return {
      el: d,
      set(html) { tok++; pre.innerHTML = html; },
      async type(lines) {
        const my = ++tok; pre.innerHTML = '';
        for (const ln of lines) {
          if (my !== tok) return;
          pre.insertAdjacentHTML('beforeend', ln + '\n'); pre.scrollTop = pre.scrollHeight;
          if (!reduce) await sleep(Math.min(90, 1400 / lines.length));
        }
      },
    };
  }

  /* ---- Panel en vivo ---- */
  const liveRefresh = [];
  async function post(url) { const r = await fetch(API + url, { method: 'POST' }); return r.json(); }
  const offlineNote = () => HOSTED && CAP
    ? `<div class="note"><b>${BACKEND ? 'Servidor en vivo no disponible ahora.' : 'Demo local.'}</b> Se muestran las <b>ejecuciones reales</b> capturadas el ${esc(CAP.fecha)}.${BACKEND ? ' El servidor en la nube puede estar despertando (tarda ~1 minuto): la página se conecta sola en cuanto responda.' : ' Para ejecutar los laboratorios en vivo, clona el repositorio y lanza <code>node portafolio/server.js</code>.'}</div>`
    : OFFLINE;
  const OFFLINE = '<div class="note"><b>Modo estático.</b> Para ejecutar los laboratorios desde esta página, abre una terminal en la carpeta del repositorio y ejecuta <code>node portafolio/server.js</code>; luego entra a <code>http://localhost:5173</code>. Mientras tanto verás salidas de referencia.</div>';

  function mountLive(l, pane) {
    const lv = l.live;
    pane.innerHTML = '<div class="live"></div>';
    const box = $('.live', pane);
    if (lv.kind === 'run') return mountRun(l, lv, box);
    return mountServer(l, lv, box);
  }

  function mountRun(l, lv, box) {
    box.innerHTML = `<div class="livebar"><div class="svc"><span class="dot on"></span><span>Programas de consola · JDK 17</span></div><div class="btns"></div></div><div class="slot"></div>`;
    const t = term('salida'); $('.slot', box).replaceWith(t.el);
    const offline = document.createElement('div'); offline.className = 'slot2'; box.append(offline);
    const btns = $('.btns', box);
    lv.progs.forEach((p, i) => {
      const b = document.createElement('button'); b.className = 'btn' + (i === 0 ? ' pri' : ''); b.type = 'button'; b.textContent = '▶ ' + p.label; btns.append(b);
      b.addEventListener('click', async () => {
        const old = b.innerHTML; b.disabled = true; b.innerHTML = '<span class="spin"></span> Ejecutando';
        const head = `<span class="p">$</span> java ${esc(p.id)}`;
        const rc = CAP && CAP.runs && CAP.runs[p.id];
        if (!state.online) { await t.type([head, ...(rc ? rc.out : p.ref).split('\n').map(x => esc(x)), rc ? `<span class="ok">✓ salida real capturada el ${esc(CAP.fecha)}</span>` : '<span class="mu">— salida de referencia (modo estático) —</span>']); }
        else {
          t.set(head + '\n<span class="mu">compilando y ejecutando…</span>');
          try { const r = await post('/api/run/' + p.id); await t.type([head, ...r.out.trimEnd().split('\n').map(x => esc(x)), r.ok ? `<span class="ok">✓ terminó en ${r.ms || 0} ms</span>` : '<span class="er">✗ terminó con error</span>']); }
          catch { t.set('<span class="er">No se pudo contactar con el servidor local.</span>'); }
        }
        b.disabled = false; b.innerHTML = old;
      });
    });
    t.set('<span class="mu">Pulsa un botón para ejecutar el programa…</span>');
    liveRefresh.push(() => { offline.innerHTML = state.online ? '' : offlineNote(); });
  }

  function mountServer(l, lv, box) {
    const isApi = lv.kind === 'api';
    box.innerHTML = `
      <div class="livebar">
        <div class="svc"><span class="dot" data-dot="${lv.svc}"></span><span data-name>${esc(l.titulo)}</span><span class="chip">:${lv.puerto}</span><span class="chip" data-state>apagado</span></div>
        <div class="btns"><button class="btn pri" data-a="start" type="button">▶ Iniciar servidor</button><button class="btn stop" data-a="stop" type="button">■ Detener</button></div>
      </div>
      <div class="note" data-note>${esc(lv.nota)}</div>
      <div data-off></div>
      <div data-body></div>`;
    const start = $('[data-a=start]', box), stop = $('[data-a=stop]', box), body = $('[data-body]', box);
    const stTxt = $('[data-state]', box), off = $('[data-off]', box);
    let busy = false, logTimer = 0;
    const log = term('registro del servidor');

    if (isApi) {
      const rows = lv.reqs.map((r, i) => `<button type="button" class="btn" data-i="${i}">${esc(r.l)}</button>`).join('');
      body.innerHTML = `<div class="apirow">${rows}</div>`;
      const out = term(`respuesta · ${lv.base}`); body.append(out.el);
      out.set('<span class="mu">Elige una petición…</span>');
      let last = null; const turno = {};
      const rec = CAP && CAP.api && CAP.api[lv.svc];
      body.addEventListener('click', async e => {
        const b = e.target.closest('[data-i]'); if (!b) return; const r = lv.reqs[+b.dataset.i];
        const grab = !state.online && rec && rec.find(x => x.l === r.l);
        if (grab) {                                     // sin servidor: se repite la respuesta real grabada (201 → 409 en orden)
          const n = turno[r.l] = ((turno[r.l] ?? -1) + 1) % grab.res.length, v = grab.res[n];
          const c = v.status < 300 ? 'ok' : v.status < 500 ? 'p' : 'er';
          await out.type([`<span class="p">${r.m}</span> ${esc(r.p)}${r.k ? ' <span class="mu">(con X-API-KEY)</span>' : ''}`, `<span class="${c}">HTTP ${v.status}</span> <span class="mu">· ${v.ms} ms · respuesta real grabada el ${esc(CAP.fecha)}</span>`, esc(v.body || '(sin cuerpo)')]);
          return;
        }
        let path = r.p;
        if (path.includes('{last}')) { if (!last) { out.set('<span class="er">Primero crea una reserva con «POST válida».</span>'); return; } path = path.replace('{last}', last); }
        const headers = { 'Content-Type': 'application/json' }; if (r.k) headers['X-API-KEY'] = lv.key;
        const t0 = performance.now(); b.disabled = true;
        out.set(`<span class="p">${r.m}</span> ${esc(path)}\n<span class="mu">enviando…</span>`);
        try {
          const res = await fetch(API + lv.base + path, { method: r.m, headers, body: r.b ? JSON.stringify(r.b) : undefined });
          const ms = Math.round(performance.now() - t0); const txt = await res.text(); let pretty = txt;
          try { pretty = JSON.stringify(JSON.parse(txt), null, 2); if (r.save && res.status === 201) last = JSON.parse(txt).id; } catch { /* no es JSON */ }
          const c = res.status < 300 ? 'ok' : res.status < 500 ? 'p' : 'er';
          await out.type([`<span class="p">${r.m}</span> ${esc(path)}${r.k ? ' <span class="mu">(con X-API-KEY)</span>' : ''}`, `<span class="${c}">HTTP ${res.status}</span> <span class="mu">· ${ms} ms</span>`, esc(pretty || '(sin cuerpo)')]);
        } catch { out.set('<span class="er">Sin respuesta: inicia el servidor del laboratorio (y el portafolio con node portafolio/server.js).</span>'); }
        b.disabled = false;
      });
      if (!HOSTED) body.append(Object.assign(document.createElement('div'), { className: 'btns', innerHTML: `<a class="btn" target="_blank" rel="noopener" href="http://localhost:${lv.puerto}/api/${l.id === 'lab7' ? 'espacios' : 'reservas'}">Abrir API en pestaña nueva ↗</a>` }));
      else if (API) body.append(Object.assign(document.createElement('div'), { className: 'btns', innerHTML: `<a class="btn" target="_blank" rel="noopener" href="${esc(API + lv.base + '/api/' + (l.id === 'lab7' ? 'espacios' : 'reservas'))}">Abrir API en pestaña nueva ↗</a>` }));
    } else {
      body.innerHTML = `<div class="frame"><iframe title="${esc(l.titulo)}" loading="lazy" data-src="${esc(frameUrl(lv.frame))}"></iframe><div class="ph"><div><b>Servidor apagado</b><br>Pulsa «Iniciar servidor» para ver la aplicación aquí.</div></div></div>
        <div class="shots" hidden></div>
        <div class="btns" data-links>${lv.links.map(([t, u]) => `<a class="btn" target="_blank" rel="noopener" href="${esc(frameUrl(u))}">${esc(t)} ↗</a>`).join('')}</div>`;
      const gal = CAP && CAP.shots && CAP.shots[lv.svc];
      if (gal && gal.length) {
        const sh = $('.shots', body);
        sh.innerHTML = `<div class="shots-tabs">${gal.map((g, i) => `<button type="button" class="btn${i ? '' : ' pri'}" data-g="${i}">${esc(g.titulo)}</button>`).join('')}</div>
          <figure class="shot"><div class="shot-bar"><i></i><i></i><i></i><span></span></div><img alt="" loading="lazy"><figcaption>Captura real de la aplicación en ejecución · ${esc(CAP.fecha)}</figcaption></figure>`;
        const show = i => { const g = gal[i]; const im = $('img', sh); im.src = g.src; im.alt = g.titulo + ' — ' + l.titulo; $('.shot-bar span', sh).textContent = g.url; $$('[data-g]', sh).forEach((x, j) => x.classList.toggle('pri', j === i)); };
        sh.addEventListener('click', e => { const x = e.target.closest('[data-g]'); if (x) show(+x.dataset.g); });
        show(0);
      }
    }
    body.append(log.el); log.el.hidden = true;

    const ifr = $('iframe', body), ph = $('.ph', body);
    function apply() {
      const s = state.svc[lv.svc] || {}; let on = !!s.activo;
      if (lv.puerto === 8080 && on) {           // los labs 4, 5 y 8 comparten puerto: solo uno es "el que está"
        const otro = ['lab4', 'lab5', 'lab8'].some(k => k !== lv.svc && state.svc[k] && state.svc[k].propio);
        if (otro) on = false;
      }
      stTxt.textContent = busy ? 'iniciando…' : on ? 'en línea' : 'apagado';
      start.disabled = busy || on || !state.online; stop.disabled = busy || !on || !(s.propio);
      off.innerHTML = state.online ? '' : offlineNote();
      const shw = $('.shots', box); if (shw && shw.querySelector('img')) { const ver = !state.online || !on; shw.hidden = !ver; const fr = $('.frame', box); if (fr) fr.hidden = ver; }
      const grabada = HOSTED && !state.online;           // publicada y sin servidor en vivo: solo grabaciones
      $('.btns', $('.livebar', box)).hidden = grabada; $('[data-note]', box).hidden = grabada;
      const lk = $('[data-links]', box); if (lk) lk.hidden = grabada;
      if (grabada) stTxt.textContent = 'demo grabada';
      if (ifr) { if (on && !ifr.src) { ifr.src = ifr.dataset.src; } if (!on && ifr.src) { ifr.removeAttribute('src'); } if (ph) ph.style.display = on ? 'none' : 'grid'; }
      $$('[data-dot=' + lv.svc + ']', box).forEach(d => d.classList.toggle('on', on));
    }
    async function pollLog() { try { const r = await (await fetch(API + '/api/log/' + lv.svc)).json(); log.set(esc(r.log.join('\n')) || '<span class="mu">…</span>'); } catch { /* sin servidor */ } }
    start.addEventListener('click', async () => {
      busy = true; apply(); log.el.hidden = false; $('.term-bar span', log.el).textContent = 'registro del servidor';
      logTimer = setInterval(pollLog, 1500);
      try {
        let r = await post('/api/start/' + lv.svc);
        if (r.pending) {                       // el servidor sigue arrancando (hosting con poca CPU): se espera sondeando el estado
          for (let i = 0; i < 180; i++) { await sleep(2000); await window.__refreshState(); const s = state.svc[lv.svc] || {}; if (!s.iniciando) { r = s.resultado || { ok: true }; break; } }
        }
        await pollLog(); if (!r.ok) log.set(esc(r.msg || 'No se pudo iniciar.') + '\n' + $('pre', log.el).textContent);
      }
      catch { log.set('<span class="er">No se pudo contactar con el servidor local.</span>'); }
      clearInterval(logTimer); busy = false; await window.__refreshState(); if (ifr && ifr.src) ifr.src = ifr.dataset.src;
    });
    stop.addEventListener('click', async () => { busy = true; apply(); try { await post('/api/stop/' + lv.svc); } catch { /* nada */ } busy = false; await window.__refreshState(); });
    liveRefresh.push(apply); apply();
  }

  function mountDocs(l, pane) {
    const items = l.docs.map(d => `<li><a class="lnk" target="_blank" rel="noopener" href="${esc(docUrl(d))}">${ICON}${esc(d.t)}</a></li>`).join('');
    pane.innerHTML = `<div class="docs"><ul>${items}</ul><div class="slot"></div></div>`;
    const slot = $('.slot', pane);
    const first = l.docs.find(d => d.pdf);
    const render = () => {
      if (!repoOK() || !first) { slot.innerHTML = repoOK() ? '' : '<div class="note">La vista previa de los documentos está disponible al ejecutar el portafolio en local; aquí puedes abrirlos desde los enlaces (GitHub).</div>'; return; }
      if (!slot.querySelector('iframe')) slot.innerHTML = `<div class="frame"><iframe title="${esc(first.t)}" loading="lazy" src="${esc('repo/' + first.p)}"></iframe></div>`;
    };
    $$('.lnk', pane).forEach((a, i) => a.addEventListener('click', e => { const d = l.docs[i]; if (repoOK() && d.pdf) { e.preventDefault(); slot.innerHTML = `<div class="frame"><iframe title="${esc(d.t)}" src="repo/${esc(d.p)}"></iframe></div>`; } }));
    liveRefresh.push(render); render();
  }

  function buildLabs() {
    $('#labs').innerHTML = LABS.map(labHTML).join('');
    LABS.forEach(l => {
      const sec = $('#' + l.id);
      const mounters = { code: mountCode, live: mountLive, docs: mountDocs };
      $$('.pane', sec).forEach(p => { const k = p.dataset.k; if (k === 'code' || k === 'docs' || (k === 'live' && p.classList.contains('show'))) mounters[k](l, p); p._m = false; });
      $$('.pane', sec).forEach(p => p._m = true);
      const live = $('.pane[data-k=live]', sec); if (live && !live.classList.contains('show')) { /* montaje diferido */ live._lazy = true; }
      const tabs = $$('.tab', sec);
      const select = t => {
        tabs.forEach(x => x.setAttribute('aria-selected', x === t));
        $$('.pane', sec).forEach(p => p.classList.toggle('show', p.dataset.k === t.dataset.k));
        const p = $('.pane[data-k=live].show', sec); if (p && p._lazy) { p._lazy = false; mountLive(l, p); liveRefresh.forEach(f => f()); }
      };
      tabs.forEach((t, i) => {
        t.addEventListener('click', () => select(t));
        t.addEventListener('keydown', e => { const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0; if (d) { const n = tabs[(i + d + tabs.length) % tabs.length]; n.focus(); select(n); } });
      });
    });
  }

  /* ============ ESTADO DEL SERVIDOR LOCAL ============ */
  window.__refreshState = async function () {
    try {
      const r = await fetch(API + '/api/estado', { cache: 'no-store', signal: AbortSignal.timeout(6000) }); const j = await r.json();
      if (!r.ok || !j || j.ok !== true || !j.labs) throw new Error('sin servidor del portafolio');
      state.online = true; state.svc = j.labs; state.jdk21 = j.jdk21; state.tomcat = j.tomcat;
    } catch { state.online = false; state.svc = {}; }
    $('#estadoDot').className = 'dot ' + (state.online ? 'on' : 'warn');
    $('#estadoTxt').textContent = state.online ? (HOSTED ? 'servidor en vivo' : 'servidor local en línea') : HOSTED ? (BACKEND ? 'demo grabada · conectando…' : 'demo publicada') : 'modo estático';
    // puntos del índice
    $$('.card [data-dot]').forEach(d => {
      const id = d.dataset.dot; if (!id) return; const s = state.svc[id] || {};
      let on = !!s.activo; if (['lab4', 'lab5', 'lab8'].includes(id) && on && ['lab4', 'lab5', 'lab8'].some(k => k !== id && state.svc[k] && state.svc[k].propio)) on = false;
      d.classList.toggle('on', on);
    });
    liveRefresh.forEach(f => f());
  };

  /* ============ EFECTOS DE PÁGINA ============ */
  function effects() {
    // progreso, riel activo, brillo del cursor
    const bar = $('#progress'), glow = $('#glow');
    const onScroll = () => { const h = document.documentElement; bar.style.transform = `scaleX(${h.scrollTop / Math.max(1, h.scrollHeight - h.clientHeight)})`; };
    addEventListener('scroll', onScroll, { passive: true }); onScroll();
    addEventListener('pointermove', e => { glow.style.left = e.clientX + 'px'; glow.style.top = e.clientY + 'px'; }, { passive: true });
    // revelado + descifrado de títulos
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (!e.isIntersecting) return; e.target.classList.add('in');
      $$('[data-decrypt]', e.target).forEach(x => decrypt(x)); if (e.target.matches('[data-decrypt]')) decrypt(e.target);
      io.unobserve(e.target);
    }), { threshold: 0.15 });
    $$('.rv').forEach(x => io.observe(x));
    // riel
    const links = $$('#rail a'); const map = new Map(links.map(a => [a.dataset.t, a]));
    const so = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { links.forEach(a => a.classList.remove('act')); const a = map.get(e.target.id); if (a) a.classList.add('act'); } }), { rootMargin: '-45% 0px -50% 0px' });
    ['inicio', 'indice', ...LABS.map(l => l.id)].forEach(id => { const s = document.getElementById(id); if (s) so.observe(s); });
    // foco de luz en las tarjetas
    $('#cards').addEventListener('pointermove', e => { const c = e.target.closest('.card'); if (!c) return; const r = c.getBoundingClientRect(); c.style.setProperty('--mx', (e.clientX - r.left) + 'px'); c.style.setProperty('--my', (e.clientY - r.top) + 'px'); });
    $$('.card h3').forEach(h => h.closest('.card').addEventListener('mouseenter', () => decrypt(h, 500)));
    // portada: descifrado inicial
  }

  buildChrome(); buildHero(); buildIndex(); buildLabs(); effects();
  window.__refreshState(); setInterval(window.__refreshState, 4000);
})();
