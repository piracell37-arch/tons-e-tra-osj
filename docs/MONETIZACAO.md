# Monetização — AdMob + compra "remover anúncios"

O jogo usa três formatos de anúncio e uma compra única não consumível. Toda a lógica fica em
`www/js/ads.js`, que é **resilente**: no navegador/PWA, onde não existe plugin nativo, cada função
vira um no-op silencioso e o jogo continua 100% jogável.

## 1. Instalação

> **Estado atual (v2.0.4):** o `@capacitor-community/admob` está no `package.json` com os seus
> IDs reais. O `@capacitor/splash-screen` **não** entrou de propósito: ele segura a tela de
> lançamento até o JavaScript mandar esconder, então qualquer falha no abrir vira tela branca
> sem mensagem — foi exatamente assim que o build de v2.0.0 ficou congelado no logo.
> Se um dia quiser o splash personalizado de volta: `npm install @capacitor/splash-screen@8`.

```bash
npm install
npm run android:sync
npm run android:prepare    # escreve o APPLICATION_ID no AndroidManifest
```

- **`@capacitor-community/admob`** — banner, intersticial e vídeo recompensado.
- Ele exige o `com.google.android.gms.ads.APPLICATION_ID` no `AndroidManifest`;
  `npm run android:prepare` só escreve essa tag quando o plugin está listado em
  `package.json` (sem ele, o manifest fica limpo). **Pular o `prepare` mata o app no abrir**:
  sem a tag, o SDK de anúncios joga exceção antes da primeira tela. O script agora falha alto
  se a tag não entrar, e o workflow do GitHub confere o manifest antes do Gradle.
- O valor do `appId` tem que ser **ID de aplicativo** (`ca-app-pub-…~…`, com til). ID de unidade
  (com barra) também derruba o processo — `apply-android.mjs` recusa os dois formatos errados.
- A compra dentro do Google Play precisa de um plugin de cobrança (`@capacitor-community`
  / RevenueCat). Ele **não** está no bundle: distribuindo por APK fora da Play, o faturamento
  do Google não atende o app de qualquer forma, então `admob.billing` está como `'none'` e a
  interface de compra fica escondida.

## 2. Onde ficam os IDs

Tudo em **`www/js/config.js`** — hoje estão os **IDs de teste públicos do Google**, que nunca
mostram anúncio real e não geram receita:

```js
admob: {
  appId:        'ca-app-pub-3940256099942544~3347511713',  // ID do aplicativo
  banner:       'ca-app-pub-3940256099942544/6300978111',
  interstitial: 'ca-app-pub-3940256099942544/1033173771',
  rewarded:     'ca-app-pub-3940256099942544/5224283345',
}
```

Passos no AdMob (https://apps.admob.com):
1. **Apps > Adicionar app > Android** → nome "Traço & Tom", categoria *Educational*.
2. Copie o **ID do aplicativo** (`ca-app-pub-XXXX~YYYY`) para `admob.appId`.
   O mesmo valor precisa estar em `capacitor.config.json > plugins.AdMob.appId`, porque o
   `apply-android.mjs` escreve ele no `AndroidManifest.xml` (sem isso o SDK trava no Android 14+).
3. Crie três blocos: **Banner**, **Intersticial** e **Vídeo recompensado**, e cole os IDs no config.
4. **Nunca** clique nos próprios anúncios para "testar" — a conta é banida em minutos.

## 3. Como cada formato aparece no jogo

| Formato | Quando | Onde no código |
|---|---|---|
| Banner | sempre na mesa de pintura, nunca na galeria | `Ads.showBanner()` em `openDrawing` |
| Intersticial | ligado (`interstitialsEnabled: true`), mas **nunca sozinho**: só toca depois de o jogador tocar em *próximo / pintar de novo / início* na tela de vitória, a cada 3 ilustrações | `Ads.maybeInterstitial()` em `afterVictory()` |
| Recompensado | quando o jogador troca anúncio por estrelinhas (dica / destravar pack / presente) | `Ads.rewarded('cost')` |
| Compra única | remove banner + intersticial e libera os 4 packs — **só existe dentro da Play** (`billing: 'play'`); fora dela o botão fica oculto | `Store.state.premium` |

Nenhum anúncio aparece durante uma pintura em andamento nem bloqueia um toque, e a tela nunca tem
**duas** colocações de anúncio juntas (o placeholder web de teste fica oculto quando o banner
nativo existe): essas são as duas regras da Política para Famílias que mais derrubam app infantil.

## 4. Público infantil — o que o código faz hoje

`config.js` → `childDirected: false`, porque a declaração escolhida foi "para todos os públicos".
`ads.js` só injeta o bloco de tratamento infantil quando essa chave é `true`:

```js
initializeForChildren: { adTrackingEnabled: false, childDirectedTreatment: true,
                         taggedForUnderAgeOfConsent: false, maxAdContentRating: 'General' }
```

Com `childDirected: true` as consequências são:
- anúncios **não personalizados**, preenchimento menor e eCPM menor — é normal;
- o AdMob precisa estar **certificado para o Programa para Famílias** (o SDK atual está; não use
  adapters de terceiros sem certificação);
- na Play Console, o formulário de famílias exige que você confirme que o app **não** tem
  links de download, chat, e-mail ou push — este app não tem nenhum dos três;
- o intersticial tem de voltar para `interstitialsEnabled: false`.

Se você preferir não lidar com a revisão de famílias: declare o app como **não dirigido a crianças**
na Play Console e mantenha `childDirected: false` **e** `interstitialsEnabled: true`, como está —
é o intersticial que faz a receita subir, e ele continua proibido no caminho das famílias.
Anunciar para menores é a parte mais vigiada da Play — comece com `true` se for sua primeira
publicação. Mas cuidado: com arte de castelo, estrela e bichinhos, a Google pode entender que o
app apela para criança mesmo com a declaração 13+, e aí a ficha é rejeitada por público declarado
incorretamente.

## 5. A compra "remover anúncios"

1. Play Console > **Monetizar > Produtos no app > Produtos não consumíveis** → ID
   `remove_ads_once` (o mesmo de `admob.premiumProductId`), preço único, ativo.
2. Suba um **teste fechado** com uma conta de teste; só nesse caminho a compra funciona de verdade.
3. `Ads.purchasePremium()` procura um plugin de cobrança (`window.CdvPurchase.store`) quando
   existe; sem plugin, devolve `{ ok:false, reason:'billing-unavailable' }` e a interface mostra
   o aviso "compras indisponíveis neste aparelho" — o jogo nunca fica quebrado.
4. `Ads.restorePremium()` marca premium quando há recibo válido; o botão **Restaurar compra**
   nas Configurações chama essa função.

> Se você ainda não quer configurar cobrança, deixe assim: o botão aparece, avisa que não está
> disponível e os anúncios continuam. Dá para publicar e ir atrás da receita depois.

## 6. Receita esperada e alavancas

Com público infantil e anúncios não personalizados, conte com **US$ 0,50–2,50 de eCPM**.
Alavancas que valem a pena, nesta ordem:

1. **Recompensado** é o formato mais rentável aqui — o jogador *pede* o vídeo. Dê valor real à
   recompensa (destravar um pack inteiro vale mais que 3 dicas).
2. Banner na mesa de pintura rende estabilidade, mas **não** coloque banner na galeria: atrapalha
   a navegação e derruba a retenção.
3. Intersticial a cada 3 conclusões é o limite razoável. A cada 1 conclusão costuma gerar
   reprovação na revisão por "anúncio intrusivo".
4. Se a receita ficar baixa, o caminho é **menos anúncio e mais compra**, não mais anúncio.

## 7. Como o dinheiro chega na sua conta

São ** duas contas diferentes** e você precisa configurar as duas:

### 7.1 AdMob (banner, intersticial, recompensado)

Os anúncios são pagos pela infraestrutura de pagamentos do Google (o "perfil de pagamento" ligado
ao AdMob, o mesmo do AdSense). Em **AdMob → Pagamentos → Configurações de pagamento**:

1. **Perfil de pagamento**: nome e endereço exatamente como no seu documento/banco. No Brasil,
   pessoa física usa CPF; se tiver CNPJ, use o CNPJ e o nome da empresa.
2. **Informações fiscais**: questionário de impostos dos EUA (W-8BEN para pessoa física /
   W-8BEN-E para empresa). Como o pagador é a *Google Ireland Ltd* (não americana), em regra não
   há retenção na fonte para publicadores brasileiros — mas preencha o formulário mesmo assim,
   sem ele o Google não libera o primeiro pagamento.
3. **Verificação de identidade**: ao atingir ~US$ 10 de receita (ou antes do primeiro pagamento) o
   Google pede verificação — às vezes só telefone, às vezes um **cartão postal com PIN** enviado
   para o endereço cadastrado (2 a 4 semanas). Digite o PIN em *Verificar endereço*.
4. **Método de pagamento**: no Brasil o caminho é **transferência bancária internacional**
   (TED/ospd em reais para um banco brasileiro; não existe PIX nem boleto). A conta precisa estar
   no **mesmo nome** do perfil — conta de terceiro devolve o dinheiro. Se quiser receber em dólar,
   use uma conta em USD (Nomad, Husky, Remessa Conforme etc.) e informe o banco correspondente.
5. **Ciclo**: pagamento **mensal**. O fechamento é no último dia do mês e o dinheiro sai por volta
   do **dia 21 do mês seguinte**, desde que o saldo passe do **limiar de US$ 100**. Abaixo disso o
   saldo rola para o mês seguinte. O status aparece como *Pagamento processado* → alguns dias úteis
   até cair (o banco brasileiro faz o câmbio e cobra tarifa + IOF de 0,38%).

> Com `childDirected: true` o preenchimento é menos personalizado: espere US$ 0,50–2,50 de eCPM.
> Para chegar aos US$ 100 são dezenas de milhares de impressões — conte com meses, não semanas.

### 7.2 Google Play (a compra `remove_ads_once`)

A compra dentro do app é processada pelo faturamento do Play, então o dinheiro vem por **outra
conta**: **Play Console → Monetizar → Configurações de pagamento → Conta bancária** cria um
*Google Payments Merchant* (perfil fiscal separado do AdMob, também com W-8BEN e verificação).

- **Comissão do Google**: 15% sobre os primeiros US$ 1 milhão por ano de receita e 30% do que
  passar disso. O preço que você define é um preço *bruto*.
- **Ciclo**: pagamento mensal, cerca de **45 dias após o fim do mês** (o Play exige o período de
  estorno/devolução antes de liberar). Há limite mínimo de saque configurável (US$ 1–100) e o
  saldo acumula se não atingir.
- Impostos municipais (ISS) e renda ficam com você: guarde os relatórios mensais do Play e do
  AdMob e leve ao contador.

### 7.3 Ordem prática

1. Configure o **perfil AdMob** e o **merchant do Play** no mesmo dia em que criar a conta de
   desenvolvedor — a verificação por postal é o gargalo de semanas.
2. Publique com os IDs reais, sem esperar receita: o primeiro pagamento costuma vir muito depois.
3. Acompanhe em *AdMob → Relatórios* e *Play Console → Financeiro → Relatórios de ganhos*.

## 8. Testar sem gastar conta AdMob

```bash
npm start          # http://localhost:8123
# ?demo=1 faz Ads.rewarded() devolver true no navegador, para testar o fluxo de recompensa
http://localhost:8123/?demo=1
```

No aparelho com IDs de teste, o AdMob mostra o banner "Test mode" — é esperado e não gera
impressão válida. Antes de enviar para a Play, troque **todos** os IDs pelos seus.
