# Traço & Tom — Colorir por Números

Jogo de colorir por números para Android (Google Play), feito em JavaScript puro + Capacitor.
**Não usa framework, não usa build e não usa nenhuma imagem externa**: as 31 ilustrações são
desenhos vetoriais originais gerados por geometria em código.

## Rodar no navegador

```bash
npm start          # abre em http://localhost:8123
```
ou dê dois cliques em `INICIAR-JOGO.bat` (usa Python, porta 8000).
Acrescente `?demo=1` para simular a recompensa de anúncio sem plugin nativo.

## Estrutura

```
www/
  index.html            duas telas (galeria e mesa de pintura) + cinco modais
  styles/app.css        tema único
  js/config.js          IDs de anúncio, economia, regras de desbloqueio  <-- EDITE AQUI
  js/store.js           progresso em localStorage (sem servidor, sem conta)
  js/audio.js           música e efeitos gerados por WebAudio
  js/art-core.js        geometria: arcos, pétalas, anéis, estrelas, blobs
  js/art-library.js     as 31 ilustrações, em 4 packs
  js/ads.js             ponte AdMob + compra (no-op seguro no navegador)
  js/app.js             jogo, galeria, paleta, dica, desfazer, vitória
tools/
  art-check.html        página de validação da arte (fora do pacote do app)
  icons-render.html     renderiza o ícone em todos os tamanhos Android
scripts/
  serve.mjs             servidor estático local
  apply-android.mjs     ajusta o projeto Android depois do `cap sync`
  make-icons.mjs        expande resources/ e copia ícone + splash para android/
  make-site.mjs         gera site/ (política + suporte) para publicar a URL
resources/
  android/              PNGs de mipmap/drawable já gerados (versionados)
  play/store-icon-512.png
docs/
  PLAY-STORE.md         do código à ficha da loja (checklist completo)
  MONETIZACAO.md        AdMob, compra, política para famílias, receita
  APK.md                distribuir o APK fora da Play: o que muda e como assinar
```

Capacitor **8** / Android SDK **36** — é o mínimo que a Play aceita para app novo desde
31/08/2026, e exige Node 22+ no computador.

## Adicionar uma ilustração

Rode `node scripts/serve.mjs 8124 .` e abra `http://localhost:8124/tools/art-check.html` enquanto edita
`www/js/art-library.js`: ela desenha o acervo inteiro,
pinta cada região com a cor da paleta e marca em vermelho qualquer arte com região fora da tela,
cor sem uso ou número colidindo. Galeria, packs e contagens se atualizam sozinhos.

## Publicar

**APK por conta própria** (não paga nada, não passa por revisão — `docs/APK.md`):

```bash
npm install
npm run android:add && npm run android:sync && npm run android:prepare
npm run android:apk        # android\app\build\outputs\apk\debug\app-debug.apk
```

**Google Play** (US$ 25 na conta de desenvolvedor):

```bash
npm install
npm run android:add && npm run android:sync && npm run android:prepare
npm run android:open
```
Depois siga `docs/PLAY-STORE.md` (ícone, privacidade, Data Safety, AAB assinado, revisão).
Fora da Play a compra "remover anúncios" não funciona — o `billing` do `config.js` está em `'none'`
e os botões de compra ficam ocultos; anúncios AdMob continuam valendo normalmente.

## Antes de subir, troque obrigatoriamente

- `www/js/config.js` → `supportEmail` e os quatro IDs do AdMob (ainda são os IDs de **teste** do
  Google, que não geram receita);
- `www/privacy.html` e `www/support.html` → o e-mail entre colchetes;
- `capacitor.config.json` → `plugins.AdMob.appId` (o script lê daqui para o manifest);
- rode `npm run site` e republique a pasta `site/`, porque a política publicada copia esses textos.

`privacyUrl` já aponta para a página no ar:
<https://reino-encantado-hkno7apunhd.qoder.website/privacidade.html>.
