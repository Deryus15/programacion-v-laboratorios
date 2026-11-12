/* Fondo de la portada: un ojo dibujado con el CÓDIGO REAL de los laboratorios.
   - Todo el fondo es código (el de window.CODIGO) que sube lentamente, como en un editor.
   - El ojo mira hacia donde esté el cursor (o el dedo); si no hay movimiento, mira alrededor solo.
   - Una "lente" alrededor del cursor ilumina el código y lo empuja un poco.
   - Cada clic/toque lanza una onda que recorre el fondo; el ojo parpadea cada pocos segundos.
   - Se pausa cuando la portada no se ve.
   - Con "reducir movimiento" se apagan los movimientos AUTOMÁTICOS (código que sube, parpadeo, mirada errante);
     lo que responde al usuario (mirada, lente, ondas) sigue funcionando. */
(function () {
  const canvas = document.getElementById('ojo');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const GLYPHS = '0123456789ABCDEF<>{}[]/\\|=+*#$%&?!:;~^';
  const hash = (a, b) => { let x = Math.imul(a * 374761393 + b * 668265263, 1274126177); x ^= x >>> 13; x = Math.imul(x, 1103515245); return ((x ^ (x >>> 16)) >>> 0) / 4294967296; };

  // El fondo es el código de los laboratorios, sin espacios (denso, como una matriz de código).
  let corpus = '';
  try { corpus = Object.values(window.CODIGO || {}).flat().map(f => f.texto).join('\n'); } catch (e) { /* sin código: se usa el de reserva */ }
  corpus = (corpus || 'public static void main(String[] args) { System.out.println("Hola"); } class Estudiante { private String nombre; }').replace(/\s+/g, '');
  const CL = corpus.length;

  let W = 0, H = 0, dpr = 1, cell = 12, cols = 0, rows = 0, cx = 0, cy = 0, EW = 0, EH = 0, small = false;
  let tx = 0, ty = 0, ox = 0, oy = 0;                 // mirada: objetivo y valor actual (-1..1)
  let pcx = -1e4, pcy = -1e4, lx = -1e4, ly = -1e4;   // cursor (cliente) y lente suavizada (canvas)
  let lastMove = -1e9;
  const ripples = [];
  let blinkAt = performance.now() + 2500, blinkT = -1, needDraw = true;
  let t0 = performance.now(), visible = true, raf = 0, last = 0;
  const cache = new Map();
  const sty = (col, a) => { const q = Math.round(Math.min(1, a) * 24), k = col + '|' + q; let s = cache.get(k); if (!s) { s = `rgba(${col},${(q / 24).toFixed(3)})`; cache.set(k, s); } return s; };

  function resize() {
    const r = canvas.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = r.width; H = r.height; small = W < 700;
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    cell = small ? Math.max(10, Math.round(W / 36)) : Math.max(11, Math.round(W / 112));
    cols = Math.ceil(W / cell) + 1; rows = Math.ceil(H / cell) + 2;
    const vh = Math.min(H, window.innerHeight || H);
    cx = W >= 1000 ? W * 0.66 : W / 2; cy = vh * (small ? 0.40 : 0.50);   // en pantallas anchas el ojo queda a la derecha de la ventana
    EW = small ? W * 0.98 : Math.min(W * (W >= 1000 ? 0.40 : 0.60), vh * 1.25, 820);
    EH = EW * 0.42;
    ctx.font = `500 ${cell - 1}px "JetBrains Mono", monospace`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    needDraw = true;
  }

  function mover(e) { pcx = e.clientX; pcy = e.clientY; lastMove = performance.now(); }
  addEventListener('pointermove', mover, { passive: true });
  addEventListener('pointerdown', mover, { passive: true });
  document.documentElement.addEventListener('pointerleave', () => { pcx = pcy = -1e4; });
  function pulso(clientX, clientY) {
    const r = canvas.getBoundingClientRect();
    ripples.push({ x: clientX - r.left, y: clientY - r.top, t: performance.now() });
    if (ripples.length > 4) ripples.shift();
    blinkAt = 0;                                       // un parpadeo de sorpresa
    needDraw = true;
  }
  canvas.parentElement.addEventListener('pointerdown', e => pulso(e.clientX, e.clientY));
  window.addEventListener('ojo:pulso', e => pulso(e.detail.x, e.detail.y));

  function frame(now) {
    const dt = Math.min(50, now - (last || now)); last = now;
    const rect = canvas.getBoundingClientRect();
    const idle = now - lastMove > 3500;
    if (!idle && pcx > -1e3) {                         // la mirada sigue al cursor
      tx = Math.max(-1, Math.min(1, (pcx - rect.left - cx) / (rect.width * 0.45)));
      ty = Math.max(-1, Math.min(1, (pcy - rect.top - cy) / (rect.height * 0.40)));
    } else if (!reduce) {                              // sin movimiento: mira alrededor
      tx = Math.sin(now / 2300) * 0.75; ty = Math.sin(now / 3100) * 0.35;
    }
    ox += (tx - ox) * Math.min(1, dt * 0.007); oy += (ty - oy) * Math.min(1, dt * 0.007);
    // lente suavizada
    const tlx = pcx - rect.left, tly = pcy - rect.top;
    if (lx < -1e3 || pcx < -1e3) { lx = tlx; ly = tly; } else { lx += (tlx - lx) * Math.min(1, dt * 0.02); ly += (tly - ly) * Math.min(1, dt * 0.02); }
    // parpadeo
    let open = 1;
    if (!reduce) {
      if (blinkT < 0 && now > blinkAt) blinkT = now;
      if (blinkT >= 0) {
        const k = (now - blinkT) / 320;
        if (k >= 1) { blinkT = -1; blinkAt = now + 3000 + Math.random() * 4000; }
        else open = 1 - Math.sin(k * Math.PI) * 0.94;
      }
    }
    const reveal = reduce ? 1 : Math.min(1, (now - t0) / 2600);
    const maxD = Math.hypot(W, H) * 0.55;
    const ex = cx + ox * 14, ey = cy + oy * 8;         // el ojo entero se desplaza un poco (profundidad)
    const ix = ex + ox * EW * 0.30, iy = ey + oy * EH * 0.55;
    const IR = EH * 0.80, PR = IR * 0.40;
    const tick = Math.floor(now / 70);
    const scroll = reduce ? 0 : now * 0.010;           // px que ha subido el código
    const yOff = scroll % cell, rowShift = Math.floor(scroll / cell);
    const LR = small ? 90 : 150;
    for (let i = ripples.length - 1; i >= 0; i--) if (now - ripples[i].t > 1800) ripples.splice(i, 1);

    ctx.clearRect(0, 0, W, H);
    for (let r = 0; r < rows; r++) {
      const y = r * cell + cell / 2 - yOff, dy = y - ey;
      for (let c = 0; c < cols; c++) {
        const x = c * cell + cell / 2, dx = x - ex;
        const gi = (r + rowShift) * cols + c;
        const nx = Math.abs(dx) / EW;
        const lid = nx < 1 ? EH * open * Math.pow(1 - nx * nx, 0.78) : -1;
        const inside = lid > 0 && Math.abs(dy) < lid;
        const edge = lid > 0 ? Math.abs(Math.abs(dy) - lid) : 99;
        let a = 0, col = '143,162,255';

        if (inside) {
          const d = Math.hypot(x - ix, y - iy);
          if (edge < cell * 1.35) { a = 1; col = '240,243,255'; }                 // párpados (trazo grueso)
          else if (d < PR) { a = 0.07 + 0.1 * (1 - d / PR); }                      // pupila (oscura)
          else if (d < IR) {                                                       // iris
            const k = (d - PR) / (IR - PR);
            a = 0.35 + 0.55 * Math.sin(k * Math.PI * 0.9 + 0.25) + (k > 0.9 ? 0.25 : 0);
            a = Math.min(1, a * (0.8 + 0.5 * hash(c, r)) * 1.12);
            col = k > 0.7 ? '185,196,255' : '143,162,255';
          } else { a = 0.07 + 0.08 * hash(c, r); col = '120,132,180'; }            // esclerótica
          const gl = Math.hypot(x - (ix - IR * 0.32), y - (iy - IR * 0.34));
          if (gl < IR * 0.16) { a = 1; col = '255,255,255'; }                      // destello
          a *= 0.92;
        } else {
          // código ambiental: aparece en parte de las celdas y sube con el texto
          const h = hash(c, (r + rowShift) * 3 + 1);
          if (h > 0.5) { a = 0.028 + 0.05 * hash(r + rowShift, c); col = '110,122,170'; }
          if (lid > 0 && edge < cell * 1.6 && Math.abs(dy) >= lid) a = Math.max(a, 0.3);
        }

        // lente del cursor: ilumina y empuja el código
        let px = x, py = y;
        if (lx > -1e3) {
          const ddx = x - lx, ddy = y - ly, dl = Math.hypot(ddx, ddy);
          if (dl < LR) {
            const k = 1 - dl / LR, kk = k * k * (3 - 2 * k);
            a = Math.max(a, 0.10) + kk * 0.62;
            col = kk > 0.55 ? '232,236,255' : '160,178,255';
            if (dl > 1) { px += ddx / dl * kk * 6; py += ddy / dl * kk * 6; }
          }
        }
        // ondas de los clics
        for (const rp of ripples) {
          const age = (now - rp.t) / 1800, rad = (now - rp.t) * 0.55;
          const w = Math.abs(Math.hypot(x - rp.x, y - rp.y) - rad);
          if (w < 34) { a += (1 - w / 34) * 0.9 * (1 - age); col = '232,236,255'; }
        }
        if (a <= 0.02) continue;

        // descifrado inicial: lo lejano al centro aparece más tarde
        const dd = Math.hypot(x - cx, y - cy) / maxD;
        const decoded = reveal >= 1 || dd < reveal * 1.15;
        if (!decoded) a *= 0.35;
        let ch = corpus[gi % CL];
        if (!decoded || (!reduce && inside && hash(gi, tick) < 0.035)) ch = GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
        if (!reduce && inside) a *= 0.88 + 0.12 * Math.sin(now / 900 + dx * 0.012);

        ctx.fillStyle = sty(col, a);
        ctx.fillText(ch, px, py);
      }
    }
  }

  let frameSkip = 0;
  function loop(now) {
    // con movimiento reducido solo se redibuja mientras hay interacción (mouse reciente, onda o cambio de tamaño)
    const activo = !reduce || needDraw || now - lastMove < 1600 || ripples.length > 0;
    if (activo && (!small || (frameSkip ^= 1))) { frame(now); needDraw = false; }
    raf = requestAnimationFrame(loop);                  // en móviles ~30 fps
  }
  function play() { if (!raf) raf = requestAnimationFrame(loop); }
  function stop() { cancelAnimationFrame(raf); raf = 0; last = 0; }

  new IntersectionObserver(es => { visible = es[0].isIntersecting; visible ? play() : stop(); }, { threshold: 0 }).observe(canvas);
  new ResizeObserver(resize).observe(canvas);
  document.addEventListener('visibilitychange', () => document.hidden ? stop() : (visible && play()));
  resize(); play();
})();
