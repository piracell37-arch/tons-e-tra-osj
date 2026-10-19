/* Persistência local (progresso, estrelas, preferências). */
(function (global) {
  const KEY = 'reino-encantado/save-v2';
  const defaults = {
    stars: 0,
    premium: false,
    drawings: {},           /* id -> {painted:[indices], done:false} */
    packsUnlocked: [],
    prefs: { music: true, sfx: true, vibrate: true, mode: 'guia', numbers: true, zoom: 100, volume: 30 },
    stats: { completed: 0, regions: 0, day: '', dailyBonus: false, sessions: 0 },
    seenIntro: false
  };
  let state = load();

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return structuredClone(defaults);
      const parsed = JSON.parse(raw);
      return {
        ...structuredClone(defaults), ...parsed,
        prefs: { ...defaults.prefs, ...(parsed.prefs || {}) },
        stats: { ...defaults.stats, ...(parsed.stats || {}) }
      };
    } catch (e) { return structuredClone(defaults); }
  }
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* modo privado */ }
  }

  global.Store = {
    get state() { return state; },
    save,
    reset() { state = structuredClone(defaults); save(); },
    prefs: () => state.prefs,
    setPref(k, v) { state.prefs[k] = v; save(); },
    drawing(id) { return state.drawings[id] || (state.drawings[id] = { painted: [], done: false }); },
    paint(id, index) {
      const d = this.drawing(id);
      if (!d.painted.includes(index)) d.painted.push(index);
      state.stats.regions++;
      save();
    },
    unpaint(id, index) {
      const d = this.drawing(id);
      d.painted = d.painted.filter(i => i !== index);
      save();
    },
    complete(id) {
      const d = this.drawing(id);
      const first = !d.done;
      d.done = true;
      if (first) {
        state.stats.completed++;
        state.stars += window.CONFIG.economy.starsPerDrawing;
      }
      save();
      return first;
    },
    addStars(n) { state.stars += n; save(); },
    spendStars(n) { if (state.stars < n) return false; state.stars -= n; save(); return true; },
    isUnlocked(packId) {
      const rule = window.CONFIG.unlock[packId];
      if (!rule) return true;
      if (state.premium) return true;
      if ((state.packsUnlocked || []).includes(packId)) return true;
      return state.stats.completed >= rule.drawings || state.stars >= rule.stars;
    },
    unlockPack(packId) {
      state.packsUnlocked = state.packsUnlocked || [];
      if (!state.packsUnlocked.includes(packId)) state.packsUnlocked.push(packId);
      save();
    },
    dailyBonus(today) {
      if (state.stats.day !== today) { state.stats.day = today; state.stats.dailyBonus = false; save(); }
      if (state.stats.dailyBonus) return 0;
      state.stats.dailyBonus = true;
      const amount = 20;
      state.stars += amount;
      save();
      return amount;
    },
    setPremium(v) { state.premium = !!v; save(); }
  };
})(window);
