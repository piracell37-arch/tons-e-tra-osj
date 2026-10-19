# Publicar o Traço & Tom na Google Play

Caminho completo, do código à ficha da loja. Atualizado em **14/10/2026** com as regras
que valem hoje (API 36 obrigatório desde 31/08/2026).

---

## 0. Estado do projeto

| Item | Onde | Situação |
|---|---|---|
| 31 ilustrações vetoriais originais (sem foto, sem IA) | `www/js/art-library.js` | pronto e validado |
| Motor de geometria | `www/js/art-core.js` | pronto |
| Jogo, galeria, packs, estrelinhas, dica, desfazer, zoom | `www/js/app.js` | pronto |
| Persistência local (sem servidor, sem conta) | `www/js/store.js` | pronto |
| Áudio gerado por código (sem músicas com direitos) | `www/js/audio.js` | pronto |
| Ponte de anúncios e compra | `www/js/ads.js` | pronto, ver `MONETIZACAO.md` |
| Ícone + splash em PNG (todos os densidades) | `resources/android/` | **gerado** — `npm run icons` copia para o projeto |
| Ícone da ficha da loja 512×512 sem transparência | `resources/play/store-icon-512.png` | **gerado** |
| Política + suporte prontos para publicar | `site/` | **gerado** — `npm run site` |
| PWA / offline | `www/manifest.webmanifest`, `www/sw.js` | pronto (164 KB no total) |
| Config Capacitor 8 (target SDK 36) | `capacitor.config.json` | pronta |
| E-mail de suporte e URL da política | `www/js/config.js`, `www/privacy.html` | **FALTA — são seus, ninguém pode preencher por você** |
| IDs reais do AdMob | `www/js/config.js`, `capacitor.config.json` | **FALTA — ainda são os IDs de teste do Google** |

---

## 1. Pré-requisitos no computador

1. **Node.js 22 ou mais novo** (`node -v`). O Capacitor 8 recusa versões anteriores.
2. **Android Studio** atual, com **Android SDK Platform 36** (Android 16) e **JDK 21**:
   Android Studio → SDK Manager → SDK Platforms → marque *Android 16 (API 36)* → Apply.
   Build-Tools 36.0.0 também.
3. **Conta de desenvolvedor Google Play** — US$ 25, uma vez: https://play.google.com/console.

Por que o SDK 36 não é opcional: desde **31/08/2026** a Play rejeita automaticamente
APK/AAB novo ou atualização que mire uma target API menor. Há prorrogação excepcional
pedida pelo Play Console até **01/11/2026** — não conte com ela; o projeto já está no 36.

## 2. Gerar o projeto Android

```bash
cd atelie-playstore
npm install            # Capacitor 8 + AdMob 8 + plugin de compras
npm run android:add    # cria a pasta android/
npm run android:sync   # copia www/ para dentro do app
npm run android:prepare  # icons + permissões + AdMob + nome + versão
npm run android:open   # abre no Android Studio
```

`npm run android:prepare` roda duas coisas, ambas idempotentes:
`scripts/make-icons.mjs` (copia os PNGs de `resources/` e escreve o adaptive icon) e
`scripts/apply-android.mjs` (manifesto, `strings.xml`, `versionCode`/`versionName`).
Rode de novo sempre que fizer `cap sync`.

## 3. Ícone e tela de abertura

Os PNGs já existem — você não precisa converter nada:

- `resources/android/mipmap-{mdpi,hdpi,xhdpi,xxhdpi,xxxhdpi}/ic_launcher.png` (48→192 px)
- `.../ic_launcher_round.png` e `.../ic_launcher_foreground.png` (adaptive icon, 81→432 px)
- `resources/android/drawable-{mdpi,hdpi,xhdpi,xxhdpi}/splash.png` (9:16, CENTER_CROP)
- `resources/play/store-icon-512.png` → é este que vai em **Presença na loja → Ícone**

O `scripts/make-icons.mjs` ainda escreve `mipmap-anydpi-v26/ic_launcher.xml` (com camada
`<monochrome>`, para o ícone temático do Android 13+ não ficar em branco) e a cor de fundo
`values/ic_launcher_background.xml`.

Se um dia trocar o desenho do ícone, regenere assim:

```bash
node scripts/serve.mjs 8124 .
# abra http://localhost:8124/tools/icons-render.html  (renderiza tudo no navegador)
```
Salve `window.ICON_PAYLOAD` em `resources/android/_payload.json` e rode `npm run icons`.

## 4. Testar no aparelho antes de publicar

```bash
npm run android:sync && npm run android:prepare
cd android && gradlew.bat installDebug
```

Checklist (faça de verdade, com o celular):

- [ ] Abrir, escolher uma ilustração, pintar todas as regiões e ver a tela de vitória.
- [ ] **Pintar de novo** limpa o desenho e deixa repintar (não reabre já concluído).
- [ ] Fechar o app no meio de um desenho e reabrir: as áreas pintadas continuam lá.
- [ ] Modo Guia x Modo Livre; desfazer; reiniciar; dica (custa estrelinhas).
- [ ] Zoom, números, volume, vibração.
- [ ] Pack bloqueado: diálogo com as três saídas (estrelas / anúncio / remover anúncios).
- [ ] Presente diário libera uma vez por dia.
- [ ] **Só um espaço de anúncio por tela**: banner embaixo e nada de moldura "Publicidade"
      vazia em cima dele (a Política para Famílias proíbe duas colocações na mesma tela).
- [ ] Nenhum anúncio aparece sozinho no meio da pintura; o intersticial (se ligado) só vem
      depois de você tocar em sair da tela de vitória.
- [ ] **Modo avião**: o jogo inteiro funciona; anúncios somem sem travar nada.
- [ ] Botão voltar do Android: fecha modal → volta à galeria → sai do app.
- [ ] Celular com notch/barra de navegação por gesto: o topo da barra não fica sob o sistema.
- [ ] Tablet e celular pequeno (360×640) sem cortes.

## 5. Gerar o AAB assinado

1. Android Studio → **Build → Generate Signed Bundle / APK → Android App Bundle**.
2. Crie um **keystore novo** e guarde a senha fora do computador. **Perder essa chave = nunca
   mais atualizar o app.** De preferência marque **Play App Signing** (o Google guarda a chave
   de assinatura e você consegue recuperar com uma de upload).
3. Selecione `release`. Saída: `android/app/build/outputs/bundle/release/app-release.aab`.
4. Confira o tamanho: poucos MB (o jogo é código; o que pesa é o SDK de anúncios).

```bash
npm run android:build
```

## 6. Ficha na Play Console

### 6.1 Público e conteúdo — a decisão que falta

Em **App conteúdo → Público-alvo e conteúdo**:

**Caminho A — "Sim, dirigido a crianças"** (Families). Obriga:
- SDK de anúncios auto-certificado para Families — o Google Mobile Ads está na lista ✅;
- sem anúncios personalizados — `ads.js` só monta o bloco `initializeForChildren` quando
  `childDirected: true`, então marque essa opção em `www/js/config.js` ⚠️;
- anúncio claramente separado do conteúdo, e vídeo de recompensa **opcional e fechável em 5 s** ✅;
- **uma única colocação de anúncio por tela** ✅ (corrigido em `ads.js`);
- `interstitialsEnabled: false` em `www/js/config.js` ⚠️;
- categoria: *Educational* ou *Art & Design* (as permitidas para infantil com anúncios);
- questionário de auto-certificação da Families (ele aparece depois de marcar "sim").

**Caminho B — público 13+ / não dirigido a crianças.** Libera intersticial e anúncios
personalizados → mais receita por impressão. **É assim que o projeto está hoje**:
`childDirected: false` + `interstitialsEnabled: true`, porque a declaração escolhida foi
"para todos os públicos". O intersticial continua só depois de um toque na tela de vitória.

Mas o app tem castelo, estrela e bichinhos: se a Google julgar que ele *apela* para criança, você
é obrigado a declarar Families de qualquer jeito, e a ficha pode ser rejeitada por "público
declarado incorretamente". Se isso acontecer, vire as duas chaves acima para o caminho A, refaça
o `npm run android:sync` e reenvie.

> Não existe meio-termo "todas as idades com crianças": ou você declara Families, ou assume o
> risco da reclassificação.

> Distribuir fora da Play ([APK.md](APK.md)) dispensa essa decisão, mas o `billing` precisa
> continuar `'none'` — o faturamento da Play não atende um APK instalado por outro canal.

### 6.2 Classificação de conteúdo
Questionário: responda "nenhum conteúdo" — não há violência, sexo, drogas, chat nem sorte.
Resultado esperado: **L / Todos**.

### 6.3 Formulário de segurança dos dados (Data Safety)

**Não declare "não coleta nada".** O AdMob está no binário e o Google publica a declaração
oficial dele — você é responsável pelo que o SDK faz, mesmo sem usar a função. Respostas que
batem com este build:

| Pergunta | Resposta |
|---|---|
| O app coleta dados? | **Sim** — pelo Google Mobile Ads SDK |
| Quais dados | Identificador de publicidade / IDs de dispositivo, endereço IP, interações com o app, diagnósticos/crash |
| Finalidade | Publicidade, análise, prevenção a fraude, segurança/manutenção do app |
| Coleta contínua | Sim (o SDK coleta enquanto o app roda) |
| Compartilhado com terceiros? | Sim — parceiros de anúncios (é o funcionamento do AdMob) |
| Criptografado em trânsito? | Sim |
| Usuário pode solicitar exclusão? | Sim — e-mail de suporte (e apagar dados do app no aparelho) |
| Compras no app | Sim — "Remover anúncios", não consumível; o Play Billing trata pagamento; declaramos dados de compra/pagamento para "Funcionalidade do app" |
| Dados de crianças? | Sim, se o app for dirigido a crianças — só os do SDK de anúncios, sem cadastro |

Os dados do **jogo** (estrelas, desenhos pintados, preferências) ficam em `localStorage` e não
saem do aparelho: não entram como coleta. É exatamente o que `www/privacy.html` diz nos itens 2
e 4 — a equipe de revisão compara os dois textos, então mantenha-os coerentes.

### 6.4 Privacidade
Campo "Política de privacidade" exige **URL pública real** (não vale `file://` nem página dentro
do app). Já existe a pasta pronta para publicar:

```bash
npm run site     # gera site/privacidade.html, site/suporte.html, site/index.html
```

Três formas de colocar no ar (escolha uma):
1. **Netlify Drop** — arraste a pasta `site/` em app.netlify.com/drop, endereço em 20 s.
2. **GitHub Pages** — repositório público com a pasta `site/` na raiz.
3. **Qoder Sites** (deste ambiente) — se você autorizar a publicação, o endereço vem pronto.

Depois, cole a URL em `www/js/config.js` → `privacyUrl` e no campo da ficha. **O mesmo e-mail**
vai em `supportEmail` e nos dois `[SUBSTITUA...]` de `www/privacy.html` / `www/support.html`
(e rode `npm run site` de novo para atualizar a cópia publicada).

### 6.5 Descrição (pode copiar)
**Nome (30 caracteres):** `Traço & Tom: Pintura`
**Descrição curta (80):** `31 ilustrações originais para colorir por números. Offline, sem conta, para todas as idades.`
**Descrição completa:**

> Traço & Tom é um estúdio de pintura por números para todas as idades.
>
> **31 ilustrações originais** — castelos, unicórnio, dragão, sereia, borboleta, foguete, robô,
> cupcake e mais, organizadas em quatro packs: Jardim Mágico, Mar e Céus, Reino da Fantasia e
> Doces e Aventuras. Cada desenho é um vetor desenhado em código: nada de fotos, nada de arte
> gerada por inteligência artificial, nada de personagens de terceiros.
>
> **Como funciona** — escolha uma cor na paleta e toque nas áreas com o número correspondente.
> O Modo Guia não deixa errar; o Modo Livre deixa você pintar como quiser. Dica, desfazer,
> reiniciar e zoom com os dedos ou com a barra.
>
> **Progresso de verdade** — cada ilustração concluída rende estrelinhas, guarda no seu álbum e
> libera os próximos packs. O presente diário dá estrelas de graça uma vez por dia.
>
> **Feito para funcionar sem nada** — o jogo inteiro cabe no aparelho. Modo avião, metrô, sala
> de espera: nada quebra. O progresso fica salvo apenas no seu celular, sem cadastro, sem conta
> e sem servidor.
>
> **Conforto** — música e efeitos gerados no próprio aparelho, vibração opcional, alvos de toque
> grandes, suporte a "reduzir animações" e leitura de tela nos botões.
>
> Anúncios podem aparecer na parte inferior da tela de pintura. Você pode removê-los com uma
> compra única, que também libera todos os packs.

### 6.6 Capturas de tela
3–5 prints em **1080×1920** (retrato): galeria, mesa de pintura com metade colorida, tela de
vitória, configurações. Sem mockups e sem texto por cima em cima de botão — a Play rejeita
"captura enganosa", e no caminho Families isso é ainda mais rigoroso.

## 7. Enviar para revisão

1. **Teste interno** → crie um caminho, suba o `.aab`, adicione até 12 e-mails seus.
2. Espere o build processar (~15 min) e instale pelo link do teste interno.
3. Teste **os anúncios com IDs reais** e a compra com uma conta de teste (ver `MONETIZACAO.md`).
4. Só então envie para **Produção** → revisão.

Prazos típicos: 12–48 h para apps novos; com declaração Families, 3–7 dias.

Motivos de reprovação mais comuns neste tipo de jogo — e o estado de cada um aqui:

| Risco | Estado |
|---|---|
| URL de privacidade que não abre ou não cita o AdMob | `site/` pronto; falta publicar |
| Data Safety dizendo "não coleta" com AdMob no binário | corrigido em 6.3 — declare a coleta do SDK |
| Target API menor que 36 | resolvido (Capacitor 8 / SDK 36) |
| Ícone ou prints com personagens/marcas de terceiros | arte 100% original em código |
| Intersticial que interrompe a tarefa do usuário | desligado por padrão; só aparece em saída tocada pelo jogador |
| Duas colocações de anúncio na mesma tela | corrigido: o placeholder web não aparece junto do banner nativo |
| E-mail de suporte falso/inexistente | **em aberto — é com você** |
| IDs de teste do Google no binário de produção | **em aberto — é com você** |

## 8. Depois da aprovação

- Atualize `version` em `package.json` e `CONFIG.version` em `www/js/config.js` a cada release.
  `apply-android.mjs` converte isso em `versionCode` automaticamente.
- Ciclo de release: `npm run android:sync && npm run android:prepare && npm run android:build`.
- Ilustrações novas entram só em `www/js/art-library.js`; galeria, packs e contagens se ajustam.
- Se um dia a Google exigir API 37, basta atualizar o Capacitor e o SDK Platform no Studio —
  nada no jogo muda.

## 9. Auditoria feita em 14/10/2026

O que foi verificado no pacote e o que mudou:

- **Alvo de API**: projeto estava em Capacitor 7 (target SDK 35) → rejeição automática na Play
  desde 31/08/2026. Migrado para Capacitor 8 (`^8.5.3`, AdMob `^8.2.1`, minSdk 24, SDK 36).
- **Edge-to-edge (Android 15/16)**: cabeçalho e modais agora respeitam `safe-area-inset-top`,
  então a barra superior não fica sob o relógio/emblema do aparelho.
- **Anúncios**: intersticial automático 0,9 s depois da vitória removido; ele só toca quando o
  jogador sai da tela de vitória, e só se `interstitialsEnabled: true`. Placeholder web não
  aparece mais junto do banner nativo.
- **"Pintar de novo"**: reabria o desenho já concluído e mostrava a vitória outra vez; agora limpa
  as regiões pintadas antes de reabrir.
- **Permissões**: `INTERNET`, `ACCESS_NETWORK_STATE`, `VIBRATE` — nada de localização, câmera,
  contatos ou armazenamento externo. `usesCleartextTraffic="false"`, sem tráfego em texto puro.
- **Rede**: o app não chama nenhuma URL própria; os únicos links externos estão na página de
  política (Google) e não afetam o binário.
- **Peso e conteúdo**: `www/` tem 164 KB e 15 arquivos, sem imagens binárias, sem fontes
  remotas, sem analytics, sem crash reporting.
- **Cache/offline**: `sw.js` é rede-primeiro com fallback ao cache — atualização chega sem o
  usuário limpar nada, e o jogo fecha no modo avião.
- **Documentos internos**: `tools/` (validador de arte e gerador de ícones) ficou fora do
  `webDir`, então não vai dentro do APK.
- **Textos**: `support.html` dizia "funciona em paisagem e retrato" (o app é só retrato) e
  `privacy.html` afirmava uma declaração de público que ainda não foi feita; ambos corrigidos.
