/* Traço & Tom — geometria para ilustrações vetoriais originais.
   Todas as artes do jogo são geradas por código (sem imagens externas). */
(function (global) {
  const VB = 400;
  const q = n => Math.round(n * 10) / 10;

  class Pb {
    constructor(opt = {}) {
      this.s = '';
      this.pts = [];
      this.cur = [0, 0];
      this.mirror = !!opt.mirror;
      this.flip = !!opt.flip;
    }
    _x(x) { return this.mirror ? VB - x : x; }
    _y(y) { return this.flip ? VB - y : y; }
    _p(x, y) { this.cur = [x, y]; this.pts.push([this._x(x), this._y(y)]); return this; }
    M(x, y) { this.s += `M${q(this._x(x))} ${q(this._y(y))}`; return this._p(x, y); }
    L(x, y) { this.s += `L${q(this._x(x))} ${q(this._y(y))}`; return this._p(x, y); }
    H(x) { this.s += `H${q(this._x(x))}`; return this._p(x, this.cur[1]); }
    V(y) { this.s += `V${q(this._y(y))}`; return this._p(this.cur[0], y); }
    Q(cx, cy, x, y) {
      this.s += `Q${q(this._x(cx))} ${q(this._y(cy))} ${q(this._x(x))} ${q(this._y(y))}`;
      this._p(cx, cy); return this._p(x, y);
    }
    C(a, b, c, d, x, y) {
      this.s += `C${q(this._x(a))} ${q(this._y(b))} ${q(this._x(c))} ${q(this._y(d))} ${q(this._x(x))} ${q(this._y(y))}`;
      this._p(a, b); this._p(c, d); return this._p(x, y);
    }
    A(rx, ry, rot, laf, sf, x, y) {
      const r = this.mirror || this.flip ? -rot : rot;
      const f = this.mirror !== this.flip ? (sf ? 0 : 1) : sf;
      this.s += `A${q(rx)} ${q(ry)} ${q(r)} ${laf} ${f} ${q(this._x(x))} ${q(this._y(y))}`;
      return this._p(x, y);
    }
    Z() { this.s += 'Z'; return this; }
    d() { return this.s; }
    c() {
      if (!this.pts.length) return [VB / 2, VB / 2];
      let x = 0, y = 0;
      this.pts.forEach(p => { x += p[0]; y += p[1]; });
      return [x / this.pts.length, y / this.pts.length];
    }
  }

  const rad = deg => (deg * Math.PI) / 180;
  const px = (cx, r, deg) => cx + r * Math.cos(rad(deg));
  const py = (cy, r, deg) => cy + r * Math.sin(rad(deg));

  function circle(pb, cx, cy, r) {
    pb.M(cx, cy - r).A(r, r, 0, 1, 1, cx, cy + r).A(r, r, 0, 1, 1, cx, cy - r).Z();
  }
  function ellipse(pb, cx, cy, rx, ry) {
    pb.M(cx, cy - ry).A(rx, ry, 0, 1, 1, cx, cy + ry).A(rx, ry, 0, 1, 1, cx, cy - ry).Z();
  }
  function dome(pb, cx, cy, rx, ry, up = true) {
    if (up) pb.M(cx - rx, cy).A(rx, ry, 0, 0, 1, cx + rx, cy).Z();
    else pb.M(cx - rx, cy).A(rx, ry, 0, 0, 0, cx + rx, cy).Z();
  }
  function ngon(pb, cx, cy, r, sides, rot = -90) {
    for (let i = 0; i < sides; i++) {
      const a = rot + (360 / sides) * i;
      i ? pb.L(px(cx, r, a), py(cy, r, a)) : pb.M(px(cx, r, a), py(cy, r, a));
    }
    pb.Z();
  }
  function star(pb, cx, cy, ro, ri, points, rot = -90) {
    for (let i = 0; i < points * 2; i++) {
      const r = i % 2 ? ri : ro;
      const a = rot + (180 / points) * i;
      i ? pb.L(px(cx, r, a), py(cy, r, a)) : pb.M(px(cx, r, a), py(cy, r, a));
    }
    pb.Z();
  }
  function wedge(pb, cx, cy, r, a0, a1) {
    pb.M(cx, cy).L(px(cx, r, a0), py(cy, r, a0)).A(r, r, 0, Math.abs(a1 - a0) > 180 ? 1 : 0, 1, px(cx, r, a1), py(cy, r, a1)).Z();
  }
  function ring(pb, cx, cy, r0, r1, a0, a1) {
    pb.M(px(cx, r1, a0), py(cy, r1, a0))
      .A(r1, r1, 0, Math.abs(a1 - a0) > 180 ? 1 : 0, 1, px(cx, r1, a1), py(cy, r1, a1))
      .L(px(cx, r0, a1), py(cy, r0, a1))
      .A(r0, r0, 0, Math.abs(a1 - a0) > 180 ? 1 : 0, 0, px(cx, r0, a0), py(cy, r0, a0))
      .Z();
  }
  /* pétala em lágrima apontando para o ângulo deg, do raio r0 ao r1 */
  function petal(pb, cx, cy, deg, r0, r1, wid) {
    const a = rad(deg), dx = Math.cos(a), dy = Math.sin(a), nx = -dy, ny = dx;
    const m1 = r0 + (r1 - r0) * 0.3, m2 = r0 + (r1 - r0) * 0.78;
    pb.M(cx + dx * r0, cy + dy * r0);
    pb.C(cx + dx * m1 + nx * wid, cy + dy * m1 + ny * wid,
      cx + dx * m2 + nx * wid * 0.72, cy + dy * m2 + ny * wid * 0.72,
      cx + dx * r1, cy + dy * r1);
    pb.C(cx + dx * m2 - nx * wid * 0.72, cy + dy * m2 - ny * wid * 0.72,
      cx + dx * m1 - nx * wid, cy + dy * m1 - ny * wid,
      cx + dx * r0, cy + dy * r0);
    pb.Z();
  }
  /* fatia horizontal de uma elipse (para listras de corpo, balão, escamas) */
  function bandH(pb, cx, cy, rx, ry, y0, y1) {
    const w = y => rx * Math.sqrt(Math.max(0, 1 - (((y - cy) / ry) ** 2)));
    const a = w(y0), b = w(y1), mid = (y0 + y1) / 2;
    pb.M(cx - a, y0).L(cx + a, y0);
    pb.Q(cx + Math.max(a, b) * 1.02, mid, cx + b, y1).L(cx - b, y1);
    pb.Q(cx - Math.max(a, b) * 1.02, mid, cx - a, y0).Z();
  }
  /* fatia vertical de uma elipse */
  function bandV(pb, cx, cy, rx, ry, x0, x1) {
    const h = x => ry * Math.sqrt(Math.max(0, 1 - (((x - cx) / rx) ** 2)));
    const a = h(x0), b = h(x1), mid = (x0 + x1) / 2;
    pb.M(x0, cy - a).L(x0, cy + a);
    pb.Q(mid, cy + Math.max(a, b) * 1.02, x1, cy + b).L(x1, cy - b);
    pb.Q(mid, cy - Math.max(a, b) * 1.02, x0, cy - a).Z();
  }
  function rrect(pb, x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    pb.M(x + r, y).L(x + w - r, y).A(r, r, 0, 0, 1, x + w, y + r)
      .L(x + w, y + h - r).A(r, r, 0, 0, 1, x + w - r, y + h)
      .L(x + r, y + h).A(r, r, 0, 0, 1, x, y + h - r)
      .L(x, y + r).A(r, r, 0, 0, 1, x + r, y).Z();
  }
  function quad(pb, a, b, c, d) { pb.M(a[0], a[1]).L(b[0], b[1]).L(c[0], c[1]).L(d[0], d[1]).Z(); }
  function blob(pb, cx, cy, r, bumps, amp, rot = 0) {
    const steps = bumps * 2;
    for (let i = 0; i <= steps; i++) {
      const a = rot + (360 / steps) * i;
      const rr = r + (i % 2 ? amp : -amp * 0.35);
      const x = px(cx, rr, a), y = py(cy, rr, a);
      if (!i) pb.M(x, y);
      else {
        const pa = rot + (360 / steps) * (i - 0.5);
        pb.Q(px(cx, rr * 1.22, pa), py(cy, rr * 1.22, pa), x, y);
      }
    }
    pb.Z();
  }
  /* linha decorativa (não pintável): contorno, antena, raio etc. */
  const line = (d, w = 3) => `<path class="ink" d="${d}" stroke-width="${w}"/>`;
  const dots = (pts, r, cls = 'ink-dot') => pts.map(p => `<circle class="${cls}" cx="${q(p[0])}" cy="${q(p[1])}" r="${r}"/>`).join('');

  global.Art = { VB, q, Pb, rad, px, py, circle, ellipse, dome, ngon, star, wedge, ring, petal, bandH, bandV, rrect, quad, blob, line, dots };
})(window);
