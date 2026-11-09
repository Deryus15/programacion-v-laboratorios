/* Ojo cifrado: una cuadrícula de caracteres que dibuja un ojo.
   - Se "descifra" desde el centro al cargar.
   - El iris sigue al cursor (o al dedo) con inercia.
   - Parpadea cada pocos segundos.
   - Se pausa cuando la portada no está visible. */
(function () {
  const canvas = document.getElementById('ojo');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const GLYPHS = '0123456789ABCDEF<>{}[]/\\|=+*#$%&?!:;~^'.split('');
  const hash = (a, b) => { let x = Math.imul(a * 374761393 + b * 668265263, 1274126177); x ^= x >>> 13; x = Math.imul(x, 1103515245); return ((x ^ (x >>> 16)) >>> 0) / 4294967295; };

  let W = 0, H = 0, dpr = 1, cell = 12, cols = 0, rows = 0, cx = 0, cy = 0, EW = 0, EH = 0;
  let chars = [];                       // carácter actual por celda
  let tx = 0, ty = 0, ox = 0, oy = 0;   // objetivo y posición del iris (-1..1)
  let blinkAt = performance.now() + 2500, blinkT = -1;
  let t0 = performance.now(), visible = true, raf = 0, last = 0;

  function resize() {
    const r = canvas.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = r.width; H = r.height;
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    cell = Math.max(11, Math.round(W / 118));
    cols = Math.ceil(W / cell) + 1; rows = Math.ceil(H / cell) + 1;
    const vh = Math.min(H, window.innerHeight || H);        // el hero puede ser más alto que la pantalla
    cx = W / 2; cy = vh * (W < 700 ? 0.24 : 0.28);
    EW = Math.min(W * (W < 700 ? 0.46 : 0.30), vh * 0.5, 470);
    EH = EW * 0.42;
    chars = Array.from({ length: cols * rows }, (_, i) => Math.floor(hash(i, 7) * GLYPHS.length));
    ctx.font = `500 ${cell - 1}px "JetBrains Mono", monospace`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    if (reduce) frame(performance.now() + 4000);
  }

  function pointer(x, y) {
    const r = canvas.getBoundingClientRect();
    tx = Math.max(-1, Math.min(1, (x - r.left - cx) / (r.width * 0.45)));
    ty = Math.max(-1, Math.min(1, (y - r.top - cy) / (r.height * 0.45)));
  }
  addEventListener('pointermove', e => pointer(e.clientX, e.clientY), { passive: true });
  addEventListener('touchmove', e => { if (e.touches[0]) pointer(e.touches[0].clientX, e.touches[0].clientY); }, { passive: true });

  function frame(now) {
    const dt = Math.min(50, now - (last || now)); last = now;
    // inercia del iris
    ox += (tx - ox) * Math.min(1, dt * 0.006); oy += (ty - oy) * Math.min(1, dt * 0.006);
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
    const reveal = Math.min(1, (now - t0) / 2600);                 // 0 → 1: descifrado
    const maxD = Math.hypot(W, H) * 0.55;
    const ix = cx + ox * EW * 0.30, iy = cy + oy * EH * 0.55;
    const IR = EH * 0.80, PR = IR * 0.40;
    const tick = Math.floor(now / 70);

    ctx.clearRect(0, 0, W, H);
    for (let r = 0; r < rows; r++) {
      const y = r * cell + cell / 2, dy = y - cy;
      for (let c = 0; c < cols; c++) {
        const x = c * cell + cell / 2, dx = x - cx, i = r * cols + c;
        const nx = Math.abs(dx) / EW;
        const lid = nx < 1 ? EH * open * Math.pow(1 - nx * nx, 0.78) : -1;
        const inside = lid > 0 && Math.abs(dy) < lid;
        const edge = lid > 0 ? Math.abs(Math.abs(dy) - lid) : 99;
        let a = 0, col = '143,162,255';

        if (inside) {
          const d = Math.hypot(x - ix, y - iy);
          if (edge < cell * 0.9) { a = 0.95; col = '232,236,255'; }              // párpados
          else if (d < PR) { a = 0.07 + 0.1 * (1 - d / PR); }                    // pupila (oscura)
          else if (d < IR) {                                                     // iris
            const k = (d - PR) / (IR - PR);
            a = 0.35 + 0.55 * Math.sin(k * Math.PI * 0.9 + 0.25) + (k > 0.9 ? 0.25 : 0);
            a *= 0.75 + 0.5 * hash(c, r);
            col = k > 0.7 ? '185,196,255' : '143,162,255';
          } else { a = 0.10 + 0.10 * hash(c, r); col = '120,132,180'; }          // esclerótica
          // destello
          const gl = Math.hypot(x - (ix - IR * 0.32), y - (iy - IR * 0.34));
          if (gl < IR * 0.16) { a = 1; col = '255,255,255'; }
        } else {
          // cifrado ambiental, muy tenue
          const h = hash(c, r * 3 + 1);
          if (h > 0.955) { a = 0.05 + 0.07 * hash(r, c); col = '110,122,170'; }
          if (lid > 0 && edge < cell * 1.6 && Math.abs(dy) >= lid) { a = Math.max(a, 0.3); }
        }
        if (a <= 0.02) continue;

        // descifrado: lo lejano al centro aparece más tarde
        const dd = Math.hypot(dx, dy) / maxD;
        const decoded = reveal >= 1 || dd < reveal * 1.15;
        if (!decoded) { a *= 0.35; }
        // parpadeo de caracteres (más rápido en el iris, más lento en el resto)
        const rate = inside ? 0.045 : 0.012;
        if (!reduce && (!decoded || hash(i, tick) < rate)) chars[i] = Math.floor(Math.random() * GLYPHS.length);
        // brillo "ola" que recorre el ojo
        if (!reduce && inside) a *= 0.88 + 0.12 * Math.sin(now / 900 + dx * 0.012);

        ctx.fillStyle = `rgba(${col},${Math.min(1, a).toFixed(3)})`;
        ctx.fillText(GLYPHS[chars[i]], x, y);
      }
    }
  }

  function loop(now) { frame(now); raf = requestAnimationFrame(loop); }
  function play() { if (!raf && !reduce) raf = requestAnimationFrame(loop); }
  function stop() { cancelAnimationFrame(raf); raf = 0; last = 0; }

  new IntersectionObserver(es => { visible = es[0].isIntersecting; visible ? play() : stop(); }, { threshold: 0 }).observe(canvas);
  new ResizeObserver(resize).observe(canvas);
  document.addEventListener('visibilitychange', () => document.hidden ? stop() : (visible && play()));
  resize(); play();
})();
