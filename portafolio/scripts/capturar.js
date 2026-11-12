#!/usr/bin/env node
/**
 * Captura EJECUCIONES REALES de los laboratorios y las guarda para el modo estático
 * (GitHub Pages), igual que hace un "Java Vault": en la nube no hay servidores,
 * así que se publica lo que el programa respondió de verdad el día de la captura.
 *
 * Genera:
 *   web/js/capturas.js              salidas de consola (labs 1-2) + respuestas de las APIs (labs 7-8)
 *   web/img/capturas/labN-*.png     capturas de pantalla de las apps web (labs 4-5)
 *
 * Uso (servidor local de Windows):  node portafolio/scripts/capturar.js
 * Uso (RECOMENDADO, sin instalar Java/XAMPP): contra un servidor ya publicado, p. ej. el de Render o un Docker local:
 *      PORTAFOLIO_URL=https://mi-servicio.onrender.com node portafolio/scripts/capturar.js
 *      (PowerShell:  $env:PORTAFOLIO_URL="https://..."; node portafolio/scripts/capturar.js)
 * Requiere un navegador Chromium (Chrome, Edge o Brave) para las capturas; en modo local, además JDK, XAMPP y Tomcat (igual que server.js).
 * Solo hace peticiones GET a las apps con base de datos (labs 4 y 5): no modifica datos.
 */
const { spawn, spawnSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const WEB = path.resolve(__dirname, '..', 'web');
const IMG = path.join(WEB, 'img', 'capturas');
const OUT = path.join(WEB, 'js', 'capturas.js');
const PORT = 5199;
const EXTERNAL = (process.env.PORTAFOLIO_URL || (process.argv.find(a => a.startsWith('--url=')) || '').slice(6) || '').replace(/\/+$/, '');
const BASE = EXTERNAL || `http://127.0.0.1:${PORT}`;
const E = process.env;
const NAVEGADORES = process.platform === 'win32' ? [
  `${E.PROGRAMFILES}\\Google\\Chrome\\Application\\chrome.exe`, `${E['PROGRAMFILES(X86)']}\\Google\\Chrome\\Application\\chrome.exe`, `${E.LOCALAPPDATA}\\Google\\Chrome\\Application\\chrome.exe`,
  `${E['PROGRAMFILES(X86)']}\\Microsoft\\Edge\\Application\\msedge.exe`, `${E.PROGRAMFILES}\\Microsoft\\Edge\\Application\\msedge.exe`,
  `${E.PROGRAMFILES}\\BraveSoftware\\Brave-Browser\\Application\\brave.exe`, `${E.LOCALAPPDATA}\\BraveSoftware\\Brave-Browser\\Application\\brave.exe`]
  : process.platform === 'darwin' ? ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser', '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge']
  : ['/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser', '/usr/bin/brave-browser', '/usr/bin/microsoft-edge'];
const CHROME = E.NAVEGADOR || NAVEGADORES.find(p => p && fs.existsSync(p));   // NAVEGADOR=ruta para forzar uno
/* El nombre sale de web/js/perfil.js (así cada estudiante captura con su propio nombre). */
const NOMBRE = (() => { try { const w = {}; new Function('window', fs.readFileSync(path.join(WEB, 'js', 'perfil.js'), 'utf8'))(w); return w.PERFIL.nombre || 'Estudiante'; } catch { return 'Estudiante'; } })();
const sleep = ms => new Promise(r => setTimeout(r, ms));
const hoy = () => { const d = new Date(); const p = n => String(n).padStart(2, '0'); return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()}`; };

const post = async u => (await fetch(BASE + u, { method: 'POST', signal: AbortSignal.timeout(180000) })).json();

/* Un servidor gratuito (p. ej. Render) duerme y arranca despacio: se espera a que despierte y a que cada lab termine de iniciar. */
async function despertar() {
  for (let i = 0; i < 40; i++) {
    try { const r = await fetch(BASE + '/api/estado', { signal: AbortSignal.timeout(20000) }); const j = await r.json(); if (j && j.ok) return; } catch { /* sigue dormido */ }
    if (i === 0) console.log('  esperando a que el servidor despierte (puede tardar ~1 min)…');
    await sleep(4000);
  }
  throw new Error('El servidor no respondió en ' + BASE);
}
async function iniciar(lab) {
  let r = await post(`/api/start/${lab}`);
  if (r.pending) {                                  // arranque lento: se consulta el estado hasta que termine
    for (let i = 0; i < 200; i++) {
      await sleep(3000);
      const e = await (await fetch(BASE + '/api/estado', { signal: AbortSignal.timeout(30000) })).json();
      const l = e.labs[lab] || {};
      if (!l.iniciando) { r = l.resultado || { ok: l.activo, msg: 'listo' }; break; }
    }
  }
  return r;
}

/* Mismas peticiones que muestra la página (web/js/main.js). `rep` = veces que se repite (201 → 409). */
const API = {
  lab7: { base: '/proxy/7', reqs: [
    { l: 'GET /api/espacios', m: 'GET', p: '/api/espacios' },
    { l: 'GET /api/estado', m: 'GET', p: '/api/estado' },
    { l: 'GET /api/reservas', m: 'GET', p: '/api/reservas' },
    { l: 'POST reserva (201 → 409)', m: 'POST', p: '/api/reservas', rep: 2, b: { espacioId: 2, fecha: '2026-10-21', hora: '10:00', solicitante: NOMBRE } },
    { l: 'POST espacio 9 (404)', m: 'POST', p: '/api/reservas', b: { espacioId: 9, fecha: '2026-10-21', hora: '10:00', solicitante: NOMBRE } },
    { l: 'POST incompleto (400)', m: 'POST', p: '/api/reservas', b: { espacioId: 2 } },
    { l: 'GET /api/lento (500 ms)', m: 'GET', p: '/api/lento?ms=500' },
  ] },
  lab8: { base: '/proxy/8', key: 'unachi-prog5', reqs: [
    { l: 'GET lista', m: 'GET', p: '/api/reservas' },
    { l: 'GET #1', m: 'GET', p: '/api/reservas/1' },
    { l: 'GET #999 (404)', m: 'GET', p: '/api/reservas/999' },
    { l: 'POST válida (201 → 409)', m: 'POST', p: '/api/reservas', k: 1, save: 1, rep: 2, b: { laboratorio: 'LAB-3', solicitante: NOMBRE, fecha: '2026-10-24', horaInicio: '08:00', horaFin: '10:00' } },
    { l: 'POST sin API key (401)', m: 'POST', p: '/api/reservas', b: { laboratorio: 'LAB-3', solicitante: NOMBRE, fecha: '2026-10-25', horaInicio: '08:00', horaFin: '10:00' } },
    { l: 'POST inválida (400)', m: 'POST', p: '/api/reservas', k: 1, b: { laboratorio: 'LAB-9', solicitante: '' } },
    { l: 'DELETE última creada (204)', m: 'DELETE', p: '/api/reservas/{last}', k: 1 },
  ] },
};

const SHOTS = {
  lab4: { svc: 'lab4', pages: [['/estudiantes', 'Lista de estudiantes', 'lab4-lista.png'], ['/estudiantes/nuevo', 'Formulario de alta', 'lab4-nuevo.png']], root: 'http://127.0.0.1:8080' },
  lab5: { svc: 'lab5', pages: [['/gestion-inventario/', 'Menú principal', 'lab5-menu.png'], ['/gestion-inventario/articulos', 'Artículos', 'lab5-articulos.png'], ['/gestion-inventario/existencias', 'Existencias', 'lab5-existencias.png']], root: 'http://127.0.0.1:8080' },
};

function foto(url, file) {
  const prof = fs.mkdtempSync(path.join(os.tmpdir(), 'chrome-captura-'));
  const r = spawnSync(CHROME, ['--headless=new', '--disable-gpu', '--hide-scrollbars', `--user-data-dir=${prof}`, '--window-size=1280,760', `--virtual-time-budget=${EXTERNAL ? 20000 : 4000}`, `--screenshot=${file}`, url], { windowsHide: true, timeout: EXTERNAL ? 150000 : 60000 });
  fs.rmSync(prof, { recursive: true, force: true });
  return r.status === 0 && fs.existsSync(file);
}

(async () => {
  if (!CHROME) throw new Error('No se encontró Chrome, Edge ni Brave. Instala uno o indica la ruta con la variable NAVEGADOR.');
  fs.mkdirSync(IMG, { recursive: true });
  const srv = EXTERNAL ? null : spawn(process.execPath, [path.resolve(__dirname, '..', 'server.js')], { env: { ...process.env, PORTAFOLIO_PORT: String(PORT) }, windowsHide: true, stdio: 'ignore' });
  console.log(EXTERNAL ? `Capturando contra el servidor remoto: ${BASE}` : 'Capturando con el servidor local');
  const cap = { fecha: hoy(), runs: {}, api: {}, shots: {} };
  try {
    if (EXTERNAL) await despertar(); else for (let i = 0; i < 20; i++) { try { await fetch(BASE + '/api/estado'); break; } catch { await sleep(300); } }

    /* ---- Labs 1 y 2: programas de consola ---- */
    for (const id of ['lab1', 'lab2-maestro', 'lab2-pipe', 'lab2-cuenta', 'lab2-poo']) {
      const r = await (await fetch(`${BASE}/api/run/${id}`, { method: 'POST', signal: AbortSignal.timeout(180000) })).json();
      console.log(`  ${id}: ${r.ok ? 'OK' : 'ERROR'} (${r.ms || 0} ms)`);
      if (!r.ok) throw new Error(`${id} falló:\n${r.out}`);
      cap.runs[id] = { out: r.out.replace(/\r/g, '').trimEnd(), ms: r.ms || 0 };
    }

    /* ---- Labs 7 y 8: respuestas reales de las APIs ---- */
    for (const [lab, cfg] of Object.entries(API)) {
      const s = await iniciar(lab); console.log(`  ${lab}: ${s.msg}`);
      if (!s.ok) throw new Error(s.msg);
      let last = null; cap.api[lab] = [];
      for (const r of cfg.reqs) {
        const veces = [];
        for (let n = 0; n < (r.rep || 1); n++) {
          let p = r.p;
          if (p.includes('{last}')) p = p.replace('{last}', last);
          const headers = { 'Content-Type': 'application/json' }; if (r.k) headers['X-API-KEY'] = cfg.key;
          const t0 = Date.now();
          const res = await fetch(BASE + cfg.base + p, { method: r.m, headers, body: r.b ? JSON.stringify(r.b) : undefined });
          const txt = await res.text(); let pretty = txt;
          try { const j = JSON.parse(txt); pretty = JSON.stringify(j, null, 2); if (r.save && res.status === 201) last = j.id; } catch { /* no es JSON */ }
          veces.push({ status: res.status, ms: Date.now() - t0, body: pretty });
        }
        cap.api[lab].push({ l: r.l, m: r.m, p: r.p, k: r.k ? 1 : 0, res: veces });
        console.log(`    ${r.l}: ${veces.map(v => v.status).join(' → ')}`);
      }
      await post(`/api/stop/${lab}`); await sleep(1500);
    }

    /* ---- Labs 4 y 5: capturas de pantalla (solo GET) ---- */
    for (const [lab, cfg] of Object.entries(SHOTS)) {
      const s = await iniciar(cfg.svc); console.log(`  ${lab}: ${s.msg}`);
      if (!s.ok) throw new Error(s.msg);
      cap.shots[lab] = [];
      for (const [ruta, titulo, nombre] of cfg.pages) {
        const ok = foto((EXTERNAL || cfg.root) + ruta, path.join(IMG, nombre));
        console.log(`    ${nombre}: ${ok ? 'OK' : 'FALLÓ'}`);
        if (ok) cap.shots[lab].push({ src: 'img/capturas/' + nombre, titulo, url: (EXTERNAL ? new URL(EXTERNAL).host : 'localhost:8080') + ruta });
      }
      await post(`/api/stop/${cfg.svc}`); await sleep(1500);
    }
  } finally {
    try { await post('/api/stop/mysql'); } catch { /* sin servidor */ }   // apagado limpio de MySQL/MariaDB
    if (srv) spawnSync('taskkill', ['/PID', String(srv.pid), '/T', '/F'], { windowsHide: true });
  }
  fs.writeFileSync(OUT, '/* Generado por scripts/capturar.js — ejecuciones reales; no editar a mano */\nwindow.CAPTURAS = ' + JSON.stringify(cap) + ';\n');
  console.log(`\ncapturas.js generado (${cap.fecha}) → ${path.relative(process.cwd(), OUT)}`);
})().catch(e => { console.error('\nERROR:', e.message); process.exit(1); });
