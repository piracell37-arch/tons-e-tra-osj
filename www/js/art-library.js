/* Traço & Tom — acervo de ilustrações originais para colorir por números.
   Cada arte é gerada com geometria paramétrica (art-core.js): sem imagens externas.
   Contrato por desenho: { id, title, pack, level, blurb, palette[], ink(), regions() }
   regions() retorna [{n, d, x, y}] onde n = índice da paleta + 1. */
(function (global) {
  const A = global.Art;
  const { circle, ellipse, dome, ngon, star, wedge, ring, petal, bandH, bandV, rrect, quad, blob, line, dots, px, py } = A;

  const C = {
    neve: '#F8F5EC', creme: '#FFE9B8', ouro: '#E9B949', amarelo: '#FFC93C', laranja: '#FF8A3D',
    vermelho: '#E14A4A', cereja: '#D62F63', rosa: '#F2789F', uva: '#8455C8', lilas: '#C6A6E8',
    azul: '#3E8AD8', ceu: '#9AD8F2', marinho: '#1E4B7A', teal: '#2AA6A0', agua: '#5FBEDA',
    verde: '#5CB46B', folha: '#9BD16B', musgo: '#2E7D53', cacau: '#4A3A2E', madeira: '#C08B52',
    terra: '#8C5A37', cinza: '#9AA5B1', prata: '#D7DDE4', grafite: '#443E4C', coral: '#FF9E8A',
    turquesa: '#57D3C8', violeta: '#B05CC8', areia: '#F3D9A4', sol: '#FFDD55'
  };

  function ctx() {
    const out = [];
    const api = {
      add(n, fn, opt) { const pb = new A.Pb(opt); fn(pb); out.push({ n, d: pb.d(), x: pb.c()[0], y: pb.c()[1] }); return api; },
      pair(n, fn) { return api.add(n, fn).add(n, fn, { mirror: true }); },
      radial(n, count, fn, off = 0) { for (let i = 0; i < count; i++) api.add(n, pb => fn(pb, i, off + (360 / count) * i)); return api; },
      seq(n, items, fn) { items.forEach((it, i) => api.add(n, pb => fn(pb, it, i))); return api; },
      list: out
    };
    return api;
  }

  const ray = (pb, cx, cy, r0, r1, a, half = 5) =>
    pb.M(px(cx, r0, a - half), py(cy, r0, a - half)).L(px(cx, r1, a), py(cy, r1, a)).L(px(cx, r0, a + half), py(cy, r0, a + half)).Z();

  const L = [];
  const def = d => L.push(d);

  /* ============================================================ JARDIM MAGICO */
  def({
    id: 'borboleta', title: 'Borboleta Real', pack: 'jardim', level: 1, blurb: 'Asas simétricas',
    palette: [['rosa', C.rosa], ['lilas', C.lilas], ['laranja', C.laranja], ['creme', C.creme], ['ouro', C.ouro], ['cacau', C.cacau]],
    ink: () => [line('M192 130 C176 106 164 96 148 92 M208 130 C224 106 236 96 252 92', 4),
      dots([[148, 92], [252, 92]], 5), line('M200 268 v40 M200 308 l-12 20 M200 308 l12 20', 3)],
    regions: () => ctx()
      .pair(1, pb => petal(pb, 200, 198, 224, 12, 140, 68))
      .pair(2, pb => petal(pb, 200, 198, 132, 10, 110, 54))
      .pair(3, pb => petal(pb, 200, 198, 228, 60, 106, 30))
      .pair(4, pb => circle(pb, 162, 238, 16))
      .pair(5, pb => circle(pb, 140, 140, 13))
      .add(6, pb => ellipse(pb, 200, 208, 14, 60))
      .add(6, pb => circle(pb, 200, 140, 16))
      .list
  });

  def({
    id: 'girassol', title: 'Grande Girassol', pack: 'jardim', level: 2, blurb: 'Mandala de pétalas',
    palette: [['laranja', C.laranja], ['ouro', C.ouro], ['cacau', C.cacau], ['creme', C.creme], ['terra', C.terra], ['verde', C.verde]],
    ink: () => [line('M200 388 q-24 6 -44 0 M200 388 q24 6 44 0', 3)],
    regions: () => ctx()
      .radial(1, 8, (pb, i, a) => petal(pb, 200, 150, a, 48, 132, 34))
      .radial(2, 8, (pb, i, a) => petal(pb, 200, 150, a + 22.5, 48, 92, 22))
      .add(3, pb => circle(pb, 200, 150, 48))
      .radial(4, 8, (pb, i, a) => circle(pb, px(200, 32, a), py(150, 32, a), 8))
      .add(5, pb => circle(pb, 200, 150, 12))
      .add(6, pb => rrect(pb, 194, 276, 13, 106, 6))
      .pair(6, pb => petal(pb, 200, 336, 158, 8, 78, 24))
      .list
  });

  def({
    id: 'joaninha', title: 'Joaninha da Folha', pack: 'jardim', level: 1, blurb: 'Elite com pintas',
    palette: [['vermelho', C.vermelho], ['grafite', C.grafite], ['neve', C.neve], ['folha', C.folha]],
    ink: () => [line('M200 136 V310', 4),
      line('M178 98 C164 76 154 68 138 64 M222 98 C236 76 246 68 262 64', 3),
      dots([[138, 64], [262, 64]], 5),
      line('M124 246 l-26 18 M120 200 l-30 4 M130 292 l-24 24 M276 246 l26 18 M280 200 l30 4 M270 292 l24 24', 3),
      line('M104 344 q48 -22 96 -6 q48 16 96 -6', 3)],
    regions: () => ctx()
      .add(1, pb => { pb.M(200, 134).A(94, 88, 0, 0, 0, 200, 312).Z(); })
      .add(1, pb => { pb.M(200, 134).A(94, 88, 0, 0, 1, 200, 312).Z(); })
      .add(2, pb => dome(pb, 200, 140, 54, 46))
      .pair(2, pb => circle(pb, 162, 190, 17))
      .pair(2, pb => circle(pb, 144, 248, 14))
      .pair(2, pb => circle(pb, 176, 288, 11))
      .pair(3, pb => circle(pb, 182, 122, 9))
      .pair(4, pb => petal(pb, 200, 322, 200, 6, 56, 18))
      .list
  });

  def({
    id: 'abelha', title: 'Abelha Preocupada', pack: 'jardim', level: 2, blurb: 'Listras do corpo',
    palette: [['amarelo', C.amarelo], ['cacau', C.cacau], ['neve', C.neve], ['ceu', C.ceu], ['cinza', C.cinza], ['creme', C.creme]],
    ink: () => [line('M182 80 C172 58 164 50 148 46 M218 80 C228 58 236 50 252 46', 3),
      dots([[148, 46], [252, 46]], 5),
      line('M168 250 q-18 12 -28 30 M232 250 q18 12 28 30 M176 288 q-14 14 -20 30 M224 288 q14 14 20 30', 3)],
    regions: () => ctx()
      .add(1, pb => bandH(pb, 200, 226, 76, 92, 134, 176))
      .add(2, pb => bandH(pb, 200, 226, 76, 92, 176, 208))
      .add(1, pb => bandH(pb, 200, 226, 76, 92, 208, 240))
      .add(2, pb => bandH(pb, 200, 226, 76, 92, 240, 272))
      .add(1, pb => bandH(pb, 200, 226, 76, 92, 272, 316))
      .add(2, pb => circle(pb, 200, 118, 40))
      .pair(4, pb => petal(pb, 200, 178, 200, 16, 126, 40))
      .pair(3, pb => circle(pb, 182, 112, 12))
      .pair(2, pb => circle(pb, 182, 112, 5))
      .add(5, pb => { pb.M(186, 316).L(214, 316).L(200, 356).Z(); })
      .pair(6, pb => ngon(pb, 76, 92, 34, 6))
      .pair(6, pb => ngon(pb, 62, 192, 26, 6, -30))
      .list
  });

  def({
    id: 'sol', title: 'Sol Radiante', pack: 'jardim', level: 1, blurb: 'Raios alternados',
    palette: [['laranja', C.laranja], ['amarelo', C.amarelo], ['ouro', C.ouro], ['creme', C.creme], ['grafite', C.grafite]],
    ink: () => [line('M172 224 q28 22 56 0', 4), dots([[176, 190], [224, 190]], 5, 'pupil')],
    regions: () => ctx()
      .radial(1, 12, (pb, i, a) => ray(pb, 200, 200, 74, 152, a, 6))
      .radial(2, 12, (pb, i, a) => ray(pb, 200, 200, 74, 124, a + 15, 5))
      .add(3, pb => circle(pb, 200, 200, 70))
      .add(4, pb => ring(pb, 200, 200, 50, 68, -180, 0))
      .add(4, pb => ring(pb, 200, 200, 50, 68, 0, 180))
      .pair(5, pb => circle(pb, 176, 188, 10))
      .list
  });

  def({
    id: 'cogumelo', title: 'Cogumelo Encantado', pack: 'jardim', level: 2, blurb: 'Chapéu bolinhas',
    palette: [['vermelho', C.vermelho], ['neve', C.neve], ['cacau', C.cacau], ['creme', C.creme], ['verde', C.verde], ['folha', C.folha]],
    ink: () => [line('M150 350 q50 -20 100 0', 3), line('M96 378 q104 -22 208 0', 3)],
    regions: () => ctx()
      .add(1, pb => dome(pb, 200, 210, 130, 106))
      .pair(2, pb => circle(pb, 148, 168, 20))
      .add(2, pb => circle(pb, 200, 130, 17))
      .add(2, pb => circle(pb, 250, 174, 15))
      .add(2, pb => circle(pb, 112, 202, 12))
      .add(2, pb => circle(pb, 284, 204, 12))
      .add(3, pb => { pb.M(92, 210).A(108, 22, 0, 0, 0, 308, 210).Z(); })
      .add(4, pb => { pb.M(166, 228).C(162, 302, 152, 326, 146, 350).L(254, 350).C(248, 326, 238, 302, 234, 228).Z(); })
      .add(5, pb => { pb.M(110, 350).Q(200, 322, 290, 350).L(316, 388).L(84, 388).Z(); })
      .pair(6, pb => petal(pb, 200, 356, 166, 20, 96, 20))
      .list
  });

  def({
    id: 'caracol', title: 'Caracol Espiral', pack: 'jardim', level: 3, blurb: 'Concha em anéis',
    palette: [['laranja', C.laranja], ['coral', C.coral], ['creme', C.creme], ['teal', C.teal], ['agua', C.agua], ['grafite', C.grafite], ['verde', C.verde]],
    ink: () => {
      const pts = [];
      for (let t = 0; t <= 6.5; t += 0.22) { const r = 6 + t * 18; pts.push(`${A.q(224 + r * Math.cos(t))} ${A.q(190 + r * Math.sin(t))}`); }
      return [line('M' + pts.join(' L'), 4),
        line('M98 202 C92 184 86 172 80 158 M128 202 C134 184 138 172 144 158', 3),
        dots([[80, 158], [144, 158]], 6), line('M40 386 q110 -18 220 0 q60 10 100 -4', 3)];
    },
    regions: () => ctx()
      .add(1, pb => circle(pb, 224, 186, 132))
      .add(2, pb => circle(pb, 212, 196, 106))
      .add(1, pb => circle(pb, 230, 192, 80))
      .add(3, pb => circle(pb, 212, 198, 54))
      .add(2, pb => circle(pb, 226, 196, 30))
      .add(4, pb => { pb.M(84, 306).Q(74, 262, 122, 262).L(300, 266).Q(350, 272, 342, 306).Q(332, 330, 294, 326).L(120, 326).Q(86, 326, 84, 306).Z(); })
      .add(5, pb => { pb.M(100, 302).C(96, 272, 78, 262, 70, 240).C(62, 214, 84, 196, 110, 200).C(136, 204, 148, 226, 142, 252).C(138, 274, 130, 288, 128, 302).Z(); })
      .add(3, pb => circle(pb, 116, 226, 12))
      .add(6, pb => circle(pb, 120, 226, 5))
      .add(7, pb => { pb.M(60, 352).Q(110, 330, 160, 352).L(150, 372).L(66, 372).Z(); })
      .list
  });

  def({
    id: 'tulipas', title: 'Canteiro de Tulipas', pack: 'jardim', level: 2, blurb: 'Três tulipas',
    palette: [['rosa', C.rosa], ['cereja', C.cereja], ['coral', C.coral], ['vermelho', C.vermelho], ['terra', C.terra], ['verde', C.verde]],
    ink: () => [line('M92 378 q10 -24 26 -34 M318 378 q-10 -26 -28 -36', 3)],
    regions: () => {
      const c = ctx();
      const tulip = (a, b, x, y, s) => {
        const u = v => v * s;
        c.add(a, pb => {
          pb.M(x - u(30), y - u(46)).Q(x - u(33), y + u(4), x, y + u(9)).Q(x + u(33), y + u(4), x + u(30), y - u(46))
            .Q(x + u(15), y - u(26), x, y - u(54)).Q(x - u(15), y - u(26), x - u(30), y - u(46)).Z();
        });
        c.add(b, pb => { pb.M(x - u(13), y - u(42)).Q(x, y - u(6), x + u(13), y - u(42)).Q(x, y - u(66), x - u(13), y - u(42)).Z(); });
        c.add(b, pb => { pb.M(x - u(29), y - u(44)).Q(x - u(25), y + u(2), x - u(4), y + u(8)).Q(x - u(12), y - u(16), x - u(13), y - u(42)).Z(); });
        c.add(b, pb => { pb.M(x + u(29), y - u(44)).Q(x + u(25), y + u(2), x + u(4), y + u(8)).Q(x + u(12), y - u(16), x + u(13), y - u(42)).Z(); });
      };
      tulip(1, 2, 122, 214, 1.02); tulip(3, 1, 200, 182, 1.1); tulip(4, 3, 278, 216, 1.02);
      c.add(5, pb => rrect(pb, 116, 214, 13, 112, 6));
      c.add(5, pb => rrect(pb, 194, 182, 13, 144, 6));
      c.add(5, pb => rrect(pb, 272, 216, 13, 110, 6));
      c.pair(6, pb => petal(pb, 200, 318, 152, 10, 92, 26));
      c.pair(6, pb => petal(pb, 200, 296, 28, 10, 84, 22));
      c.add(6, pb => petal(pb, 122, 330, 146, 8, 72, 20));
      c.add(6, pb => petal(pb, 278, 332, 34, 8, 68, 20));
      c.add(4, pb => { pb.M(46, 372).L(354, 372).L(372, 398).L(28, 398).Z(); });
      return c.list;
    }
  });

  def({
    id: 'fada', title: 'Fada do Jardim', pack: 'jardim', level: 3, blurb: 'Asas e varinha',
    palette: [['lilas', C.lilas], ['uva', C.uva], ['creme', C.creme], ['ouro', C.ouro], ['areia', C.areia], ['verde', C.verde], ['rosa', C.rosa]],
    ink: () => [line('M238 196 L292 148', 5), line('M200 92 q-16 -18 -34 -8 M200 92 q16 -18 34 -8', 3),
      line('M184 366 q16 8 32 0', 3), dots([[148, 80], [252, 80]], 4)],
    regions: () => ctx()
      .pair(1, pb => petal(pb, 200, 172, 214, 10, 118, 42))
      .pair(1, pb => petal(pb, 200, 200, 152, 10, 100, 34))
      .pair(2, pb => petal(pb, 200, 182, 232, 6, 76, 24))
      .pair(5, pb => petal(pb, 200, 186, 152, 12, 64, 12))
      .add(3, pb => { pb.M(200, 146).L(178, 232).C(150, 274, 140, 306, 150, 318).Q(200, 336, 250, 318).C(260, 306, 250, 274, 222, 232).Z(); })
      .pair(5, pb => rrect(pb, 174, 322, 17, 42, 8))
      .pair(4, pb => ellipse(pb, 180, 368, 15, 9))
      .add(5, pb => circle(pb, 200, 112, 34))
      .add(4, pb => { pb.M(166, 122).C(156, 70, 190, 54, 212, 62).C(240, 74, 248, 108, 234, 132).C(216, 100, 186, 102, 166, 122).Z(); })
      .add(6, pb => star(pb, 300, 142, 30, 13, 5))
      .pair(7, pb => star(pb, 96, 340, 18, 8, 4, 20))
      .list
  });

  /* ============================================================== MAR & CEU */
  def({
    id: 'tartaruga', title: 'Tartaruga Marinha', pack: 'mar', level: 3, blurb: 'Casco hexagonal',
    palette: [['folha', C.folha], ['verde', C.verde], ['musgo', C.musgo], ['ouro', C.ouro], ['teal', C.teal], ['agua', C.agua], ['grafite', C.grafite]],
    ink: () => [line('M188 66 q12 -8 24 0', 3),
      dots([[54, 122], [346, 136], [358, 268], [42, 244]], 7, 'bubble')],
    regions: () => ctx()
      /* barbatanas e cauda nascem debaixo do casco */
      .seq(2, [232, 128, 52, 308], (pb, a) => petal(pb, 200, 208, a, 54, 180, 40))
      .add(2, pb => petal(pb, 200, 208, 90, 92, 142, 16))
      .add(2, pb => ellipse(pb, 200, 80, 36, 42))
      .pair(6, pb => circle(pb, 182, 72, 11))
      .pair(7, pb => circle(pb, 184, 72, 5))
      .add(3, pb => ellipse(pb, 200, 208, 124, 102))
      .add(1, pb => ellipse(pb, 200, 208, 100, 80))
      .radial(3, 8, (pb, i, a) => ellipse(pb, px(200, 112, a), py(208, 91, a), 11, 10))
      .add(4, pb => ngon(pb, 200, 208, 32, 6))
      .seq(4, [0, 120, 240], (pb, a) => ellipse(pb, px(200, 64, a), py(208, 54, a), 22, 18))
      .seq(5, [60, 180, 300], (pb, a) => ellipse(pb, px(200, 64, a), py(208, 54, a), 22, 18))
      .list
  });

  def({
    id: 'peixe', title: 'Peixe Tropical', pack: 'mar', level: 2, blurb: 'Faixas e escamas',
    palette: [['amarelo', C.amarelo], ['laranja', C.laranja], ['coral', C.coral], ['vermelho', C.vermelho], ['teal', C.teal], ['neve', C.neve], ['grafite', C.grafite]],
    ink: () => [line('M176 148 q12 62 0 124 M222 146 q12 64 0 128 M266 158 q10 52 0 104', 3),
      line('M96 216 q18 14 40 8', 3), dots([[322, 84], [358, 58], [290, 62]], 6, 'bubble')],
    regions: () => ctx()
      .add(1, pb => bandV(pb, 190, 210, 116, 84, 78, 130))
      .add(2, pb => bandV(pb, 190, 210, 116, 84, 130, 178))
      .add(1, pb => bandV(pb, 190, 210, 116, 84, 178, 226))
      .add(3, pb => bandV(pb, 190, 210, 116, 84, 226, 302))
      .add(4, pb => { pb.M(298, 192).L(362, 130).Q(344, 210, 362, 290).L(298, 228).Z(); })
      .add(5, pb => { pb.M(152, 132).Q(190, 72, 240, 126).L(216, 140).Q(190, 118, 152, 132).Z(); })
      .add(5, pb => { pb.M(164, 288).Q(198, 338, 236, 286).L(212, 276).Q(192, 292, 164, 288).Z(); })
      .add(6, pb => circle(pb, 120, 186, 20))
      .add(7, pb => circle(pb, 120, 186, 9))
      .add(4, pb => { pb.M(110, 238).Q(138, 260, 168, 248).L(158, 270).Q(126, 274, 106, 254).Z(); })
      .list
  });

  def({
    id: 'veleiro', title: 'Veleiro Dourado', pack: 'mar', level: 2, blurb: 'Velas raiadas',
    palette: [['vermelho', C.vermelho], ['neve', C.neve], ['coral', C.coral], ['creme', C.creme], ['terra', C.terra], ['azul', C.azul], ['agua', C.agua], ['ouro', C.ouro]],
    ink: () => [line('M216 74 V292', 5), line('M216 148 H162 M216 182 H146 M216 216 H132 M216 250 H122', 3),
      line('M232 160 q24 44 44 100 M232 200 q16 34 26 66', 3)],
    regions: () => {
      const c = ctx();
      const sailL = y => 216 - (y - 110) / 164 * 94;
      [[110, 150], [150, 190], [190, 232], [232, 274]].forEach((b, i) =>
        c.add(i % 2 ? 2 : 3, pb => { pb.M(216, b[0]).L(sailL(b[0]) + 4, b[0]).L(sailL(b[1]) + 4, b[1]).L(216, b[1]).Z(); }));
      const sailR = y => 228 + (y - 130) / 144 * 68;
      [[130, 178], [178, 226], [226, 274]].forEach((b, i) =>
        c.add(i % 2 ? 4 : 2, pb => { pb.M(228, b[0]).L(sailR(b[0]), b[0]).L(sailR(b[1]), b[1]).L(228, b[1]).Z(); }));
      c.add(1, pb => { pb.M(76, 292).L(324, 292).L(288, 344).L(116, 344).Z(); });
      c.add(5, pb => { pb.M(76, 292).L(324, 292).L(320, 308).L(80, 308).Z(); });
      c.add(7, pb => { pb.M(216, 74).L(216, 100).L(172, 90).Z(); });
      c.add(6, pb => { pb.M(40, 356).Q(88, 336, 136, 356).Q(184, 376, 232, 356).Q(280, 336, 328, 356).L(368, 396).L(32, 396).Z(); });
      c.add(7, pb => { pb.M(34, 374).Q(84, 354, 134, 374).Q(184, 394, 234, 374).L(230, 396).L(38, 396).Z(); });
      c.add(8, pb => circle(pb, 348, 82, 28));
      return c.list;
    }
  });

  def({
    id: 'farol', title: 'Farol da Baía', pack: 'mar', level: 2, blurb: 'Torre listrada',
    palette: [['vermelho', C.vermelho], ['neve', C.neve], ['grafite', C.grafite], ['marinho', C.marinho], ['amarelo', C.amarelo], ['azul', C.azul], ['agua', C.agua], ['ouro', C.ouro]],
    ink: () => [line('M162 150 H238 M150 210 H250 M140 262 H260 M132 310 H268', 3),
      line('M200 72 V54 M186 122 H214', 3), dots([[200, 46]], 6)],
    regions: () => ctx()
      .add(1, pb => { pb.M(168, 152).L(232, 152).L(242, 210).L(158, 210).Z(); })
      .add(2, pb => { pb.M(158, 210).L(242, 210).L(252, 262).L(148, 262).Z(); })
      .add(1, pb => { pb.M(148, 262).L(252, 262).L(262, 310).L(138, 310).Z(); })
      .add(2, pb => { pb.M(138, 310).L(262, 310).L(274, 346).L(126, 346).Z(); })
      .add(3, pb => rrect(pb, 156, 108, 88, 44, 8))
      .add(4, pb => dome(pb, 200, 108, 48, 36))
      .add(5, pb => { pb.M(150, 128).L(84, 92).L(84, 166).Z(); })
      .add(5, pb => { pb.M(250, 128).L(316, 92).L(316, 166).Z(); })
      .add(6, pb => { pb.M(86, 346).L(314, 346).L(346, 392).L(54, 392).Z(); })
      .add(7, pb => { pb.M(60, 372).Q(112, 352, 164, 372).Q(216, 392, 268, 372).Q(312, 354, 352, 372).L(352, 396).L(52, 396).Z(); })
      .add(8, pb => circle(pb, 344, 60, 22))
      .add(3, pb => rrect(pb, 182, 292, 36, 54, 6))
      .list
  });

  def({
    id: 'medusa', title: 'Medusa Dançarina', pack: 'mar', level: 3, blurb: 'Cúpula radial',
    palette: [['violeta', C.violeta], ['lilas', C.lilas], ['rosa', C.rosa], ['turquesa', C.turquesa], ['agua', C.agua], ['neve', C.neve]],
    ink: () => [line('M120 178 q18 -16 36 0 M244 178 q18 -16 36 0', 3),
      dots([[88, 318], [316, 336], [200, 388], [60, 210]], 5, 'bubble')],
    regions: () => ctx()
      .seq(1, [0, 2, 4], (pb, i) => wedge(pb, 200, 178, 112, 180 + i * 36, 216 + i * 36))
      .seq(2, [1, 3], (pb, i) => wedge(pb, 200, 178, 112, 180 + i * 36, 216 + i * 36))
      .add(3, pb => { pb.M(88, 178).Q(112, 214, 142, 180).Q(170, 214, 200, 180).Q(230, 214, 258, 180).Q(288, 214, 312, 178).L(312, 194).Q(288, 230, 258, 196).Q(230, 230, 200, 196).Q(170, 230, 142, 196).Q(112, 228, 88, 194).Z(); })
      .seq(4, [0, 2, 4], (pb, t) => { const x = 122 + t * 44; pb.M(x - 10, 208).C(x - 30, 264, x + 20, 302, x - 8, 366).L(x + 12, 366).C(x + 32, 302, x - 8, 262, x + 12, 208).Z(); })
      .seq(5, [1, 3], (pb, t) => { const x = 122 + t * 44; pb.M(x - 10, 208).C(x - 30, 264, x + 20, 302, x - 8, 366).L(x + 12, 366).C(x + 32, 302, x - 8, 262, x + 12, 208).Z(); })
      .pair(6, pb => circle(pb, 176, 148, 13))
      .list
  });

  def({
    id: 'arcoiris', title: 'Arco-Iris Encantado', pack: 'mar', level: 2, blurb: 'Seis faixas',
    palette: [['vermelho', C.vermelho], ['laranja', C.laranja], ['amarelo', C.amarelo], ['verde', C.verde], ['azul', C.azul], ['uva', C.uva], ['neve', C.neve], ['ouro', C.ouro]],
    ink: () => [line('M150 348 q30 -16 60 0 q30 16 60 0', 3), line('M330 66 l-8 14 -8 -14', 3)],
    regions: () => ctx()
      .add(1, pb => ring(pb, 200, 344, 168, 196, 180, 360))
      .add(2, pb => ring(pb, 200, 344, 140, 166, 180, 360))
      .add(3, pb => ring(pb, 200, 344, 112, 138, 180, 360))
      .add(4, pb => ring(pb, 200, 344, 84, 110, 180, 360))
      .add(5, pb => ring(pb, 200, 344, 56, 82, 180, 360))
      .add(6, pb => dome(pb, 200, 344, 54, 52))
      .pair(7, pb => blob(pb, 104, 330, 46, 4, 14))
      .pair(3, pb => { pb.M(152, 206).C(164, 232, 158, 252, 144, 252).C(130, 252, 124, 232, 136, 206).Q(144, 192, 152, 206).Z(); })
      .add(8, pb => circle(pb, 330, 100, 27))
      .radial(8, 8, (pb, i, a) => ray(pb, 330, 100, 33, 52, a, 5))
      .list
  });

  def({
    id: 'sereia', title: 'Cauda de Sereia', pack: 'mar', level: 3, blurb: 'Barbatanas e pérolas',
    palette: [['rosa', C.rosa], ['coral', C.coral], ['lilas', C.lilas], ['uva', C.uva], ['ouro', C.ouro], ['agua', C.agua], ['creme', C.creme]],
    ink: () => [line('M196 132 q-8 26 0 52 M204 200 q8 30 0 58', 2),
      dots([[324, 116], [70, 226], [342, 262]], 6, 'bubble')],
    regions: () => {
      const c = ctx();
      const scales = () => {
        [[150, 176, 232, 3], [200, 163, 245, 3], [252, 158, 250, 4], [300, 156, 252, 4]].forEach((r, k) => {
          const n = k % 2 ? 3 : 2, w = (r[2] - r[1]) / r[3];
          for (let i = 0; i < r[3]; i++) {
            const a = r[1] + i * w, b = a + w;
            c.add(n, pb => { pb.M(a, r[0]).Q((a + b) / 2, r[0] + 30, b, r[0]).Q((a + b) / 2, r[0] - 6, a, r[0]).Z(); });
          }
        });
      };
      /* barbatanas no alto: a cauda mergulha na água */
      c.add(4, pb => { pb.M(202, 122).C(172, 98, 138, 84, 104, 92).C(128, 118, 162, 132, 194, 134).Z(); })
        .add(4, pb => { pb.M(206, 122).C(236, 98, 270, 84, 304, 92).C(280, 118, 246, 132, 214, 134).Z(); })
        .add(7, pb => { pb.M(190, 128).H(218).L(204, 152).Z(); })
        .add(1, pb => { pb.M(182, 132).C(156, 196, 148, 274, 156, 352).L(252, 352).C(260, 274, 250, 196, 226, 132).Z(); });
      scales();
      return c
        .seq(5, [168, 204, 240], (pb, x) => circle(pb, x, 316, 11))
        .add(6, pb => { pb.M(28, 338).Q(88, 318, 148, 338).Q(208, 358, 268, 338).Q(320, 320, 372, 338).L(372, 396).L(28, 396).Z(); })
        .add(5, pb => { pb.M(28, 366).Q(88, 346, 148, 366).Q(208, 386, 268, 366).Q(320, 348, 372, 366).L(372, 396).L(28, 396).Z(); })
        .list;
    }
  });

  /* ====================================================== REINO DA FANTASIA */
  def({
    id: 'castelo', title: 'Castelo dos Sonhos', pack: 'fantasia', level: 2, blurb: 'Torres e bandeiras',
    palette: [['prata', C.prata], ['marinho', C.marinho], ['ceu', C.ceu], ['areia', C.areia], ['teal', C.teal], ['madeira', C.madeira], ['ouro', C.ouro], ['vermelho', C.vermelho]],
    ink: () => [line('M88 118 V76 M312 118 V76 M200 116 V52', 4), line('M40 332 H360', 3),
      line('M200 330 q-14 -20 0 -38 q14 18 0 38', 3)],
    regions: () => ctx()
      .pair(1, pb => { pb.M(60, 330).V(160).L(88, 118).L(116, 160).V(330).Z(); })
      .pair(2, pb => { pb.M(60, 160).L(88, 118).L(116, 160).L(88, 176).Z(); })
      .pair(3, pb => rrect(pb, 68, 200, 36, 40, 8))
      .add(4, pb => { pb.M(134, 330).V(180).L(200, 116).L(266, 180).V(330).Z(); })
      .add(5, pb => { pb.M(134, 180).L(200, 116).L(266, 180).L(200, 198).Z(); })
      .add(6, pb => { pb.M(176, 330).V(258).Q(200, 232, 224, 258).V(330).Z(); })
      .add(4, pb => { pb.M(170, 208).Q(200, 182, 230, 208).L(230, 234).L(170, 234).Z(); })
      .pair(8, pb => { pb.M(88, 116).L(88, 82).L(128, 96).L(88, 106).Z(); })
      .add(8, pb => { pb.M(200, 114).L(200, 60).L(248, 80).L(200, 94).Z(); })
      .add(1, pb => { pb.M(28, 330).H(372).V(372).H(28).Z(); })
      .seq(7, [40, 120, 300, 356], (pb, x, i) => star(pb, x, 66 + (i % 2) * 24, 17, 7, 4))
      .list
  });

  def({
    id: 'lampada', title: 'Lampada Magica', pack: 'fantasia', level: 3, blurb: 'Fumaça e ouro',
    palette: [['ouro', C.ouro], ['areia', C.areia], ['lilas', C.lilas], ['creme', C.creme], ['marinho', C.marinho], ['turquesa', C.turquesa], ['vermelho', C.vermelho]],
    ink: () => [line('M40 196 C58 176 76 172 96 178', 3), line('M154 214 H246', 2),
      line('M170 250 q30 12 60 0', 2)],
    regions: () => ctx()
      /* fumaca magica saindo do bico */
      .add(3, pb => circle(pb, 66, 164, 22))
      .add(3, pb => circle(pb, 104, 124, 18))
      .add(3, pb => circle(pb, 142, 90, 14))
      .add(7, pb => star(pb, 176, 58, 18, 8, 5, 12))
      .pair(4, pb => star(pb, 340, 84, 20, 9, 4, 10))
      /* alas, bico e base atras do corpo */
      .add(2, pb => { pb.M(296, 212).C(348, 206, 372, 244, 344, 278).C(332, 292, 314, 298, 300, 294).L(302, 276).C(320, 280, 332, 270, 336, 254).C(342, 230, 322, 218, 300, 226).Z(); })
      .add(2, pb => { pb.M(104, 226).L(40, 194).Q(30, 192, 34, 204).L(58, 232).Q(80, 248, 110, 250).Z(); })
      .add(5, pb => { pb.M(150, 292).L(250, 292).L(266, 318).L(134, 318).Z(); })
      /* corpo e barriga */
      .add(1, pb => ellipse(pb, 200, 246, 104, 54))
      .add(2, pb => bandH(pb, 200, 246, 104, 54, 258, 298))
      .add(6, pb => circle(pb, 168, 234, 12))
      .add(6, pb => circle(pb, 232, 234, 12))
      .add(7, pb => circle(pb, 200, 232, 15))
      /* gargalo, tampa e macaco */
      .add(2, pb => rrect(pb, 162, 182, 76, 22, 8))
      .add(1, pb => dome(pb, 200, 182, 48, 22))
      .add(4, pb => circle(pb, 200, 152, 11))
      .list
  });

  def({
    id: 'palacio', title: 'Palacio de Gelo', pack: 'fantasia', level: 3, blurb: 'Cristais de inverno',
    palette: [['prata', C.prata], ['ceu', C.ceu], ['azul', C.azul], ['turquesa', C.turquesa], ['marinho', C.marinho], ['lilas', C.lilas]],
    ink: () => [line('M200 74 V44 M100 152 V124 M300 152 V124', 3), line('M146 300 H182 M220 244 H256', 2)],
    regions: () => ctx()
      /* torre central com facheta de gelo */
      .add(1, pb => { pb.M(154, 330).V(150).L(200, 74).L(246, 150).V(330).Z(); })
      .add(5, pb => { pb.M(154, 150).L(200, 74).L(246, 150).L(200, 174).Z(); })
      .add(2, pb => { pb.M(200, 74).L(246, 150).L(200, 174).Z(); })
      .add(3, pb => rrect(pb, 180, 196, 40, 44, 8))
      .add(4, pb => { pb.M(176, 330).V(286).Q(200, 256, 224, 286).V(330).Z(); })
      /* torres laterais */
      .pair(1, pb => { pb.M(66, 330).V(206).L(100, 152).L(134, 206).V(330).Z(); })
      .pair(5, pb => { pb.M(66, 206).L(100, 152).L(134, 206).L(100, 224).Z(); })
      .pair(2, pb => { pb.M(100, 152).L(134, 206).L(100, 224).Z(); })
      .pair(3, pb => rrect(pb, 84, 248, 32, 36, 7))
      .add(4, pb => { pb.M(28, 330).H(372).V(372).H(28).Z(); })
      .seq(6, [70, 200, 330], (pb, x, i) => star(pb, x, 44 + (i === 1 ? -14 : 18), 20, 8, 6, -10))
      .list
  });

  def({
    id: 'unicornio', title: 'Unicornio Magico', pack: 'fantasia', level: 3, blurb: 'Crina e estrelas',
    palette: [['neve', C.neve], ['prata', C.prata], ['ouro', C.ouro], ['lilas', C.lilas], ['violeta', C.violeta], ['grafite', C.grafite], ['rosa', C.rosa]],
    ink: () => [line('M162 108 L152 60 M176 116 L168 66 M190 122 L184 72', 3),
      line('M92 236 q14 14 34 12', 3), line('M224 92 q10 18 8 34', 3)],
    regions: () => ctx()
      /* crina caindo atrás do pescoço */
      .seq(5, [[262, 156, -20, 118], [278, 208, 8, 104], [288, 262, 34, 100], [292, 312, 62, 84]], (pb, p) => petal(pb, p[0], p[1], p[2], 8, p[3], 30))
      .seq(4, [[272, 186, 2, 104], [286, 240, 30, 96]], (pb, p) => petal(pb, p[0], p[1], p[2], 8, p[3], 24))
      /* chifre e orelha nascem atrás da cabeça */
      .add(3, pb => { pb.M(168, 138).L(140, 34).L(210, 126).Z(); })
      .add(4, pb => { pb.M(212, 124).L(232, 62).L(260, 122).Z(); })
      .add(1, pb => quad(pb, [236, 152], [306, 170], [322, 340], [234, 340]))
      .add(1, pb => ellipse(pb, 190, 192, 76, 64))
      .add(2, pb => ellipse(pb, 122, 228, 48, 42))
      .add(7, pb => circle(pb, 96, 224, 8))
      .add(6, pb => circle(pb, 198, 178, 15))
      .add(2, pb => circle(pb, 203, 173, 6))
      .seq(4, [[74, 108], [338, 96], [352, 250]], (pb, p) => star(pb, p[0], p[1], 22, 10, 5, -14))
      .list
  });

  def({
    id: 'dragao', title: 'Dragaozinho Amigo', pack: 'fantasia', level: 3, blurb: 'Asas e escamas',
    palette: [['musgo', C.musgo], ['verde', C.verde], ['folha', C.folha], ['neve', C.neve], ['grafite', C.grafite], ['amarelo', C.amarelo], ['laranja', C.laranja], ['coral', C.coral]],
    ink: () => [line('M222 190 C198 156 168 124 122 102 M206 164 C188 136 164 112 138 96', 3),
      line('M358 148 q14 8 18 24', 3), line('M300 108 q14 -8 30 -4', 2)],
    regions: () => ctx()
      /* asas de morcego atras do corpo, uma sobre a outra */
      .add(8, pb => { pb.M(214, 196).C(180, 148, 128, 108, 96, 72).C(120, 116, 138, 152, 150, 190).Q(182, 184, 214, 196).Z(); })
      .add(7, pb => { pb.M(232, 210).C(206, 158, 152, 116, 110, 96).C(142, 140, 164, 176, 176, 212).C(196, 204, 216, 204, 232, 210).Z(); })
      /* espinhos da espinha */
      .seq(6, [[136, 214], [174, 196], [214, 186], [252, 192]], (pb, p) => {
        pb.M(p[0] - 17, p[1] + 6).L(p[0] + 2, p[1] - 32).L(p[0] + 18, p[1] + 8).Z();
      })
      /* cauda com ponta em seta */
      .add(1, pb => { pb.M(126, 268).C(88, 288, 58, 318, 46, 356).C(78, 344, 106, 322, 132, 300).Z(); })
      .add(6, pb => { pb.M(46, 356).L(82, 344).L(64, 382).Z(); })
      /* pernas traseiras e dianteiras */
      .add(1, pb => { pb.M(142, 296).C(154, 320, 158, 344, 152, 364).L(190, 364).C(192, 336, 186, 314, 176, 296).Z(); })
      .add(1, pb => { pb.M(216, 292).C(230, 318, 234, 342, 228, 364).L(266, 364).C(268, 336, 262, 312, 250, 292).Z(); })
      .add(3, pb => { pb.M(144, 360).L(196, 360).L(206, 382).L(140, 382).Z(); })
      .add(3, pb => { pb.M(220, 360).L(272, 360).L(282, 382).L(216, 382).Z(); })
      /* corpo */
      .add(1, pb => ellipse(pb, 200, 252, 96, 70))
      .add(2, pb => bandH(pb, 200, 252, 96, 70, 268, 320))
      .seq(3, [[150, 244], [192, 234], [234, 244]], (pb, p) => dome(pb, p[0], p[1], 18, 14, false))
      /* pescoco ate a cabeca */
      .add(1, pb => { pb.M(256, 220).C(272, 190, 288, 168, 306, 152).L(340, 172).C(320, 192, 304, 216, 292, 244).Z(); })
      /* cabeca com focinho */
      .add(1, pb => { pb.M(296, 122).C(300, 90, 330, 74, 356, 86).C(380, 98, 386, 126, 372, 146).L(342, 164).C(318, 162, 300, 146, 296, 122).Z(); })
      .add(3, pb => { pb.M(368, 120).C(392, 124, 398, 142, 386, 154).C(376, 162, 360, 158, 352, 150).Z(); })
      .add(4, pb => { pb.M(356, 156).C(372, 164, 386, 158, 390, 148).C(384, 166, 366, 172, 352, 164).Z(); })
      .add(4, pb => circle(pb, 344, 112, 17))
      .add(5, pb => circle(pb, 349, 112, 7))
      .add(5, pb => circle(pb, 382, 134, 5))
      /* chifres */
      .add(6, pb => { pb.M(328, 86).L(342, 44).L(356, 82).Z(); })
      .add(6, pb => { pb.M(302, 96).L(306, 54).L(326, 90).Z(); })
      /* fogo do focinho */
      .add(7, pb => { pb.M(384, 168).C(396, 182, 392, 198, 378, 204).C(388, 190, 384, 178, 372, 172).Z(); })
      .add(6, pb => { pb.M(380, 176).C(388, 186, 386, 196, 376, 200).C(384, 190, 380, 182, 370, 178).Z(); })
      .list
  });

  def({
    id: 'navio', title: 'Navio Pirata', pack: 'fantasia', level: 3, blurb: 'Tres velas',
    palette: [['terra', C.terra], ['cacau', C.cacau], ['neve', C.neve], ['creme', C.creme], ['grafite', C.grafite], ['ouro', C.ouro], ['azul', C.azul], ['agua', C.agua]],
    ink: () => [line('M150 98 V292 M250 58 V292', 5),
      line('M110 104 H190 M102 190 H198 M200 70 H300 M190 164 H310', 5),
      line('M96 292 L128 340 M304 292 L272 340', 3),
      line('M150 104 L96 176 M250 70 L312 168', 2)],
    regions: () => {
      const c = ctx();
      /* velas quadradas presas na verga: topo reto, bordas bojudas e vala pendurada */
      const sail = (x, y0, y1, w, n) => c.add(n, pb => {
        const b = w / 2, h = y1 - y0;
        pb.M(x - b, y0).L(x + b, y0)
          .C(x + b * 1.18, y0 + h * 0.32, x + b * 1.14, y1 - h * 0.18, x + b * 0.92, y1)
          .Q(x, y1 + h * 0.3, x - b * 0.92, y1)
          .C(x - b * 1.14, y1 - h * 0.18, x - b * 1.18, y0 + h * 0.32, x - b, y0).Z();
      });
      sail(250, 70, 140, 86, 3);
      sail(250, 164, 248, 104, 4);
      sail(150, 104, 168, 66, 4);
      sail(150, 190, 250, 82, 3);
      return c
        .add(1, pb => { pb.M(64, 292).H(336).L(304, 344).H(96).Z(); })
        .add(2, pb => { pb.M(64, 292).H(336).L(330, 310).H(70).Z(); })
        .seq(6, [128, 200, 272], (pb, x) => circle(pb, x, 326, 11))
        .add(5, pb => { pb.M(250, 56).L(250, 84).L(306, 72).Z(); })
        .add(7, pb => { pb.M(36, 348).Q(88, 328, 140, 348).Q(192, 368, 244, 348).Q(296, 328, 348, 348).L(372, 396).L(28, 396).Z(); })
        .add(8, pb => { pb.M(40, 374).Q(92, 356, 144, 374).Q(196, 392, 248, 374).L(244, 396).L(44, 396).Z(); })
        .list;
    }
  });

  def({
    id: 'coroa', title: 'Coroa da Rainha', pack: 'fantasia', level: 2, blurb: 'Joias e arcos',
    palette: [['ouro', C.ouro], ['amarelo', C.amarelo], ['cereja', C.cereja], ['azul', C.azul], ['neve', C.neve], ['verde', C.verde]],
    ink: () => [line('M96 300 H304', 4), line('M120 254 q80 -28 160 0', 3)],
    regions: () => ctx()
      .add(1, pb => { pb.M(96, 300).L(112, 176).L(164, 226).L(200, 132).L(236, 226).L(288, 176).L(304, 300).Z(); })
      .add(2, pb => { pb.M(108, 320).H(292).L(288, 348).H(112).Z(); })
      .add(3, pb => circle(pb, 200, 236, 26))
      .add(4, pb => circle(pb, 142, 262, 18))
      .add(5, pb => circle(pb, 258, 262, 18))
      .add(3, pb => circle(pb, 200, 122, 16))
      .add(4, pb => circle(pb, 112, 168, 14))
      .add(5, pb => circle(pb, 288, 168, 14))
      .add(6, pb => { pb.M(158, 320).L(242, 320).L(238, 348).L(162, 348).Z(); })
      .seq(5, [124, 162, 200, 238, 276], (pb, x, i) => star(pb, x, 292, 12, 5, 4, -12))
      .list
  });

  /* ====================================================== DOCES & AVENTURA */
  def({
    id: 'cupcake', title: 'Cupcake de Morango', pack: 'doces', level: 2, blurb: 'Cobertura em camadas',
    palette: [['areia', C.areia], ['vermelho', C.vermelho], ['creme', C.creme], ['rosa', C.rosa], ['cereja', C.cereja], ['verde', C.verde], ['amarelo', C.amarelo]],
    ink: () => [line('M150 236 L146 358 M200 236 V358 M250 236 L254 358', 2), line('M200 98 q-8 -20 6 -30', 3)],
    regions: () => ctx()
      .add(1, pb => { pb.M(118, 236).L(282, 236).L(256, 358).L(144, 358).Z(); })
      .seq(2, [0, 2, 4], (pb, i) => { const t = i / 5; pb.M(118 + 164 * t, 236).L(118 + 164 * (t + .15), 236).L(144 + 112 * (t + .15), 358).L(144 + 112 * t, 358).Z(); })
      .seq(3, [1, 3], (pb, i) => { const t = i / 5; pb.M(118 + 164 * t, 236).L(118 + 164 * (t + .15), 236).L(144 + 112 * (t + .15), 358).L(144 + 112 * t, 358).Z(); })
      .add(4, pb => dome(pb, 200, 236, 92, 44))
      .add(4, pb => dome(pb, 200, 198, 72, 40))
      .add(5, pb => dome(pb, 200, 164, 52, 36))
      .add(5, pb => circle(pb, 200, 122, 26))
      .add(6, pb => petal(pb, 200, 96, 300, 4, 32, 13))
      .seq(7, [[158, 212], [236, 216], [176, 178], [222, 182], [196, 152]], (pb, p) => rrect(pb, p[0], p[1], 22, 9, 4))
      .list
  });

  def({
    id: 'sorvete', title: 'Casquinha de Sorvete', pack: 'doces', level: 2, blurb: 'Tres bolas',
    palette: [['madeira', C.madeira], ['areia', C.areia], ['rosa', C.rosa], ['lilas', C.lilas], ['cereja', C.cereja], ['verde', C.verde], ['vermelho', C.vermelho]],
    ink: () => [line('M158 244 L242 300 M242 244 L158 300 M150 272 L250 272', 2)],
    regions: () => ctx()
      .add(1, pb => { pb.M(138, 224).L(262, 224).L(200, 372).Z(); })
      .add(2, pb => { pb.M(160, 272).L(240, 272).L(224, 224).L(176, 224).Z(); })
      .add(3, pb => circle(pb, 200, 190, 66))
      .add(4, pb => circle(pb, 146, 154, 44))
      .add(4, pb => circle(pb, 254, 152, 42))
      .add(5, pb => circle(pb, 200, 110, 30))
      .pair(6, pb => petal(pb, 200, 82, 236, 6, 42, 14))
      .seq(7, [[150, 130], [236, 126], [196, 156], [162, 188], [238, 180], [200, 202]], (pb, p) => ellipse(pb, p[0], p[1], 10, 6))
      .list
  });

  def({
    id: 'balao', title: 'Balao de Ar Quente', pack: 'doces', level: 3, blurb: 'Gomos radiais',
    palette: [['vermelho', C.vermelho], ['creme', C.creme], ['ouro', C.ouro], ['laranja', C.laranja], ['terra', C.terra], ['madeira', C.madeira], ['cacau', C.cacau]],
    ink: () => [line('M150 292 L172 330 M250 292 L228 330 M200 300 V330', 3),
      line('M118 176 q80 30 164 0 M124 130 q74 26 152 0 M132 224 q68 24 136 0', 2)],
    regions: () => ctx()
      .seq(1, [0, 2, 4], (pb, i) => bandV(pb, 200, 176, 106, 130, 94 + i * (212 / 6), 94 + (i + 1) * (212 / 6)))
      .seq(2, [1, 3, 5], (pb, i) => bandV(pb, 200, 176, 106, 130, 94 + i * (212 / 6), 94 + (i + 1) * (212 / 6)))
      .add(3, pb => dome(pb, 200, 72, 58, 34))
      .add(4, pb => { pb.M(142, 292).Q(200, 312, 258, 292).L(254, 306).Q(200, 326, 146, 306).Z(); })
      .add(5, pb => rrect(pb, 162, 330, 76, 56, 8))
      .add(6, pb => { pb.M(162, 344).H(238).V(358).H(162).Z(); })
      .pair(7, pb => { pb.M(172, 300).L(166, 330).L(178, 330).L(184, 302).Z(); })
      .list
  });

  def({
    id: 'robo', title: 'Robo Amigo', pack: 'doces', level: 3, blurb: 'Painéis e botões',
    palette: [['prata', C.prata], ['marinho', C.marinho], ['azul', C.azul], ['grafite', C.grafite], ['ouro', C.ouro], ['vermelho', C.vermelho], ['turquesa', C.turquesa]],
    ink: () => [line('M200 106 V84 M128 148 H104 M272 148 H296', 3), dots([[200, 30]], 6),
      line('M150 262 H250 M150 288 H250', 2)],
    regions: () => ctx()
      .add(1, pb => rrect(pb, 126, 106, 148, 116, 22))
      .add(2, pb => rrect(pb, 148, 128, 104, 54, 14))
      .pair(3, pb => circle(pb, 172, 155, 17))
      .pair(4, pb => circle(pb, 172, 155, 7))
      .add(5, pb => rrect(pb, 174, 196, 52, 16, 8))
      .add(1, pb => rrect(pb, 108, 238, 184, 108, 18))
      .add(2, pb => rrect(pb, 136, 258, 128, 46, 10))
      .seq(6, [158, 200, 242], (pb, x) => circle(pb, x, 324, 12))
      .pair(1, pb => rrect(pb, 66, 250, 42, 78, 12))
      .pair(7, pb => circle(pb, 84, 342, 20))
      .add(5, pb => rrect(pb, 186, 60, 28, 48, 8))
      .add(7, pb => circle(pb, 200, 46, 18))
      .pair(3, pb => rrect(pb, 144, 352, 46, 24, 8))
      .list
  });

  def({
    id: 'foguete', title: 'Foguete Espacial', pack: 'doces', level: 2, blurb: 'Capsula e chama',
    palette: [['prata', C.prata], ['vermelho', C.vermelho], ['marinho', C.marinho], ['ceu', C.ceu], ['laranja', C.laranja], ['ouro', C.ouro], ['amarelo', C.amarelo]],
    ink: () => [line('M112 322 l8 -14 l8 14 l14 6 l-14 6 l-8 14 l-8 -14 l-14 -6 Z M296 336 l6 -11 l6 11 l11 4 l-11 4 l-6 11 l-6 -11 l-11 -4 Z', 2),
      line('M166 190 H234 M164 226 H236', 2)],
    regions: () => ctx()
      .add(1, pb => { pb.M(200, 36).C(150, 90, 152, 178, 162, 248).L(238, 248).C(248, 178, 250, 90, 200, 36).Z(); })
      .add(2, pb => { pb.M(200, 36).C(176, 68, 168, 104, 168, 128).L(232, 128).C(232, 104, 224, 68, 200, 36).Z(); })
      .add(3, pb => circle(pb, 200, 172, 36))
      .add(4, pb => circle(pb, 200, 172, 24))
      .pair(5, pb => { pb.M(162, 212).L(100, 268).L(158, 260).Z(); })
      .add(6, pb => rrect(pb, 158, 248, 84, 26, 6))
      .add(5, pb => { pb.M(172, 274).L(200, 342).L(228, 274).Z(); })
      .add(7, pb => { pb.M(184, 274).L(200, 314).L(216, 274).Z(); })
      .pair(2, pb => star(pb, 90, 96, 17, 8, 4, 14))
      .add(3, pb => circle(pb, 322, 124, 24))
      .add(4, pb => circle(pb, 322, 124, 12))
      .list
  });

  def({
    id: 'dinosaurio', title: 'Dinosaurio Amavel', pack: 'doces', level: 2, blurb: 'Crista de espinhos',
    palette: [['verde', C.verde], ['folha', C.folha], ['neve', C.neve], ['grafite', C.grafite], ['musgo', C.musgo], ['ouro', C.ouro], ['laranja', C.laranja]],
    ink: () => [line('M318 142 q-16 10 -34 6', 3), line('M334 122 q10 -2 12 -10', 3),
      line('M40 384 q130 20 320 -8', 3), dots([[300, 96]], 3)],
    regions: () => ctx()
      /* pernas e pés nascem atrás do corpo */
      .add(6, pb => { pb.M(118, 288).C(108, 328, 106, 356, 110, 372).L(154, 372).C(154, 348, 154, 320, 160, 292).Z(); })
      .add(6, pb => { pb.M(206, 296).C(202, 334, 204, 356, 208, 372).L(252, 372).C(250, 350, 244, 324, 240, 292).Z(); })
      .seq(5, [104, 200], (pb, x) => rrect(pb, x, 364, 62, 24, 11))
      /* crista de espinhos ao longo do dorso */
      .seq(7, [[130, 182], [166, 168], [202, 146], [234, 116]], (pb, p) => { pb.M(p[0] - 17, p[1] + 6).L(p[0], p[1] - 42).L(p[0] + 17, p[1] + 6).Z(); })
      .add(1, pb => {
        pb.M(44, 252).C(76, 196, 128, 168, 182, 168)
          .C(204, 132, 232, 100, 262, 88).C(296, 74, 332, 92, 332, 124)
          .C(332, 152, 306, 166, 280, 162).C(262, 186, 250, 214, 244, 240)
          .C(238, 276, 232, 302, 228, 320).C(172, 330, 108, 306, 44, 252).Z();
      })
      .add(2, pb => { pb.M(108, 296).C(148, 318, 192, 324, 224, 316).C(228, 294, 232, 268, 240, 242).C(198, 266, 152, 280, 108, 296).Z(); })
      .add(3, pb => circle(pb, 298, 114, 16))
      .add(4, pb => circle(pb, 302, 114, 7))
      .add(5, pb => { pb.M(44, 252).L(14, 236).L(46, 224).Z(); })
      .list
  });

  def({
    id: 'gato', title: 'Gatinho Fofinho', pack: 'doces', level: 3, blurb: 'Bigodes e rabo',
    palette: [['areia', C.areia], ['rosa', C.rosa], ['verde', C.verde], ['grafite', C.grafite], ['creme', C.creme], ['coral', C.coral], ['madeira', C.madeira]],
    ink: () => [line('M118 236 H58 M120 258 H62 M282 236 H342 M280 258 H338', 3),
      line('M152 300 q48 16 96 0', 3), line('M170 372 v14 M200 376 v12 M230 372 v14', 3)],
    regions: () => ctx()
      /* rabo listrado por trás do corpo */
      .add(6, pb => { pb.M(262, 344).C(326, 350, 356, 316, 344, 274).C(338, 252, 314, 250, 308, 268).C(318, 300, 302, 328, 254, 330).Z(); })
      .add(2, pb => { pb.M(308, 268).C(314, 250, 338, 252, 344, 274).C(348, 288, 344, 300, 334, 308).C(322, 300, 312, 286, 308, 268).Z(); })
      .add(1, pb => { pb.M(142, 288).C(118, 330, 114, 366, 124, 390).L(278, 390).C(288, 362, 282, 320, 260, 288).Q(200, 312, 142, 288).Z(); })
      .add(5, pb => ellipse(pb, 200, 348, 40, 44))
      .pair(7, pb => rrect(pb, 148, 358, 46, 32, 14))
      .add(1, pb => { pb.M(116, 152).L(108, 84).L(162, 118).Q(200, 104, 238, 118).L(292, 84).L(284, 152).C(312, 190, 298, 250, 260, 272).C(224, 292, 176, 292, 140, 272).C(102, 250, 88, 190, 116, 152).Z(); })
      .pair(2, pb => { pb.M(108, 84).L(162, 118).L(128, 148).Z(); })
      .pair(4, pb => { pb.M(118, 100).L(152, 122).L(132, 142).Z(); })
      .pair(3, pb => { pb.M(140, 186).C(160, 166, 186, 172, 194, 194).C(180, 212, 152, 210, 140, 186).Z(); })
      .pair(4, pb => circle(pb, 166, 190, 8))
      .add(5, pb => { pb.M(186, 226).Q(200, 212, 214, 226).Q(200, 244, 186, 226).Z(); })
      .add(6, pb => { pb.M(200, 246).C(180, 268, 156, 262, 148, 248).C(164, 240, 186, 240, 200, 246).Z(); })
      .add(6, pb => { pb.M(200, 246).C(220, 268, 244, 262, 252, 248).C(236, 240, 214, 240, 200, 246).Z(); })
      .list
  });

  def({
    id: 'coruja', title: 'Coruja Sábia', pack: 'doces', level: 3, blurb: 'Penas em arco',
    palette: [['madeira', C.madeira], ['areia', C.areia], ['ouro', C.ouro], ['marinho', C.marinho], ['neve', C.neve], ['grafite', C.grafite], ['laranja', C.laranja]],
    ink: () => [line('M200 92 q-24 -32 -44 -12 M200 92 q24 -32 44 -12', 3),
      line('M150 220 q50 24 100 0 M144 262 q56 26 112 0 M150 302 q50 22 100 0', 2),
      line('M120 372 q26 -12 44 4 M236 372 q26 16 44 4', 3)],
    regions: () => ctx()
      .add(1, pb => { pb.M(200, 84).C(276, 84, 314, 152, 310, 232).C(306, 316, 262, 372, 200, 372).C(138, 372, 94, 316, 90, 232).C(86, 152, 124, 84, 200, 84).Z(); })
      .pair(2, pb => { pb.M(200, 132).C(242, 132, 262, 164, 258, 196).C(252, 228, 224, 244, 200, 240).Z(); })
      .add(3, pb => circle(pb, 158, 178, 34))
      .add(3, pb => circle(pb, 242, 178, 34))
      .add(4, pb => circle(pb, 158, 178, 20))
      .add(4, pb => circle(pb, 242, 178, 20))
      .add(5, pb => circle(pb, 158, 178, 9))
      .add(5, pb => circle(pb, 242, 178, 9))
      .add(6, pb => { pb.M(200, 200).L(218, 226).L(200, 244).L(182, 226).Z(); })
      .add(2, pb => { pb.M(128, 268).Q(200, 312, 272, 268).Q(268, 330, 200, 358).Q(132, 330, 128, 268).Z(); })
      .add(7, pb => { pb.M(166, 366).L(188, 366).L(184, 390).L(160, 390).Z(); })
      .add(7, pb => { pb.M(212, 366).L(234, 366).L(240, 390).L(216, 390).Z(); })
      .add(1, pb => { pb.M(150, 96).L(140, 56).L(178, 84).Z(); })
      .add(1, pb => { pb.M(250, 96).L(260, 56).L(222, 84).Z(); })
      .list
  });

  global.DrawingLibrary = {
    list: L,
    byId: id => L.filter(d => d.id === id)[0],
    packs: [
      { id: 'jardim', title: 'Jardim Magico', note: 'Flores, bichinhos e sol' },
      { id: 'mar', title: 'Mar e Ceus', note: 'Vida aquatica e navegação' },
      { id: 'fantasia', title: 'Reino da Fantasia', note: 'Castelos, dragoes e magia' },
      { id: 'doces', title: 'Doces e Aventuras', note: 'Sorvetes, robo e foguete' }
    ],
    swatch: C
  };
})(window);
