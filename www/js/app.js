/* Traço & Tom — jogo: galeria, pintura por números, progressão e telas. */
(function (global) {
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  const LIB = global.DrawingLibrary, Store = global.Store, Sound = global.Sound, Ads = global.Ads;
  const NS = 'http://www.w3.org/2000/svg';

  const el = {
    home: $('#screen-home'), game: $('#screen-game'), gallery: $('#gallery'), packTabs: $('#pack-tabs'),
    picture: $('#picture'), palette: $('#palette'), title: $('#drawing-title'),
    progressText: $('#progress-text'), progressFill: $('#progress-fill'), hint: $('#hint-line'),
    feedback: $('#feedback'), modalVictory: $('#modal-victory'), modalSettings: $('#modal-settings'),
    modalUnlock: $('#modal-unlock'), modalInfo: $('#modal-info'), modalCost: $('#modal-cost'),
    toast: $('#toast'), modeLabel: $('#mode-label'), confetti: $('#confetti-canvas')
  };
  const starChips = ['#stars-chip', '#stars-chip-game'].map(s => $(s)).filter(Boolean);

  let current = null;           /* desenho carregado */
  let regions = [];             /* nós SVG */
  let activeNumber = 1;
  let activeColor = '#fff';
  let activeName = '';
  let history = [];
  let finished = false;
  let numbersVisible = true;
  let freeMode = false;
  let hintTimeout = null;
  let view = 'jardim';

  /* ------------------------------------------------------------ utilidades */
  function svg(tag, attrs = {}) {
    const n = document.createElementNS(NS, tag);
    Object.entries(attrs).forEach(([k, v]) => n.setAttribute(k, v));
    return n;
  }
  function toast(msg, ms = 2200) {
    el.toast.textContent = msg;
    el.toast.hidden = false;
    clearTimeout(toast._t);
    toast._t = setTimeout(() => { el.toast.hidden = true; }, ms);
  }
  function vibrate(pattern) {
    if (Store.prefs().vibrate && navigator.vibrate) { try { navigator.vibrate(pattern); } catch (e) { } }
  }
  function fmt(n) { return String(n); }

  function thumbnail(def, paintedSet) {
    const built = build(def);
    const s = svg('svg', { viewBox: built.vb, class: 'thumb-svg', 'aria-hidden': 'true', preserveAspectRatio: 'xMidYMid meet' });
    built.regions.forEach((r, i) => {
      const fill = paintedSet && paintedSet.has(i) ? built.colors[r.n - 1].hex : '#f2f0f7';
      s.appendChild(svg('path', { d: r.d, fill, stroke: '#5b5470', 'stroke-width': '2.2', 'stroke-linejoin': 'round' }));
    });
    (built.ink || []).forEach(node => s.appendChild(node.cloneNode(true)));
    return s;
  }

  /* constrói metadados de um desenho da biblioteca */
  const cache = {};
  function build(def) {
    if (cache[def.id]) return cache[def.id];
    const regions = def.regions();
    const palette = def.palette.map(([name, hex], i) => ({ n: i + 1, name, hex }));
    const used = new Set(regions.map(r => r.n));
    const colors = palette.filter(c => used.has(c.n));
    const map = {};
    colors.forEach((c, i) => { map[c.n] = i + 1; });
    const out = {
      id: def.id, vb: '0 0 400 400',
      regions: regions.map(r => ({ d: r.d, x: r.x, y: r.y, n: map[r.n] || 1 })),
      colors,
      ink: (def.ink ? def.ink() : []).map(raw => {
        const tpl = document.createElement('div');
        tpl.innerHTML = `<svg xmlns="${NS}">${raw}</svg>`;
        return tpl.firstChild.firstChild;
      })
    };
    cache[def.id] = out;
    return out;
  }

  /* --------------------------------------------------------------- galeria */
  function renderTabs() {
    el.packTabs.innerHTML = '';
    LIB.packs.forEach(p => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'pack-tab' + (p.id === view ? ' on' : '');
      b.textContent = p.title;
      b.setAttribute('aria-pressed', String(p.id === view));
      b.onclick = () => { view = p.id; renderTabs(); renderGallery(); };
      el.packTabs.appendChild(b);
    });
  }

  function renderGallery() {
    const pack = LIB.packs.find(p => p.id === view);
    el.gallery.innerHTML = '';
    const heading = $('#gallery-note');
    heading.textContent = pack.note;
    LIB.list.filter(d => d.pack === view).forEach(def => {
      const state = Store.state.drawings[def.id] || { painted: [], done: false };
      const built = build(def);
      const unlocked = Store.isUnlocked(def.pack);
      const tile = document.createElement('button');
      tile.type = 'button';
      tile.className = 'tile' + (state.done ? ' done' : '') + (!unlocked ? ' locked' : '');
      tile.innerHTML = `<span class="tile-art"></span>
        <span class="tile-meta"><strong></strong><small></small></span>
        <span class="tile-state"></span>`;
      tile.querySelector('.tile-art').appendChild(thumbnail(def, new Set(state.painted)));
      tile.querySelector('strong').textContent = def.title;
      tile.querySelector('.tile-meta small').textContent = `${built.regions.length} regiões · nível ${def.level}`;
      const st = tile.querySelector('.tile-state');
      if (!unlocked) st.innerHTML = '<span class="lock">🔒 Pack bloqueado</span>';
      else if (state.done) st.innerHTML = '<span class="badge-done">✓ Completo</span>';
      else if (state.painted.length) st.textContent = `${Math.round(state.painted.length / built.regions.length * 100)}%`;
      else st.textContent = `${built.regions.length} regiões`;
      tile.onclick = () => openDrawing(def.id);
      el.gallery.appendChild(tile);
    });
    updateHud();
  }

  function updateHud() {
    const total = LIB.list.length;
    const done = LIB.list.filter(d => (Store.state.drawings[d.id] || {}).done).length;
    starChips.forEach(s => { s.textContent = fmt(Store.state.stars); });
    const c = $('#collected-chip');
    if (c) c.textContent = `${done}/${total}`;
    const bar = $('#home-progress');
    if (bar) bar.style.width = `${done / total * 100}%`;
    const label = $('#home-progress-label');
    if (label) label.textContent = `${done} de ${total} ilustrações concluídas`;
    const bonus = $('#daily-bonus');
    if (bonus) {
      const today = new Date().toISOString().slice(0, 10);
      const claimed = Store.state.stats.day === today && Store.state.stats.dailyBonus;
      bonus.disabled = claimed;
      bonus.querySelector('span').textContent = claimed ? 'Presente de hoje recebido' : 'Receber +20 estrelinhas';
    }
  }

  /* ------------------------------------------------------------------ jogo */
  function openDrawing(id) {
    const def = LIB.byId(id);
    if (!def) return;
    if (!Store.isUnlocked(def.pack)) { askUnlock(def.pack); return; }
    current = def;
    finished = false;
    history = [];
    const built = build(def);
    const saved = Store.drawing(def.id).painted.slice();

    el.title.textContent = def.title;
    $('#drawing-blurb').textContent = def.blurb;
    el.picture.setAttribute('viewBox', built.vb);
    el.picture.innerHTML = '';
    el.picture.setAttribute('aria-label', `${def.title}: ${built.regions.length} regiões numeradas`);

    const gInk = svg('g', { class: 'ink-layer', 'aria-hidden': 'true' });
    const gRegions = svg('g', { class: 'region-layer' });
    const gLabels = svg('g', { class: 'label-layer', id: 'number-labels', 'aria-hidden': 'false' });

    regions = built.regions.map((r, i) => {
      const p = svg('path', { d: r.d, class: 'region', 'data-index': i, 'data-number': r.n, tabindex: '0', role: 'button' });
      gRegions.appendChild(p);
      return p;
    });
    /* decora as linhas de tinta acima das regiões */
    built.ink.forEach(node => gInk.appendChild(node.cloneNode(true)));
    built.regions.forEach((r, i) => {
      const t = svg('text', { x: r.x, y: r.y, 'data-index': i });
      t.textContent = r.n;
      gLabels.appendChild(t);
    });
    el.picture.append(gRegions, gInk, gLabels);

    renderPalette(built.colors);
    freeMode = Store.prefs().mode === 'livre';
    numbersVisible = Store.prefs().numbers;
    $('#btn-toggle-numbers').setAttribute('aria-pressed', String(numbersVisible));
    $('#btn-mode').setAttribute('aria-pressed', String(freeMode));
    saved.forEach(i => paintRegion(i, { silent: true, restore: true }));
    applyNumbers();
    refresh();
    showScreen('game');
    /* getBBox() e isPointInFill() so funcionam com a tela visivel */
    decollide(regions, [...document.querySelectorAll('#number-labels text')]);
    Sound.unlock();
    if (Store.prefs().music) Sound.startMusic();
    Ads.showBanner();
  }

  function renderPalette(colors) {
    el.palette.innerHTML = '';
    colors.forEach((c, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'swatch-btn' + (i === 0 ? ' on' : '');
      b.dataset.number = c.n;
      b.dataset.color = c.hex;
      b.dataset.name = c.name;
      b.setAttribute('aria-pressed', String(i === 0));
      b.innerHTML = `<span class="sw" style="--sw:${c.hex}"></span><span class="num">${c.n}</span><span class="nm">${c.name}</span><span class="cnt"></span>`;
      b.onclick = () => selectColor(b);
      el.palette.appendChild(b);
    });
    const first = el.palette.firstChild;
    if (first) selectColor(first);
  }

  function selectColor(btn) {
    if (finished) return;
    $$('#palette .swatch-btn').forEach(b => {
      const on = b === btn;
      b.classList.toggle('on', on);
      b.setAttribute('aria-pressed', String(on));
    });
    activeNumber = Number(btn.dataset.number);
    activeColor = btn.dataset.color;
    activeName = btn.dataset.name;
    $('#selection').innerHTML = `Cor ativa: <strong>${activeNumber} — ${activeName}</strong>`;
    if (!freeMode) { $('#hint-line').textContent = `Toque nas áreas com o número ${activeNumber}`; }
    refresh();
    Sound.tap();
  }

  function paintRegion(index, opt = {}) {
    if (!current || finished) return;
    const node = regions[index];
    if (!node || node.dataset.painted === 'true') return;
    const n = Number(node.dataset.number);
    if (!freeMode && n !== activeNumber) {
      node.classList.remove('shake'); void node.getBoundingClientRect(); node.classList.add('shake');
      el.feedback.className = 'feedback bad';
      el.feedback.textContent = `Essa área é do número ${n}. Escolha a cor ${n} na paleta${Store.prefs().mode === 'guia' ? ', ou ative o Modo Livre.' : '.'}`;
      if (!opt.silent) { Sound.wrong(); vibrate([16, 40, 16]); }
      return;
    }
    const color = freeMode ? activeColor : current ? build(current).colors[n - 1].hex : activeColor;
    node.style.fill = color;
    node.dataset.painted = 'true';
    node.classList.add('painted');
    if (!opt.restore) {
      history.push(index);
      Store.paint(current.id, index);
      if (!freeMode) {
        const remaining = build(current).regions.some((r, i) => r.n === n && regions[i].dataset.painted !== 'true');
        if (!remaining) {
          const btn = $(`#palette .swatch-btn[data-number="${n}"]`);
          if (btn) btn.classList.add('finished-color');
        }
      }
      el.feedback.className = 'feedback good';
      el.feedback.textContent = `Muito bem! ${activeName} aplicado.`;
      Sound.paint(); vibrate(12);
      if (!opt.silent) Store.addStars(global.CONFIG.economy.starsPerRegion);
    }
    refresh();
  }

  function refresh() {
    if (!current) return;
    const built = build(current);
    const total = built.regions.length;
    const painted = regions.filter(r => r.dataset.painted === 'true').length;
    el.progressText.textContent = `${painted} de ${total}`;
    el.progressFill.style.width = `${painted / total * 100}%`;
    const left = total - painted;
    if (left) $('#hint-line').textContent = freeMode ? `Faltam ${left} áreas` : `Faltam ${left} áreas — cor ${activeNumber}`;
    $$('#palette .cnt').forEach((c, i) => {
      const btn = $$('#palette .swatch-btn')[i];
      const n = Number(btn.dataset.number);
      const rem = built.regions.reduce((acc, r, idx) => acc + (r.n === n && regions[idx].dataset.painted !== 'true' ? 1 : 0), 0);
      c.textContent = rem ? rem : '✓';
    });
    if (!painted) el.feedback.textContent = 'Escolha uma cor e toque numa área.';
    if (painted === total && !finished) win();
  }

  function win() {
    finished = true;
    const def = current;
    const firstTime = Store.complete(def.id);
    Sound.fanfare(); vibrate([30, 50, 30, 50, 90]);
    confetti();
    $('#victory-title').textContent = firstTime ? 'Ilustração concluída!' : 'Você pintou de novo!';
    $('#victory-stars').textContent = firstTime ? `+${global.CONFIG.economy.starsPerDrawing} estrelinhas` : 'Refazendo não dá estrelas extras, mas dá orgulho!';
    $('#victory-art').innerHTML = '';
    $('#victory-art').appendChild(thumbnail(def, new Set(Store.drawing(def.id).painted)));
    el.modalVictory.hidden = false;
    updateHud();
    renderGallery();
    Ads.prepareInterstitial();
  }

  function undo() {
    if (!history.length) { toast('Nada para desfazer neste desenho.'); return; }
    const i = history.pop();
    const node = regions[i];
    node.dataset.painted = 'false';
    node.classList.remove('painted');
    node.style.fill = '';
    Store.unpaint(current.id, i);
    $$('#palette .finished-color').forEach(b => b.classList.remove('finished-color'));
    finished = false;
    refresh();
  }

  function hint() {
    if (!current || finished) return;
    const built = build(current);
    const cost = global.CONFIG.economy.hintCost;
    const give = () => {
      const candidates = built.regions
        .map((r, i) => ({ r, i }))
        .filter(o => o.r.n === activeNumber && regions[o.i].dataset.painted !== 'true');
      if (!candidates.length) { toast('Nenhuma área restante para esta cor.'); return; }
      const pick = candidates[Math.floor(Math.random() * candidates.length)];
      const node = regions[pick.i];
      node.classList.add('hinted');
      clearTimeout(hintTimeout);
      hintTimeout = setTimeout(() => node.classList.remove('hinted'), 2600);
      Sound.unlock2();
    };
    if (Store.prefs().mode === 'livre') {
      const all = built.regions.map((r, i) => i).filter(i => regions[i].dataset.painted !== 'true');
      if (!all.length) return toast('Tudo pintado por aqui!');
      const node = regions[all[Math.floor(Math.random() * all.length)]];
      node.classList.add('hinted');
      clearTimeout(hintTimeout);
      hintTimeout = setTimeout(() => node.classList.remove('hinted'), 2600);
      return;
    }
    if (Store.spendStars(cost)) return give();
    askCost(`A dica custa ${cost} estrelinhas`, cost, () => give());
  }

  /* ------------------------------------------------------ desbloqueios/pago */
  function askUnlock(packId) {
    const pack = LIB.packs.find(p => p.id === packId);
    const rule = global.CONFIG.unlock[packId];
    $('#unlock-title').textContent = `Desbloqueie ${pack.title}`;
    $('#unlock-body').textContent = `Você precisa de ${rule.stars} estrelinhas ou ${rule.drawings} ilustrações concluídas para abrir este pack. Também dá para liberar assistindo a um anúncio curto.`;
    $('#unlock-stars').textContent = Store.state.premium ? 'Incluído — você já removeu os anúncios' : `Gastar ${rule.stars} estrelinhas`;
    el.modalUnlock.dataset.pack = packId;
    el.modalUnlock.hidden = false;
  }

  function askCost(title, cost, onOk) {
    $('#cost-title').textContent = title;
    $('#cost-body').textContent = `Suas estrelinhas: ${Store.state.stars}. Ganhe mais concluíndo ilustrações, pegando o presente diário ou assistindo a um anúncio.`;
    const handler = () => {
      closeModal(el.modalCost);
      Ads.rewarded('cost').then(earned => {
        if (earned) { Store.addStars(cost); onOk(); toast('Recompensa recebida!'); }
        else toast('Anúncio indisponível agora. Complete ilustrações para ganhar estrelas.');
      });
    };
    $('#cost-ok').textContent = 'Assistir anúncio';
    $('#cost-alt').textContent = 'Voltar e juntar estrelas';
    $('#cost-ok').onclick = handler;
    $('#cost-alt').onclick = () => closeModal(el.modalCost);
    el.modalCost.hidden = false;
  }

  /* --------------------------------------------------------------- telas UI */
  function showScreen(name) {
    el.home.hidden = name !== 'home';
    el.game.hidden = name !== 'game';
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (name === 'home') { Ads.hideBanner(); renderGallery(); }
    else Ads.showBanner();
  }
  function closeModal(m) { if (m) m.hidden = true; }

  function confetti() {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const cv = el.confetti, ctx = cv.getContext('2d');
    cv.width = innerWidth; cv.height = innerHeight;
    const colors = ['#FFC93C', '#F2789F', '#3E8AD8', '#5CB46B', '#8455C8', '#FF8A3D'];
    const bits = Array.from({ length: 120 }, () => ({
      x: Math.random() * cv.width, y: -20 - Math.random() * cv.height * 0.4,
      r: 4 + Math.random() * 7, c: colors[Math.floor(Math.random() * colors.length)],
      vy: 1.6 + Math.random() * 2.6, vx: -1.4 + Math.random() * 2.8, rot: Math.random() * 6
    }));
    let frames = 0;
    (function tick() {
      ctx.clearRect(0, 0, cv.width, cv.height);
      bits.forEach(b => {
        b.x += b.vx; b.y += b.vy; b.rot += 0.12;
        ctx.save(); ctx.translate(b.x, b.y); ctx.rotate(b.rot);
        ctx.fillStyle = b.c; ctx.fillRect(-b.r / 2, -b.r / 2, b.r, b.r * 1.7); ctx.restore();
      });
      if (++frames < 150) requestAnimationFrame(tick);
      else ctx.clearRect(0, 0, cv.width, cv.height);
    })();
  }

  /* empurra os números para que nunca fiquem em cima uns dos outros */
  function decollide(paths, labels) {
    const min = 13, taken = [], r1 = n => Math.round(n * 10) / 10;
    const near = p => taken.length ? Math.min(...taken.map(t => (t[0] - p[0]) ** 2 + (t[1] - p[1]) ** 2)) : Infinity;
    const inside = (p, x, y) => { try { return p.isPointInFill(new DOMPoint(x, y)); } catch (e) { return false; } };
    const area = p => { const b = p.getBBox(); return b.width * b.height; };
    labels.map((t, i) => ({ t, p: paths[i] })).sort((a, b) => area(a.p) - area(b.p)).forEach(({ t, p }) => {
      const home = [+t.getAttribute('x'), +t.getAttribute('y')];
      if (near(home) > min * min) { taken.push(home); return; }
      const b = p.getBBox();
      let freeBest = null, maxBest = null;
      for (let y = b.y + 4; y <= b.y + b.height - 4; y += 4) {
        for (let x = b.x + 4; x <= b.x + b.width - 4; x += 4) {
          if (!inside(p, x, y)) continue;
          const s = near([x, y]), d = (x - home[0]) ** 2 + (y - home[1]) ** 2;
          if (!maxBest || s > maxBest.s) maxBest = { s, x, y };
          if (s > min * min && (!freeBest || d < freeBest.d)) freeBest = { d, x, y };
        }
      }
      const pick = freeBest || (maxBest && maxBest.s > 0 ? maxBest : null);
      if (pick) { t.setAttribute('x', r1(pick.x)); t.setAttribute('y', r1(pick.y)); taken.push([pick.x, pick.y]); }
      else taken.push(home);
    });
  }

  function applyNumbers() {
    const layer = $('#number-labels');
    if (layer) layer.style.display = numbersVisible ? '' : 'none';
    $('#btn-mode').classList.toggle('on', freeMode);
    el.modeLabel.textContent = freeMode ? 'Modo Livre' : 'Modo Guia';
  }

  function setZoom(v) {
    document.documentElement.style.setProperty('--zoom', v + '%');
    $('#zoom-value').textContent = v + '%';
    Store.setPref('zoom', v);
  }

  function coloredThumb(def) {
    const built = build(def);
    const s = svg('svg', { viewBox: built.vb, 'aria-hidden': 'true', preserveAspectRatio: 'xMidYMid meet' });
    built.regions.forEach(r => s.appendChild(svg('path', {
      d: r.d, fill: built.colors[r.n - 1].hex, stroke: '#2b3446', 'stroke-width': '2.4', 'stroke-linejoin': 'round'
    })));
    built.ink.forEach(node => s.appendChild(node.cloneNode(true)));
    return s;
  }

  /* ------------------------------------------------------------- ligações */
  function wire() {
    $('#btn-start').onclick = () => {
      const resume = LIB.list.find(d => { const s = Store.state.drawings[d.id]; return s && s.painted.length && !s.done; });
      openDrawing((resume || LIB.list[0]).id);
    };
    $('#btn-gallery')?.addEventListener('click', () => $('#gallery').scrollIntoView({ behavior: 'smooth' }));
    $('#btn-settings-home').onclick = () => { el.modalSettings.hidden = false; syncSettings(); };
    $('#btn-settings-game').onclick = () => { el.modalSettings.hidden = false; syncSettings(); };
    $('#btn-close-settings').onclick = () => closeModal(el.modalSettings);
    $('#btn-done-settings').onclick = () => closeModal(el.modalSettings);
    $('#btn-back').onclick = () => showScreen('home');
    /* O intersticial só aparece depois de um toque do jogador para sair da tela de
       vitória (nunca sozinho): é o único enquadramento aceito pela Política para Famílias. */
    const afterVictory = go => async () => {
      closeModal(el.modalVictory);
      await Ads.maybeInterstitial();
      go();
    };
    $('#btn-next')?.addEventListener('click', afterVictory(nextDrawing));
    $('#btn-home-from-victory').onclick = afterVictory(() => showScreen('home'));
    $('#btn-replay').onclick = afterVictory(() => {
      /* sem limpar as regiões salvas o desenho reabre pronto e a tela de vitoria
         reaparece na hora: "pintar de novo" virava um botao morto */
      Store.drawing(current.id).painted = [];
      Store.save();
      openDrawing(current.id);
    });
    $('#btn-undo').onclick = undo;
    $('#btn-hint').onclick = hint;
    $('#btn-reset').onclick = () => { Store.drawing(current.id).painted = []; Store.save(); openDrawing(current.id); toast('Desenho reiniciado.'); };
    $('#btn-mode').onclick = () => {
      freeMode = !freeMode;
      Store.setPref('mode', freeMode ? 'livre' : 'guia');
      applyNumbers();
      $$('#palette .finished-color').forEach(b => b.classList.remove('finished-color'));
      toast(freeMode ? 'Modo Livre: pinte qualquer área com a cor escolhida.' : 'Modo Guia: siga os números.');
      refresh();
    };
    $('#btn-toggle-numbers').onclick = () => {
      numbersVisible = !numbersVisible;
      Store.setPref('numbers', numbersVisible);
      applyNumbers();
    };
    $('#btn-zoom-in').onclick = () => { const v = Math.min(150, Number($('#zoom-range').value) + 10); $('#zoom-range').value = v; setZoom(v); };
    $('#btn-zoom-out').onclick = () => { const v = Math.max(70, Number($('#zoom-range').value) - 10); $('#zoom-range').value = v; setZoom(v); };
    $('#zoom-range').oninput = e => setZoom(Number(e.target.value));
    $('#volume-range').oninput = e => { Store.setPref('volume', Number(e.target.value)); Sound.setVolume(); $('#volume-value').textContent = e.target.value + '%'; };
    $('#toggle-music').onchange = e => { Store.setPref('music', e.target.checked); if (e.target.checked) Sound.startMusic(); else Sound.stopMusic(); };
    $('#toggle-sfx').onchange = e => Store.setPref('sfx', e.target.checked);
    $('#toggle-vibrate').onchange = e => Store.setPref('vibrate', e.target.checked);
    $('#btn-reset-data').onclick = () => { if (confirm('Apagar todo o progresso salvo neste aparelho?')) { Store.reset(); location.reload(); } };
    $('#btn-remove-ads').onclick = async () => {
      const r = await Ads.purchasePremium();
      if (r.ok) { toast('Pronto! Anúncios removidos e todos os packs liberados.'); Ads.hideBanner(); syncSettings(); }
      else if (r.reason === 'billing-unavailable') {
        $('#premium-note').textContent = 'A cobrança nativa ainda não está ligada neste build. Configure o plugin de compras do Google Play (docs/MONETIZACAO.md) para habilitar a compra dentro do app.';
      } else $('#premium-note').textContent = 'Compra não concluída: ' + r.reason;
    };
    $('#btn-restore').onclick = async () => {
      const ok = await Ads.restorePremium();
      toast(ok ? 'Compra restaurada!' : 'Nenhuma compra encontrada para esta conta.');
      syncSettings();
    };
    $('#unlock-stars-btn').onclick = () => {
      const packId = el.modalUnlock.dataset.pack;
      const rule = global.CONFIG.unlock[packId];
      if (Store.state.stars >= rule.stars) {
        Store.spendStars(rule.stars);
        Store.unlockPack(packId);
        closeModal(el.modalUnlock);
        toast('Pack liberado!');
        Sound.unlock2();
        renderGallery();
      } else toast(`Faltam ${rule.stars - Store.state.stars} estrelinhas.`);
    };
    $('#unlock-ad-btn').onclick = () => {
      const packId = el.modalUnlock.dataset.pack;
      Ads.rewarded('pack').then(earned => {
        if (earned) {
          Store.unlockPack(packId);
          closeModal(el.modalUnlock);
          toast('Obrigado! Pack liberado.');
          Sound.unlock2();
          renderGallery();
        } else {
          const sellable = global.CONFIG.admob.billing !== 'none';
          $('#unlock-body').textContent = 'O anúncio não pôde ser carregado agora. Você também pode '
            + (sellable ? 'liberar com estrelinhas ou remover os anúncios por compra única.'
                        : 'liberar este pack com estrelinhas.');
        }
      });
    };
    $('#unlock-premium-btn').onclick = () => { closeModal(el.modalUnlock); el.modalSettings.hidden = false; syncSettings(); };
    $('#daily-bonus').onclick = () => {
      const got = Store.dailyBonus(new Date().toISOString().slice(0, 10));
      if (got) { toast(`Presente recebido: +${got} estrelinhas!`); Sound.coin(); vibrate(20); }
      updateHud();
    };
    $('#btn-info').onclick = () => { el.modalInfo.hidden = false; };
    $('#btn-close-info').onclick = () => closeModal(el.modalInfo);
    $$('a[data-close]').forEach(a => a.addEventListener('click', () => closeModal(el.modalInfo)));
    [el.modalVictory, el.modalSettings, el.modalUnlock, el.modalInfo, el.modalCost].forEach(m => {
      if (m) m.addEventListener('click', e => { if (e.target === m && m !== el.modalVictory) m.hidden = true; });
    });
    document.addEventListener('keydown', e => {
      if (e.key !== 'Escape') return;
      [el.modalSettings, el.modalUnlock, el.modalInfo, el.modalCost].forEach(m => m && (m.hidden = true));
    });
    el.picture.addEventListener('click', e => {
      const t = e.target.closest('.region');
      if (t) return paintRegion(Number(t.dataset.index));
      const l = e.target.closest('#number-labels text');
      if (l) return paintRegion(Number(l.dataset.index));
    });
    el.picture.addEventListener('keydown', e => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      const t = e.target.closest('.region');
      if (!t) return;
      e.preventDefault();
      paintRegion(Number(t.dataset.index));
    });
    document.addEventListener('visibilitychange', () => { if (document.hidden) Sound.stopMusic(); else if (Store.prefs().music && !el.game.hidden) Sound.startMusic(); });
    const Cap = global.Capacitor;
    if (Cap && Cap.Plugins && Cap.Plugins.App) {
      Cap.Plugins.App.addListener('backButton', () => {
        if (!el.game.hidden) showScreen('home'); else Cap.Plugins.App.exitApp();
      });
    }
    if (Cap && Cap.Plugins && Cap.Plugins.StatusBar) {
      try { Cap.Plugins.StatusBar.setStyle({ style: 'LIGHT' }); } catch (e) { }
    }
  }

  function nextDrawing() {
    const list = LIB.list.filter(d => d.pack === current.pack);
    const i = list.findIndex(d => d.id === current.id);
    for (let k = 1; k <= list.length; k++) {
      const cand = list[(i + k) % list.length];
      const s = Store.state.drawings[cand.id];
      if (Store.isUnlocked(cand.pack) && !(s && s.done)) return openDrawing(cand.id);
    }
    showScreen('home');
  }

  function syncSettings() {
    const p = Store.prefs();
    $('#toggle-music').checked = p.music;
    $('#toggle-sfx').checked = p.sfx;
    $('#toggle-vibrate').checked = p.vibrate;
    $('#volume-range').value = p.volume;
    $('#volume-value').textContent = p.volume + '%';
    $('#zoom-range').value = p.zoom;
    const prem = Store.state.premium;
    const sellable = global.CONFIG.admob.billing !== 'none';
    $('#premium-state').textContent = prem ? 'Ativo — sem anúncios, packs liberados' : 'Não comprado';
    $('#btn-remove-ads').disabled = prem;
    $('#btn-remove-ads').hidden = !sellable;
    $('#btn-restore').hidden = !sellable;
    if (!sellable && !prem) {
      $('#premium-note').textContent = 'Fora da Google Play a cobrança não existe: libere os packs pintando por estrelinhas ou assistindo a um anúncio.';
    } else {
      $('#premium-note').textContent = prem ? '' : 'Remover anúncios também libera todos os packs da galeria.';
    }
  }

  function boot() {
    document.getElementById('app-version').textContent = 'v' + global.CONFIG.version;
    $('#unlock-premium-btn').hidden = global.CONFIG.admob.billing === 'none';
    $('#art-count').textContent = LIB.list.length;
    $('#hero-art').appendChild(coloredThumb(LIB.byId('castelo')));
    renderTabs();
    renderGallery();
    wire();
    setZoom(Store.prefs().zoom);
    Sound.setVolume();
    Ads.init().then(() => Ads.prepareInterstitial());
  }

  /* Num aparelho sem cabo e sem adb, a única forma de saber o que quebrou é o próprio
     app contar. Sem isto, um erro no boot deixa a tela inicial parada e muda. */
  function showFatal(msg) {
    let box = document.getElementById('boot-error');
    if (!box) {
      box = document.createElement('div');
      box.id = 'boot-error';
      box.setAttribute('role', 'alert');
      document.body.appendChild(box);
    }
    box.textContent = 'Problema ao abrir o jogo: ' + msg +
      ' — anote esta mensagem e mande para o suporte.';
    box.hidden = false;
  }

  global.addEventListener('error', e => {
    showFatal((e.message || 'erro') + ' (' + String(e.filename || '').split('/').pop() + ':' + e.lineno + ')');
  });

  document.addEventListener('DOMContentLoaded', () => {
    try {
      boot();
      if (!el.packTabs || !el.packTabs.children.length) showFatal('a galeria não chegou a montar');
    } catch (err) {
      showFatal(err && err.message ? err.message : String(err));
    }
  });
})(window);
