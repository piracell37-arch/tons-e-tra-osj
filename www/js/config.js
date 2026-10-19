/* Configuração do app. Troque os IDs antes de publicar. */
window.CONFIG = {
  appName: 'Traço & Tom — Colorir por Números',
  version: '2.0.4',
  /* E-mail e IDs do AdMob preenchidos a partir do APK que você instalou (2.0.0).
     Confira o ID do aplicativo em admob.com > Configurações > seus dados do Google AdMob > ID do app. */
  supportEmail: 'piracell37@gmail.com',
  privacyUrl: 'https://reino-encantado-hkno7apunhd.qoder.website/privacidade.html',

  admob: {
    enabled: true,
    /* IDs reais da sua conta. */
    appId: 'ca-app-pub-9963092807242586~9730329908',
    banner: 'ca-app-pub-9963092807242586/1900686204',
    interstitial: 'ca-app-pub-9963092807242586/8185973088',
    rewarded: 'ca-app-pub-9963092807242586/3360362672',
    /* Publico declarado "para todos os publicos": o app nao e dirigido a crianças,
       entao os anuncios deixam de ser segmentados para menores e a receita sobe.
       Se um dia voce mudar a ficha da Play para "criancas", volte para true. */
    childDirected: false,
    interstitialEveryCompletions: 3,
    /* So aparece depois de um toque na tela de vitoria (nunca sozinho). */
    interstitialsEnabled: true,
    premiumProductId: 'remove_ads_once',
    /* 'play' = venda dentro do Google Play. Distribuindo o APK fora da Play o faturamento
       do Google não atende o app, então use 'none' para esconder a compra. */
    billing: 'none'
  },

  economy: {
    starsPerDrawing: 10,
    starsPerRegion: 1,
    hintCost: 3,
    maxFreeHintsPerDrawing: 2
  },

  unlock: {
    jardim: { stars: 0, drawings: 0 },
    mar: { stars: 15, drawings: 1 },
    fantasia: { stars: 45, drawings: 4 },
    doces: { stars: 90, drawings: 8 }
  }
};
