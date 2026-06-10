/* ============================================================
   Terres · Parcel Map — 2D / 3D isométrico en SVG puro
   ------------------------------------------------------------
   Sin WebGL ni workers → corre en cualquier sandbox e imprime
   perfecto. Mismo dataset (parcelas + alturas) que después se
   alimenta desde BigQuery: reemplazá buildMockScene() por un
   GeoJSON real (parcela del lote + tejido de la manzana, cada
   feature con properties.height en metros) y proyectá las
   coordenadas a metros locales centradas en el lote.
   ============================================================ */
(function () {
  const NS = 'http://www.w3.org/2000/svg';
  const css = getComputedStyle(document.documentElement);
  const tok = (n, fb) => (css.getPropertyValue(n).trim() || fb);

  // hex (#RGB/#RRGGBB) → rgba(...) con alpha. Solo para tintar tokens de la escala.
  function hexA(hex, a) {
    let h = (hex || '').trim().replace('#', '');
    if (h.length === 3) h = h.split('').map(c => c + c).join('');
    const n = parseInt(h, 16);
    if (isNaN(n) || h.length !== 6) return hex;
    return 'rgba(' + ((n >> 16) & 255) + ',' + ((n >> 8) & 255) + ',' + (n & 255) + ',' + a + ')';
  }

  const COL = {
    land:        tok('--map-land', '#FFEDD6'),       // basemap tintado a cream
    surface:     tok('--surface-raised', '#FFF8EC'),
    muted:       tok('--muted-foreground', '#5C3A2E'),
    text:        tok('--foreground', '#380000'),
    // catastro vecino (cream, sin azul)
    parcelFill:  tok('--map-context-fill', '#FFF8EC'),
    parcelLine:  hexA(tok('--map-context-line', '#8D1800'), 0.30),
    street:      tok('--map-land', '#FFEDD6'),
    streetLine:  hexA(tok('--map-stroke', '#8D1800'), 0.05),
    label:       hexA(tok('--neutral-700', '#7A5F3F'), 0.55),
    // parcela objetivo: relleno naranja 0.18 en reposo + borde 2px
    subjFill:    hexA(tok('--map-parcel', '#E76D00'), 0.18),
    subjLine:    tok('--map-parcel', '#E76D00'),
    // volumen escalonado · tokens --map-volume-1..4 (escala naranja del sistema)
    vBody1:      tok('--map-volume-1', '#E76D00'),   // cuerpo, cara frente
    vBody2:      tok('--map-volume-2', '#C75D00'),   // cuerpo, cara lateral
    vR1:         tok('--map-volume-3', '#A04B00'),   // retiro 1
    vR2:         tok('--map-volume-4', '#783800'),   // retiro 2
    vTop:        tok('--orange-400', '#F58A14')      // tapa del cuerpo (claro)
  };

  const D2R = Math.PI / 180;

  /* ---- Escena mock (reemplazable por BQ) -------------------- */
  function buildMockScene() {
    const parcels = [];
    const STREET = 16;          // ancho de calle (m)
    const BW = 104, BH = 62;    // tamaño de manzana (m)
    const STEPX = BW + STREET;
    const STEPY = BH + STREET;

    function addBlock(cx, cy, cols) {
      const pw = BW / cols, ph = BH / 2, inset = 0.7;
      const block = [];
      for (let r = 0; r < 2; r++) {
        for (let c = 0; c < cols; c++) {
          const x0 = cx - BW / 2 + c * pw;
          const y0 = cy - BH / 2 + r * ph;
          block.push({
            pts: [
              [x0 + inset, y0 + inset],
              [x0 + pw - inset, y0 + inset],
              [x0 + pw - inset, y0 + ph - inset],
              [x0 + inset, y0 + ph - inset]
            ],
            cx: x0 + pw / 2, cy: y0 + ph / 2, w: pw, h: ph,
            subject: false
          });
        }
      }
      parcels.push(...block);
      return block;
    }

    // grilla 3×3 de manzanas; la central contiene el lote
    let central;
    for (let gy = -1; gy <= 1; gy++) {
      for (let gx = -1; gx <= 1; gx++) {
        const cols = 5 + ((gx + gy) & 1);
        const blk = addBlock(gx * STEPX, gy * STEPY, cols);
        if (gx === 0 && gy === 0) central = blk;
      }
    }

    // lote = parcela de la fila sur (hacia el visor), columna central
    const cols = central.length / 2;
    const subj = central[Math.floor(cols / 2)]; // fila r=0 (sur)
    subj.subject = true;
    // cotas + título de frente (variables de template; reemplazables por GeoJSON de BQ)
    subj.dims = (window.TERRES_MAP && window.TERRES_MAP.dims) ||
                { frente: '14,2 m', fondo: '33,1 m' };

    // perfil de alturas del volumen (PB+5 = 17,20m + 2 retiros)
    const setback = 1.4;
    const baseFoot = insetRect(subj, setback);
    subj.building = [
      { foot: baseFoot,                z0: 0,    z1: 17.2, kind: 'main' },
      { foot: insetRect(subj, 4.5),    z0: 17.2, z1: 20.0, kind: 'retiro' },
      { foot: insetRect(subj, 7.5),    z0: 20.0, z1: 22.8, kind: 'retiro' }
    ];

    const streets = [
      { x: 0,        y: STEPY / 2,  text: 'Zapiola',          rot: 0 },
      { x: 0,        y: -STEPY / 2, text: 'Conde',            rot: 0 },
      { x: STEPX / 2,  y: 0,        text: 'Av. F. Lacroze',   rot: 90 },
      { x: -STEPX / 2, y: 0,        text: 'Av. Crámer',       rot: 90 }
    ];

    return { parcels, streets, subject: subj };
  }

  function insetRect(p, d) {
    return [
      [p.cx - p.w / 2 + d, p.cy - p.h / 2 + d],
      [p.cx + p.w / 2 - d, p.cy - p.h / 2 + d],
      [p.cx + p.w / 2 - d, p.cy + p.h / 2 - d],
      [p.cx - p.w / 2 + d, p.cy + p.h / 2 - d]
    ];
  }

  /* ---- Proyección 2D↔3D interpolada ------------------------- */
  function makeProjector(V) {
    const cy = Math.cos(V.yaw), sy = Math.sin(V.yaw);
    return function (x, y, z) {
      const rx = x * cy - y * sy;
      const ry = x * sy + y * cy;
      const depth = ry * (1 - 0.5 * V.tilt);
      const sx = rx * V.scale;
      const syy = -depth * V.scale - (z || 0) * V.scale * 1.05 * V.tilt;
      return [V.ox + sx, V.oy + syy];
    };
  }

  function el(tag, attrs) {
    const e = document.createElementNS(NS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    return e;
  }
  const ptsStr = (a) => a.map(p => p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' ');
  function line(p, q, stroke, w, opacity) {
    return el('line', { x1: p[0].toFixed(1), y1: p[1].toFixed(1), x2: q[0].toFixed(1), y2: q[1].toFixed(1), stroke: stroke, 'stroke-width': w, 'stroke-linecap': 'round', opacity: opacity });
  }

  /* ---- Texto de cota con halo (número o título de calle) --- */
  function dimText(g, x, y, text, o) {
    const t = el('text', {
      x: x.toFixed(1), y: y.toFixed(1), 'text-anchor': 'middle', 'dominant-baseline': 'middle',
      'font-family': o.font, 'font-size': o.size, 'font-weight': o.weight,
      fill: o.fill, stroke: COL.land, 'stroke-width': o.halo, 'paint-order': 'stroke', 'stroke-linejoin': 'round',
      'letter-spacing': o.ls || '0.01em', 'font-feature-settings': '"tnum"', opacity: o.opa
    });
    t.textContent = text;
    g.appendChild(t);
  }
  const MONO = 'IBM Plex Mono, monospace';
  const SANS = 'IBM Plex Sans, system-ui, sans-serif';

  /* ---- Cota de altura (visible en 3D) ---------------------- */
  function drawHeightCota(svg, P, subj, V) {
    if (!subj || !subj.building) return;
    const fade = Math.min(1, Math.max(0, (V.tilt - 0.45) / 0.4));
    if (fade <= 0.02) return;
    const foot = subj.building[0].foot;
    const c = foot[0];                       // esquina frontal-izquierda (lejos de la cota de fondo)
    const z1 = subj.building[0].z1;          // 17,2 m
    const off = 7;
    // desplazar la cota hacia afuera (x-), a la izquierda del edificio
    const bx = [c[0] - off, c[1]];
    const sb = P(bx[0], bx[1], 0), st = P(bx[0], bx[1], z1);
    const col = COL.subjLine;
    const opa = (0.92 * fade).toFixed(2);
    const g = el('g', {});
    g.appendChild(line(P(c[0], c[1], 0), sb, col, 1, (0.32 * fade).toFixed(2)));     // ext inferior
    g.appendChild(line(P(c[0], c[1], z1), st, col, 1, (0.32 * fade).toFixed(2)));    // ext superior
    g.appendChild(line(sb, st, col, 1.3, opa));                                       // línea de cota
    // topes horizontales en extremos
    g.appendChild(line([sb[0] - 5, sb[1]], [sb[0] + 5, sb[1]], col, 1.5, opa));
    g.appendChild(line([st[0] - 5, st[1]], [st[0] + 5, st[1]], col, 1.5, opa));
    // número cerca del extremo superior de la línea, a la izquierda
    const lx = sb[0] + (st[0] - sb[0]) * 0.86, ly = sb[1] + (st[1] - sb[1]) * 0.86;
    dimText(g, lx - 22, ly, '17,2 m', { font: MONO, size: 12, weight: 600, fill: col, halo: 4.5, opa: opa });
    svg.appendChild(g);
  }

  /* ---- Cotas (frente / profundidad) sobre el lote ---------- */
  function drawCotas(svg, P, subj, V) {
    if (!subj || !subj.dims) return;
    const fade = 1;   // visibles en 2D y 3D (apoyadas sobre el terreno)
    if (fade <= 0.02) return;
    const cx = subj.cx, cy = subj.cy, w = subj.w, h = subj.h;
    const x0 = cx - w / 2, x1 = cx + w / 2, y0 = cy - h / 2, y1 = cy + h / 2;
    // Frente = ancho sobre la LÍNEA MUNICIPAL (borde que da a la calle, eje y0)
    // Fondo = profundidad (borde lateral, eje y)
    drawCota(svg, P, [x0, y0], [x1, y0], [cx, cy], 5.6, subj.dims.frente, null, fade);
    drawCota(svg, P, [x1, y0], [x1, y1], [cx, cy], 5.6, subj.dims.fondo, null, fade);
  }

  function drawCota(svg, P, a, b, center, off, value, title, fade) {
    let dx = b[0] - a[0], dy = b[1] - a[1];
    const len = Math.hypot(dx, dy) || 1;
    let px = -dy / len, py = dx / len;               // perpendicular
    const mxw = (a[0] + b[0]) / 2, myw = (a[1] + b[1]) / 2;
    if ((mxw - center[0]) * px + (myw - center[1]) * py < 0) { px = -px; py = -py; } // hacia afuera (calle)
    const a2 = [a[0] + px * off, a[1] + py * off], b2 = [b[0] + px * off, b[1] + py * off];
    const sa2 = P(a2[0], a2[1], 0), sb2 = P(b2[0], b2[1], 0);
    const sMid = P(mxw + px * off, myw + py * off, 0);
    // versor "hacia la calle" en pantalla (perpendicular a la línea)
    const se = P(mxw, myw, 0), so = P(mxw + px, myw + py, 0);
    let oux = so[0] - se[0], ouy = so[1] - se[1];
    const oul = Math.hypot(oux, ouy) || 1; oux /= oul; ouy /= oul;
    const col = COL.subjLine;
    const opa = (0.97 * fade).toFixed(2);
    const g = el('g', {});
    // línea de cota continua
    g.appendChild(line(sa2, sb2, col, 1.3, opa));
    // topes en las puntas (verticales, hacia el lote)
    g.appendChild(line([sa2[0] + oux * 1.5, sa2[1] + ouy * 1.5], [sa2[0] - oux * 7, sa2[1] - ouy * 7], col, 1.5, opa));
    g.appendChild(line([sb2[0] + oux * 1.5, sb2[1] + ouy * 1.5], [sb2[0] - oux * 7, sb2[1] - ouy * 7], col, 1.5, opa));
    // número FLOTANDO sobre la línea, del lado del lote
    dimText(g, sMid[0] - oux * 11, sMid[1] - ouy * 11, value, { font: MONO, size: 12, weight: 600, fill: col, halo: 4, opa: opa });
    // título de calle del lado de la calle, separado
    if (title) {
      dimText(g, sMid[0] + oux * 22, sMid[1] + ouy * 22, title, { font: SANS, size: 14, weight: 600, fill: COL.text, halo: 5, ls: '0.005em', opa: opa });
    }
    svg.appendChild(g);
  }

  /* ---- Render ---------------------------------------------- */
  function render(svg, scene, V) {
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    const P = makeProjector(V);

    // fondo
    svg.appendChild(el('rect', { x: 0, y: 0, width: V.w, height: V.h, fill: COL.land }));

    // parcelas ordenadas de lejos (mayor y) a cerca
    const sorted = scene.parcels.slice().sort((a, b) =>
      (b.cy + (V.yaw ? b.cx * Math.tan(V.yaw) : 0)) - (a.cy + (V.yaw ? a.cx * Math.tan(V.yaw) : 0))
    );

    for (const p of sorted) {
      const flat = p.pts.map(pt => P(pt[0], pt[1], 0));
      if (p.subject) {
        // halo suave bajo el lote
        svg.appendChild(el('polygon', { points: ptsStr(flat), fill: 'none', stroke: COL.subjLine, 'stroke-width': 9, opacity: 0.14, 'stroke-linejoin': 'round' }));
      }
      const poly = el('polygon', {
        points: ptsStr(flat),
        fill: p.subject ? COL.subjFill : COL.parcelFill,
        stroke: p.subject ? COL.subjLine : COL.parcelLine,
        'stroke-width': p.subject ? 2 : 1,
        'stroke-linejoin': 'round'
      });
      svg.appendChild(poly);

      if (p.building && V.tilt > 0.02) drawBuilding(svg, P, p.building, V);
    }

    // etiquetas de calle
    for (const s of scene.streets) {
      const [lx, ly] = P(s.x, s.y, 0);
      const t = el('text', {
        x: lx, y: ly,
        fill: COL.label,
        'font-family': 'IBM Plex Mono, monospace',
        'font-size': 11, 'font-weight': 500,
        'letter-spacing': '0.04em',
        'text-anchor': 'middle',
        transform: `rotate(${(s.rot + V.yaw / D2R).toFixed(1)} ${lx.toFixed(1)} ${ly.toFixed(1)})`
      });
      t.textContent = s.text;
      svg.appendChild(t);
    }

    // cotas del lote (frente / profundidad) + altura en 3D
    drawCotas(svg, P, scene.subject, V);
    drawHeightCota(svg, P, scene.subject, V);
  }

  function drawBuilding(svg, P, boxes, V) {
    for (let i = 0; i < boxes.length; i++) {
      const box = boxes[i];
      const isR = box.kind === 'retiro';
      // cuerpo claro → retiros progresivamente más oscuros, dentro de la escala naranja
      let cTop, cL, cR;
      if (!isR) {                 // cuerpo
        cTop = COL.vTop; cL = COL.vBody1; cR = COL.vBody2;
      } else if (i <= 1) {        // retiro 1
        cTop = COL.vBody2; cL = COL.vR1; cR = COL.vR1;
      } else {                    // retiro 2 (y superiores)
        cTop = COL.vR1; cL = COL.vR2; cR = COL.vR2;
      }
      const top = box.foot.map(pt => P(pt[0], pt[1], box.z1));
      // caras laterales ordenadas por profundidad
      const faces = [];
      const n = box.foot.length;
      for (let i = 0; i < n; i++) {
        const a = box.foot[i], b = box.foot[(i + 1) % n];
        const quad = [P(a[0], a[1], box.z0), P(b[0], b[1], box.z0),
                      P(b[0], b[1], box.z1), P(a[0], a[1], box.z1)];
        const midY = (a[1] + b[1]) / 2, midX = (a[0] + b[0]) / 2;
        // lado "derecho" (mayor x) más oscuro; "frente" (menor y) intermedio
        const fill = (midX > box.foot[0][0] + 0.1 && Math.abs(b[0] - a[0]) < Math.abs(b[1] - a[1])) ? cR : cL;
        faces.push({ quad, depth: midY, fill });
      }
      faces.sort((f, g) => g.depth - f.depth);
      for (const f of faces) {
        svg.appendChild(el('polygon', { points: ptsStr(f.quad), fill: f.fill, 'stroke-linejoin': 'round' }));
      }
      // cara superior
      svg.appendChild(el('polygon', { points: ptsStr(top), fill: cTop, stroke: 'rgba(141,24,0,0.18)', 'stroke-width': 0.8, 'stroke-linejoin': 'round' }));
    }
  }

  /* ---- Controlador / API ----------------------------------- */
  function init(container, opts) {
    opts = opts || {};
    const scene = buildMockScene();
    const svg = el('svg', { width: '100%', height: '100%' });
    svg.style.display = 'block';
    container.appendChild(svg);

    const V = { scale: 1, ox: 0, oy: 0, yaw: -30 * D2R, tilt: opts.tilt3d ? 1 : 0, w: 0, h: 0, zoom: 2.4 };

    // Encuadre preset: ubica el lote a la derecha de la tarjeta de código urbanístico
    function applyFocus() {
      V.ox = V.w / 2;
      V.oy = V.h * (0.5 + 0.06 * V.tilt);
      if (!scene.subject) return;
      const Pp = makeProjector(V);
      const zf = scene.subject.building ? scene.subject.building[0].z1 * 0.38 * V.tilt : 0;
      const [sx, sy] = Pp(scene.subject.cx, scene.subject.cy, zf);
      const fx = V.w < 700 ? 0.5 : 0.61;   // a la derecha de la tarjeta flotante en desktop
      const fy = 0.47;
      V.ox += (V.w * fx - sx);
      V.oy += (V.h * fy - sy);
    }

    function fit() {
      const r = container.getBoundingClientRect();
      if (!r.width || !r.height) { requestAnimationFrame(fit); return; }  // espera al layout
      V.w = r.width; V.h = r.height;
      svg.setAttribute('viewBox', `0 0 ${V.w} ${V.h}`);
      const base = Math.min(V.w, V.h) / 300;
      V.scale = base * V.zoom;
      applyFocus();
      render(svg, scene, V);
    }

    // animación de tilt (2D ↔ 3D)
    let raf = null;
    function animateTilt(target) {
      cancelAnimationFrame(raf);
      const start = V.tilt, t0 = performance.now(), dur = 620;
      (function step(now) {
        const k = Math.min(1, (now - t0) / dur);
        const e = 1 - Math.pow(1 - k, 3);       // easeOutCubic
        V.tilt = start + (target - start) * e;
        applyFocus();
        render(svg, scene, V);
        if (k < 1) raf = requestAnimationFrame(step);
      })(t0);
    }

    function setZoom(z) {
      V.zoom = Math.max(0.6, Math.min(3.6, z));
      fit();
    }

    fit();
    requestAnimationFrame(() => requestAnimationFrame(fit));  // re-fit tras layout
    window.addEventListener('load', fit);
    if (window.ResizeObserver) new ResizeObserver(fit).observe(container);

    return {
      to2D: () => animateTilt(0),
      to3D: () => animateTilt(1),
      isTilted: () => V.tilt > 0.5,
      zoomIn: () => setZoom(V.zoom * 1.25),
      zoomOut: () => setZoom(V.zoom / 1.25)
    };
  }

  window.TerresParcelMap = { init };
})();
