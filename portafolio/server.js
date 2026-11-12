#!/usr/bin/env node
/**
 * Portafolio Programación V — servidor local (sin dependencias).
 *
 *  - Sirve la web del portafolio (carpeta web/) y los documentos del repo (/repo/...).
 *  - Arranca/detiene los servidores de los laboratorios desde la página (/api/...).
 *  - Ejecuta los programas de consola de los labs 1 y 2 y devuelve su salida.
 *  - Hace de proxy hacia las APIs de los labs 7 y 8 (así no hay problemas de CORS).
 *
 * Solo ejecuta los comandos de la lista blanca de abajo.
 * Local (Windows):  node portafolio/server.js   ->  http://localhost:5173   (solo 127.0.0.1)
 * Público (Docker): PORT=7860 PORTAFOLIO_HOST=0.0.0.0  ->  mismo servidor en Linux, con CORS,
 *                   límite de peticiones y apagado de los labs por inactividad.
 */
const http = require('http');
const net = require('net');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawn, spawnSync } = require('child_process');

const WIN = process.platform === 'win32';
const PORT = Number(process.env.PORT || process.env.PORTAFOLIO_PORT || 5173);
const HOST = process.env.PORTAFOLIO_HOST || '127.0.0.1';
const PUBLIC = HOST !== '127.0.0.1';                       // expuesto a internet (contenedor)
/* Orígenes autorizados a usar el servidor en vivo: PORTAFOLIO_ORIGINS (coma) o, por defecto, los de web/js/perfil.js. */
function perfilOrigenes() {
  try { const w = {}; new Function('window', fs.readFileSync(path.join(__dirname, 'web', 'js', 'perfil.js'), 'utf8'))(w); return (w.PERFIL && w.PERFIL.origenes) || []; } catch { return []; }
}
const ORIGINS = (process.env.PORTAFOLIO_ORIGINS ? process.env.PORTAFOLIO_ORIGINS.split(',') : perfilOrigenes()).map(x => x.trim()).filter(Boolean);
const IDLE_MS = Number(process.env.PORTAFOLIO_IDLE_MIN || 10) * 60000;
const JAVA_EXE = WIN ? 'java.exe' : 'java';
const ROOT = path.resolve(__dirname, '..');
const WEB = path.join(__dirname, 'web');
const PROG = path.join(ROOT, 'prog-v');
const TMP = path.join(os.tmpdir(), 'portafolio-prog5');
fs.mkdirSync(TMP, { recursive: true });

/* ---------- JDKs ---------- */
function exists(p) { try { return fs.existsSync(p); } catch { return false; } }
const PLEIADES = path.join(os.homedir(), 'AppData', 'Roaming', 'Code', 'User', 'globalStorage', 'pleiades.java-extension-pack-jdk', 'java');
function jdk(version) {
  const env = process.env['JDK' + version + '_HOME'];
  if (env && exists(path.join(env, 'bin', JAVA_EXE))) return env;
  if (!WIN) { const jh = process.env.JAVA_HOME; return jh && exists(path.join(jh, 'bin', 'java')) ? jh : null; }   // contenedor: un único JDK 21
  const p = path.join(PLEIADES, String(version));
  if (exists(path.join(p, 'bin', 'java.exe'))) return p;
  return null;
}
const JDK21 = jdk(21);
function bin(home, exe) { return home ? path.join(home, 'bin', WIN ? exe : exe.replace(/\.exe$/, '')) : exe; } // sin home -> usa el PATH
const JAVAC17 = 'javac', JAVA17 = 'java';

/* ---------- Tomcat (lo trae la extensión Community Server Connector) ---------- */
const CATALINA = WIN ? 'catalina.bat' : 'catalina.sh';
function findTomcat() {
  if (process.env.CATALINA_HOME && exists(process.env.CATALINA_HOME)) return process.env.CATALINA_HOME;
  const base = path.join(os.homedir(), '.rsp', 'redhat-community-server-connector', 'runtimes', 'installations');
  if (!exists(base)) return null;
  for (const d of fs.readdirSync(base)) {
    const c = path.join(base, d, 'apache-tomcat-10.0.0');
    if (exists(path.join(c, 'bin', CATALINA))) return c;
  }
  return null;
}

/* ---------- Utilidades ---------- */
function portOpen(port, ms = 400) {
  return new Promise(res => {
    const s = net.connect({ port, host: '127.0.0.1' });
    const done = v => { s.destroy(); res(v); };
    s.setTimeout(ms, () => done(false));
    s.on('connect', () => done(true));
    s.on('error', () => done(false));
  });
}
const sleep = ms => new Promise(r => setTimeout(r, ms));
function walk(dir, ext, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, ext, out); else if (p.endsWith(ext)) out.push(p);
  }
  return out;
}
function killTree(proc) {
  if (!proc || proc.exitCode !== null) return;
  if (WIN) { try { spawnSync('taskkill', ['/PID', String(proc.pid), '/T', '/F'], { windowsHide: true }); } catch { /* ya terminó */ } return; }
  try { process.kill(-proc.pid, 'SIGTERM'); } catch { try { proc.kill('SIGTERM'); } catch { /* ya terminó */ } }   // grupo de procesos (detached)
  setTimeout(() => { try { process.kill(-proc.pid, 'SIGKILL'); } catch { /* ya terminó */ } }, 5000).unref();
}

/* ---------- Programas de consola (labs 1 y 2) ---------- */
const L = n => path.join(PROG, n);
const RUNS = {
  'lab1':        { src: L('laboratorio1/prog5-base/src/main/java'), main: 'com.unachi.prog5.Main' },
  'lab2-maestro':{ src: L('laboratorio2/patrones/src/main/java'), files: ['MaestroEsclavoFacturas.java'], main: 'MaestroEsclavoFacturas' },
  'lab2-pipe':   { src: L('laboratorio2/patrones/src/main/java'), files: ['PipeFilterLogs.java'], main: 'PipeFilterLogs' },
  'lab2-cuenta': { src: L('laboratorio2/poo-cuenta-bancaria/src'), main: 'objetos.Main' },
  'lab2-poo':    { src: L('laboratorio2/taller-poo/codigo_completo'), main: 'Main' },
};
function runConsole(id) {
  const r = RUNS[id];
  if (!r) return { ok: false, out: 'Programa desconocido.' };
  const out = path.join(TMP, 'run-' + id);
  fs.rmSync(out, { recursive: true, force: true });
  fs.mkdirSync(out, { recursive: true });
  const files = (r.files ? r.files.map(f => path.join(r.src, f)) : walk(r.src, '.java'));
  const c = spawnSync(JAVAC17, ['-encoding', 'UTF-8', '-d', out, ...files], { encoding: 'utf8', windowsHide: true, timeout: 60000 });
  if (c.error) return { ok: false, out: 'No se encontró javac (instala JDK 17 y ponlo en el PATH).\n' + c.error.message };
  if (c.status !== 0) return { ok: false, out: 'Error de compilación:\n' + (c.stderr || c.stdout) };
  const t0 = Date.now();
  const x = spawnSync(JAVA17, ['-Dfile.encoding=UTF-8', '-Dstdout.encoding=UTF-8', '-cp', out, r.main], { encoding: 'utf8', windowsHide: true, timeout: 30000 });
  return { ok: x.status === 0, out: (x.stdout || '') + (x.stderr || ''), ms: Date.now() - t0 };
}

/* ---------- Servidores de los laboratorios ---------- */
const SERVICES = {
  mysql: { name: 'MySQL (XAMPP)', port: 3306 },
  lab4:  { name: 'Lab 4 · Spring Boot MVC', port: 8080, needs: ['mysql'] },
  lab5:  { name: 'Lab 5 · Tomcat + JSP', port: 8080, needs: ['mysql'] },
  lab7:  { name: 'Lab 7 · Servidor ReservaFE', port: 3000 },
  lab8:  { name: 'Lab 8 · ReservasLabAPI', port: 8080 },
};
const procs = {};   // id -> { proc, log[] }
const logsOf = id => (procs[id] ||= { proc: null, log: [] });
function pushLog(id, chunk) {
  const e = logsOf(id);
  e.log.push(...String(chunk).split(/\r?\n/).filter(Boolean));
  if (e.log.length > 300) e.log.splice(0, e.log.length - 300);
}
function launch(id, cmd, args, opts = {}) {
  const e = logsOf(id);
  e.log = [];
  const env = { ...(opts.env || process.env) }; delete env.PORT;   // PORT es del portafolio: Servidor.java (lab 7) la leería como su propio puerto
  const p = spawn(cmd, args, { windowsHide: true, detached: !WIN, ...opts, env });
  e.proc = p;
  p.stdout.on('data', d => pushLog(id, d));
  p.stderr.on('data', d => pushLog(id, d));
  p.on('error', err => pushLog(id, 'ERROR: ' + err.message));
  p.on('exit', code => { pushLog(id, `[proceso terminado, código ${code}]`); if (e.proc === p) e.proc = null; });
  return p;
}
function running(id) { const p = procs[id] && procs[id].proc; return !!p && p.exitCode === null; }

const MYSQL_DATA = process.env.MYSQL_DATADIR || '/home/app/mysql-data';
async function startMysql() {
  if (await portOpen(3306)) return { ok: true, msg: 'MySQL ya estaba encendido.' };
  if (WIN) {
    const exe = 'C:\\xampp\\mysql\\bin\\mysqld.exe';
    if (!exists(exe)) return { ok: false, msg: 'No se encontró XAMPP en C:\\xampp. Enciende MySQL a mano.' };
    launch('mysql', exe, ['--defaults-file=C:\\xampp\\mysql\\bin\\my.ini', '--standalone', '--console']);
  } else {                                           // contenedor: MariaDB con los datos ya cargados al construir la imagen
    if (!exists(MYSQL_DATA)) return { ok: false, msg: 'No se encontró el directorio de datos de MariaDB (' + MYSQL_DATA + ').' };
    launch('mysql', process.env.MARIADBD || 'mariadbd', ['--datadir=' + MYSQL_DATA, '--socket=' + path.join(TMP, 'mysql.sock'), '--pid-file=' + path.join(TMP, 'mysql.pid'), '--port=3306', '--bind-address=127.0.0.1', '--skip-log-bin', '--performance-schema=OFF', '--innodb-buffer-pool-size=64M', '--max-connections=40']);
  }
  for (let i = 0; i < 40; i++) { await sleep(500); if (await portOpen(3306)) return { ok: true, msg: 'MySQL encendido.' }; }
  return { ok: false, msg: 'MySQL no respondió a tiempo. Revisa el registro.' };
}

function prepareTomcat() {
  const home = findTomcat();
  if (!home) throw new Error('No se encontró Tomcat 10 (extensión Community Server Connector). Define CATALINA_HOME.');
  const base = path.join(TMP, 'tomcat-base');
  fs.rmSync(base, { recursive: true, force: true });
  for (const d of ['logs', 'temp', 'work', 'webapps']) fs.mkdirSync(path.join(base, d), { recursive: true });
  fs.cpSync(path.join(home, 'conf'), path.join(base, 'conf'), { recursive: true });
  const proj = L('laboratorio5/gestion-inventario-jsp');
  let war = path.join(proj, 'target', 'gestion-inventario.war');
  if (!exists(war)) {
    pushLog('lab5', 'Compilando el WAR con Maven…');
    const m = spawnSync('mvn', ['-q', '-DskipTests', 'package'], { cwd: proj, shell: true, encoding: 'utf8', windowsHide: true, timeout: 240000, env: { ...process.env, ...(JDK21 ? { JAVA_HOME: JDK21 } : {}) } });
    pushLog('lab5', (m.stdout || '') + (m.stderr || ''));
    if (!exists(war)) throw new Error('No se pudo generar gestion-inventario.war (ver registro).');
  }
  fs.copyFileSync(war, path.join(base, 'webapps', 'gestion-inventario.war'));
  return { home, base };
}

async function startService(id) {
  const svc = SERVICES[id];
  if (!svc) return { ok: false, msg: 'Servicio desconocido.' };
  if (id === 'mysql') return startMysql();
  // Los labs 4, 5 y 8 comparten el puerto 8080: solo uno a la vez.
  if (svc.port === 8080) {
    for (const other of ['lab4', 'lab5', 'lab8']) if (other !== id && running(other)) { killTree(procs[other].proc); await sleep(1200); }
    if (!running(id) && await portOpen(8080)) return { ok: false, msg: 'El puerto 8080 está ocupado por otro programa ajeno al portafolio. Ciérralo e inténtalo de nuevo.' };
  }
  if (running(id)) return { ok: true, msg: 'Ya estaba en marcha.' };
  if (svc.port === 3000 && await portOpen(3000)) return { ok: false, msg: 'El puerto 3000 ya está ocupado.' };
  for (const dep of svc.needs || []) { const r = await startMysql(); if (!r.ok) return r; }

  try {
    if (id === 'lab4') {
      if (!JDK21) return { ok: false, msg: 'Falta JDK 21 (lo instala la extensión Pleiades). Define JDK21_HOME.' };
      if (WIN) launch(id, 'mvn', ['spring-boot:run'], { cwd: L('laboratorio4/mvc-estudiantes'), shell: true, env: { ...process.env, JAVA_HOME: JDK21 } });
      else {
        const tdir = L('laboratorio4/mvc-estudiantes/target');
        const jar = exists(tdir) && fs.readdirSync(tdir).find(n => n.endsWith('.jar') && !n.endsWith('.original'));
        if (!jar) return { ok: false, msg: 'Falta el JAR del lab 4 (target/*.jar).' };
        launch(id, bin(JDK21, 'java.exe'), ['-Xmx320m', '-jar', path.join(tdir, jar)], { cwd: L('laboratorio4/mvc-estudiantes') });
      }
    } else if (id === 'lab5') {
      const { home, base } = prepareTomcat();
      launch(id, path.join(home, 'bin', CATALINA), ['run'], { shell: WIN, env: { ...process.env, CATALINA_HOME: home, CATALINA_BASE: base, ...(WIN ? {} : { CATALINA_OPTS: '-Xmx256m' }) } });
    } else if (id === 'lab7') {
      if (!JDK21) return { ok: false, msg: 'Falta JDK 21 (lo instala la extensión Pleiades). Define JDK21_HOME.' };
      launch(id, bin(JDK21, 'java.exe'), ['-Dfile.encoding=UTF-8', 'Servidor.java', '4'], { cwd: L('laboratorio7/prototipo-java21/src/main/java') });
    } else if (id === 'lab8') {
      const proj = L('laboratorio8/ReservasLabAPI');
      const out = path.join(TMP, 'lab8-build');
      fs.rmSync(out, { recursive: true, force: true }); fs.mkdirSync(out, { recursive: true });
      const c = spawnSync(JAVAC17, ['-encoding', 'UTF-8', '-d', out, ...walk(path.join(proj, 'src'), '.java')], { encoding: 'utf8', windowsHide: true });
      if (c.status !== 0) return { ok: false, msg: 'Error al compilar el lab 8:\n' + (c.stderr || c.stdout) };
      launch(id, JAVA17, ['-Dfile.encoding=UTF-8', '-cp', out, 'reservas.servidor.ServidorReservas'], { cwd: proj });
    }
  } catch (err) { return { ok: false, msg: err.message }; }

  const limit = id === 'lab4' ? 420 : 240;             // con poca CPU (hosting gratuito) Spring Boot tarda ~90 s
  for (let i = 0; i < limit; i++) {
    await sleep(1000);
    if (!running(id)) return { ok: false, msg: 'El proceso terminó antes de abrir el puerto. Revisa el registro.' };
    if (await ready(id, svc)) return { ok: true, msg: `${svc.name} listo en el puerto ${svc.port}.` };
  }
  return { ok: false, msg: 'Tardó demasiado en abrir el puerto. Revisa el registro.' };
}

/* "Listo" = el puerto abre Y, en el lab 5, la aplicación ya está desplegada (Tomcat abre el puerto antes de publicar el WAR). */
function httpOk(port, p) {
  return new Promise(resolve => {
    const r = http.get({ host: '127.0.0.1', port, path: p, timeout: 2500 }, x => { x.resume(); resolve(x.statusCode >= 200 && x.statusCode < 400); });
    r.on('error', () => resolve(false)); r.on('timeout', () => { r.destroy(); resolve(false); });
  });
}
async function ready(id, svc) {
  if (!(await portOpen(svc.port))) return false;
  return id === 'lab5' ? httpOk(8080, '/gestion-inventario/') : true;
}
const starting = new Set();      // labs que se están iniciando (el arranque sigue en segundo plano)
const lastResult = {};           // último resultado de arranque por lab
async function stopService(id) {
  if (id === 'mysql' && !WIN) {                // MariaDB: SIGTERM = apagado limpio documentado
    if (procs.mysql && running('mysql')) { procs.mysql.proc.kill('SIGTERM'); for (let i = 0; i < 30 && await portOpen(3306, 200); i++) await sleep(500); }
    return { ok: true, msg: 'MariaDB detenido de forma limpia.' };
  }
  if (id === 'mysql') {                      // apagado limpio: nunca matar mysqld a la fuerza (puede dañar los datos)
    spawnSync('C:\\xampp\\mysql\\bin\\mysqladmin.exe', ['-u', 'root', 'shutdown'], { windowsHide: true, timeout: 30000 });
    await sleep(800);
    return { ok: true, msg: 'MySQL detenido de forma limpia.' };
  }
  if (!procs[id] || !running(id)) return { ok: true, msg: 'No estaba en marcha desde el portafolio.' };
  killTree(procs[id].proc);
  await sleep(800);
  return { ok: true, msg: 'Detenido.' };
}

/* ---------- HTTP ---------- */
const MIME = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.pdf': 'application/pdf', '.md': 'text/plain; charset=utf-8', '.ico': 'image/x-icon', '.woff2': 'font/woff2' };
const REPO_OK = new Set(['.pdf', '.png', '.md', '.java', '.jsp', '.sql', '.html', '.xml', '.json']);
const PROXY = { '7': 3000, '8': 8080 };
const APP_PATHS = /^\/(estudiantes|gestion-inventario|error)(\/|$)/;   // rutas de las apps web de los labs 4 y 5 (puerto 8080)

/* CORS: la página publicada (otro origen) puede usar este servidor solo si su origen está en la lista. */
function cors(req, res) {
  const o = req.headers.origin;
  if (o && ORIGINS.includes(o)) {
    res.setHeader('Access-Control-Allow-Origin', o); res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,X-API-KEY');
    res.setHeader('Access-Control-Max-Age', '600');
  }
}
/* Límite de peticiones costosas por IP (solo en modo público). */
const hits = new Map();
function limited(req) {
  if (!PUBLIC) return false;
  const ip = String(req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').split(',')[0].trim();
  const now = Date.now(), arr = (hits.get(ip) || []).filter(t => now - t < 60000);
  arr.push(now); hits.set(ip, arr);
  if (hits.size > 5000) hits.clear();
  return arr.length > 40;
}
/* Arranque/parada una a una: evita que dos visitantes pisen el puerto 8080 a la vez. */
let chain = Promise.resolve();
const serial = fn => { const r = chain.then(fn, fn); chain = r.catch(() => {}); return r; };
let lastUse = Date.now();
function proxyTo(port, pathAndQuery, req, res) {
  const up = http.request({ host: '127.0.0.1', port, path: pathAndQuery, method: req.method, headers: { ...req.headers, host: 'localhost:' + port } }, r => { res.writeHead(r.statusCode, r.headers); r.pipe(res); });
  up.on('error', () => sendJSON(res, 502, { error: 'El servidor del laboratorio no responde. Inícialo primero.' }));
  req.pipe(up);
}

function sendJSON(res, code, obj) { res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }); res.end(JSON.stringify(obj)); }
function serveFile(res, base, rel, filter) {
  const file = path.resolve(base, '.' + path.sep + decodeURIComponent(rel));
  if (!file.startsWith(base + path.sep) && file !== base) { res.writeHead(403); return res.end('Prohibido'); }
  const ext = path.extname(file).toLowerCase();
  if (filter && !filter.has(ext)) { res.writeHead(403); return res.end('Tipo no permitido'); }
  fs.stat(file, (err, st) => {
    if (err || !st.isFile()) { res.writeHead(404); return res.end('No encontrado'); }
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
    fs.createReadStream(file).pipe(res);
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  const p = url.pathname;
  cors(req, res);
  if (req.method === 'OPTIONS') { res.writeHead(204); return res.end(); }
  try {
    if (/^\/(api\/(start|stop|run)|proxy|estudiantes|gestion-inventario)/.test(p)) lastUse = Date.now();
    if (/^\/api\/(start|run)\//.test(p) && limited(req)) return sendJSON(res, 429, { ok: false, msg: 'Demasiadas peticiones; espera un momento.' });
    if (p === '/api/estado') {
      const labs = {};
      for (const id of Object.keys(SERVICES)) labs[id] = { nombre: SERVICES[id].name, puerto: SERVICES[id].port, activo: await portOpen(SERVICES[id].port, 250), propio: running(id), iniciando: starting.has(id), resultado: lastResult[id] || null };
      return sendJSON(res, 200, { ok: true, publico: PUBLIC, jdk21: !!JDK21, tomcat: !!findTomcat(), labs });
    }
    let m;
    if ((m = p.match(/^\/api\/start\/(\w+)$/)) && req.method === 'POST') {
      const id = m[1]; starting.add(id); delete lastResult[id];
      const job = serial(() => startService(id))
        .catch(e => ({ ok: false, msg: String(e && e.message || e) }))
        .then(r => { lastResult[id] = r; starting.delete(id); return r; });
      // Los proxies del hosting cortan peticiones largas (~100 s): si tarda, se responde "pendiente" y la página consulta /api/estado.
      const r = await Promise.race([job, sleep(PUBLIC ? 45000 : 600000).then(() => null)]);
      return sendJSON(res, 200, r || { ok: true, pending: true, msg: 'Iniciando… con poca CPU puede tardar un par de minutos.' });
    }
    if ((m = p.match(/^\/api\/stop\/(\w+)$/)) && req.method === 'POST') return sendJSON(res, 200, await serial(() => stopService(m[1])));
    if ((m = p.match(/^\/api\/log\/(\w+)$/))) return sendJSON(res, 200, { log: (procs[m[1]] ? procs[m[1]].log : []).slice(-120) });
    if ((m = p.match(/^\/api\/run\/([\w-]+)$/)) && req.method === 'POST') return sendJSON(res, 200, runConsole(m[1]));

    if ((m = p.match(/^\/proxy\/(7|8)(\/.*)?$/))) {
      return proxyTo(PROXY[m[1]], (m[2] || '/') + url.search, req, res);
    }
    if (APP_PATHS.test(p)) return proxyTo(8080, p + url.search, req, res);   // apps web de los labs 4 y 5, en el mismo origen
    if (p.startsWith('/repo/')) return serveFile(res, PROG, p.slice(6), REPO_OK);
    return serveFile(res, WEB, p === '/' ? 'index.html' : p.slice(1));
  } catch (err) { sendJSON(res, 500, { ok: false, msg: String(err && err.message || err) }); }
});

server.listen(PORT, HOST, () => {
  console.log(`\n  Portafolio Programación V  →  http://localhost:${PORT}${PUBLIC ? '  (modo público, ' + HOST + ')' : ''}\n`);
  console.log(`  JDK 21: ${JDK21 || 'no encontrado'}   Tomcat 10: ${findTomcat() || 'no encontrado'}\n`);
});

/* En modo público, los labs se apagan solos tras un rato sin uso (ahorra memoria). MySQL se queda encendido. */
if (PUBLIC) setInterval(() => {
  if (Date.now() - lastUse < IDLE_MS) return;
  for (const id of Object.keys(procs)) if (id !== 'mysql' && running(id)) { console.log('Apagando ' + id + ' por inactividad.'); killTree(procs[id].proc); }
}, 60000).unref();

function shutdown() {
  // MySQL se deja encendido a propósito: matarlo a la fuerza podría dañar la base. Se apaga con detener-mysql.bat o desde la página.
  for (const id of Object.keys(procs)) if (id !== 'mysql' && running(id)) killTree(procs[id].proc);
  process.exit(0);
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
