/* Monetização: ponte AdMob (nativo) + espaços web, anúncios recompensados,
   intersticiais e compra "remover anúncios". Todos os métodos são resilientes:
   se o plugin nativo não estiver presente (site/PWA), viram no-op silencioso. */
(function (global) {
  const cfg = () => window.CONFIG.admob;
  const native = () => (global.Capacitor && global.Capacitor.Plugins) ? global.Capacitor.Plugins : null;
  const admob = () => native() && native().AdMob;

  let ready = false, bannerUp = false, interstitialReady = false, rewardedReady = false;
  const listeners = { premium: [] };

  function call(target, names, arg) {
    for (const n of names) {
      if (target && typeof target[n] === 'function') {
        try { return Promise.resolve(target[n](arg)); } catch (e) { return Promise.reject(e); }
      }
    }
    return Promise.reject(new Error('metodo indisponivel'));
  }

  async function init() {
    if (!cfg().enabled || ready) return;
    const plugin = admob();
    if (!plugin) { ready = true; return; }
    try {
      const cd = cfg().childDirected;
      const opts = {
        appId: cfg().appId,
        tagForChildDirectedTreatment: cd,
        tagForUnderAgeOfConsent: false,
        maxAdContentRating: 'General',
        requestTrackingAuthorization: false
      };
      /* O bloco abaixo força tratamento infantil no SDK: so deve existir quando o app
         e realmente dirigido a criancas, senão ele contradiz o publico declarado. */
      if (cd) {
        opts.initializeForChildren = {
          adTrackingEnabled: false,
          childDirectedTreatment: true,
          taggedForUnderAgeOfConsent: false,
          maxAdContentRating: 'General'
        };
      }
      await call(plugin, ['initialize'], opts);
      ready = true;
    } catch (e) { console.info('[ads] initialize:', e.message); }
    try {
      if (typeof plugin.addListener === 'function') {
        plugin.addListener('interstitialAdLoad', () => { interstitialReady = true; });
        plugin.addListener('interstitialAdDismissed', () => { interstitialReady = false; });
        plugin.addListener('rewardedAdVideoLoad', () => { rewardedReady = true; });
        plugin.addListener('rewardedAdVideoReward', () => { rewardedReady = false; });
      }
    } catch (e) { /* versões antigas não expõem listeners */ }
  }

  async function showBanner() {
    if (bannerUp || global.Store.state.premium) return;
    const plugin = admob();
    let nativeOk = false;
    if (plugin) {
      try {
        await call(plugin, ['showBanner', 'bannerShow'], { adId: cfg().banner, position: 'BOTTOM_CENTER', size: 'ADAPTIVE_BANNER' });
        nativeOk = true;
      } catch (e) { nativeOk = false; }
    }
    bannerUp = nativeOk;
    const slot = document.getElementById('web-ad-slot');
    /* Uma colocação de anúncio por tela. O placeholder de HTML só existe no site/PWA:
       dentro do app (Capacitor) uma moldura falsa de "Publicidade" que ninguém pode
       tocar é pior do que ficar sem anúncio — e é o que acontece enquanto o plugin
       nativo do AdMob não está instalado. */
    const inApp = !!global.Capacitor;
    if (nativeOk) {
      document.body.classList.add('has-banner');
      if (slot) slot.hidden = true;
    } else if (!plugin && !inApp) {
      document.body.classList.add('has-banner');
      if (slot) slot.hidden = false;
    } else {
      document.body.classList.remove('has-banner');
      if (slot) slot.hidden = true;
    }
  }
  async function hideBanner() {
    const plugin = admob();
    bannerUp = false;
    document.body.classList.remove('has-banner');
    const slot = document.getElementById('web-ad-slot');
    if (slot) slot.hidden = true;
    if (!plugin) return;
    try { await call(plugin, ['hideBanner'], {}); } catch (e) { }
    try { await call(plugin, ['removeBanner'], {}); } catch (e) { }
  }

  async function prepareInterstitial() {
    const plugin = admob();
    if (!plugin || !cfg().interstitialsEnabled || global.Store.state.premium) return;
    try { await call(plugin, ['prepareInterstitial'], { adId: cfg().interstitial }); interstitialReady = true; } catch (e) { }
  }

  async function maybeInterstitial() {
    /* Apps declarados como dirigidos a crianças não devem exibir intersticial por
       padrão: ligue admob.interstitialsEnabled apenas se a declaração de público for 13+. */
    if (!cfg().interstitialsEnabled) return false;
    if (global.Store.state.premium) return false;
    const every = cfg().interstitialEveryCompletions || 3;
    if (!global.Store.state.stats.completed || global.Store.state.stats.completed % every !== 0) return false;
    return showInterstitial();
  }

  async function showInterstitial() {
    const plugin = admob();
    if (!plugin) return false;
    try {
      if (!interstitialReady) await call(plugin, ['prepareInterstitial'], { adId: cfg().interstitial });
      await call(plugin, ['showInterstitial'], {});
      interstitialReady = false;
      return true;
    } catch (e) { return false; }
  }

  /* Retorna true quando o usuário assistiu e ganhou a recompensa. */
  async function rewarded(reason) {
    if (global.Store.state.premium) return true;
    const plugin = admob();
    if (!plugin) {
      if (new URLSearchParams(location.search).get('demo') === '1') return true;
      return false;
    }
    try {
      await call(plugin, ['prepareRewardVideoAd'], { adId: cfg().rewarded });
      await call(plugin, ['showRewardVideoAd'], {});
      return true;
    } catch (e) { return false; }
  }

  /* Compra única que remove anúncios e libera todos os packs.
     Só existe dentro do Google Play: para o APK distribuído à parte, CONFIG.admob.billing
     fica 'none' e a interface de compra some. O plugin de cobrança (capacitor-plugin-safe-
     area / cordova-plugin-purchase) não está no bundle — sem ele isto vira no-op. */
  function billing() {
    const s = (global.CdvPurchase && global.CdvPurchase.store) || global.store;
    return s && typeof s.register === 'function' ? s : null;
  }
  function own(product) {
    global.Store.setPremium(true);
    listeners.premium.forEach(f => f(true));
    try { if (typeof product.finish === 'function') product.finish(); } catch (e) { }
  }
  async function purchasePremium() {
    const store = billing();
    if (!store) return { ok: false, reason: 'billing-unavailable' };
    const id = cfg().premiumProductId;
    const product = store.register({ id, type: (store.ProductTypes && store.ProductTypes.NON_CONSUMABLE) || 'non consumable' });
    return new Promise(resolve => {
      let done = false;
      const finish = r => { if (!done) { done = true; resolve(r); } };
      product.whenOwned().then(() => { own(product); finish({ ok: true }); });
      store.ready.then(() => store.order(id)).catch(e => finish({ ok: false, reason: String((e && e.message) || e) }));
      setTimeout(() => finish({ ok: false, reason: 'timeout' }), 45000);
    });
  }
  async function restorePremium() {
    const store = billing();
    if (!store) return false;
    const id = cfg().premiumProductId;
    const product = store.register({ id, type: (store.ProductTypes && store.ProductTypes.NON_CONSUMABLE) || 'non consumable' });
    try { await store.refresh(); } catch (e) { return false; }
    const owned = (product.getPurchaseData && product.getPurchaseData().length) || product.state === 'OWNED';
    if (owned) own(product);
    return !!owned;
  }

  global.Ads = {
    init, showBanner, hideBanner, showInterstitial, maybeInterstitial, prepareInterstitial, rewarded,
    purchasePremium, restorePremium,
    get isNative() { return !!admob(); },
    get isPremium() { return global.Store.state.premium; },
    onPremium(fn) { listeners.premium.push(fn); },
    setPremium(v) { global.Store.setPremium(v); listeners.premium.forEach(f => f(v)); }
  };
})(window);
