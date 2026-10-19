# Distribuir o Traço & Tom como APK (fora da Google Play)

A conta de desenvolvedor da Play custa US$ 25. Sem ela você ainda publica o jogo, só que por
conta própria. Este documento é o caminho e o que muda.

## 1. O que muda quando você distribui o APK

| Coisa | Na Play | No APK distribuído por você |
|---|---|---|
| Custo | US$ 25 (único, até 100 apps) | zero |
| Revisão da Google | sim, 12 h a 7 dias | não existe |
| **AdMob (anúncios)** | funciona | **funciona igual** — a conta AdMob é grátis, não depende da Play |
| **Compra "remover anúncios"** | Google Play Billing | **não funciona**: o faturamento do Google só atende app instalado pela Play |
| Formulário Data Safety | obrigatório | não se aplica |
| Política de privacidade | obrigatória na ficha | continua obrigatória — o AdMob exige URL pública (já publicada) |
| Instalação no celular | botão Instalar | usuário ativa "instalar apps desconhecidos" e o Android mostra aviso do Play Protect |
| Atualização | automática pela loja | você sobe o arquivo novo e avisa |

**Isto já está ajustado no [`www/js/config.js`](../www/js/config.js)** para a rota do APK:

```js
billing: 'none'            // a compra some da tela, porque Play Billing não atende app fora da Play
childDirected: false       // você declarou "para todos os públicos"
interstitialsEnabled: true // intersticial volta a valer — mas só depois de um toque na tela de vitória
```

Com `none`, o jogo esconde os botões *Comprar* e *Restaurar compra* e a saída "Remover anúncios"
do diálogo de desbloqueio — senão o jogador esbarra num botão que não pode funcionar. A
monetização passa a ser banner + vídeo recompensado + intersticial, e os packs se liberam por
estrelinhas ou anúncio, como sempre. Se um dia você voltar para a Play, troque `billing` para
`'play'` e, quiser o selo da Família, `childDirected` para `true` (aí o intersticial deve dormir
de novo).

## 2. Gerar o APK agora

```bash
cd C:\Users\mathe\Documents\Qoder\2026-10-14\79223b07\atelie-playstore
npm install
npm run android:add
npm run android:sync
npm run android:prepare
npm run android:apk
```

O arquivo sai em `android\app\build\outputs\apk\debug\app-debug.apk`. Copie para o celular e
toque nele para instalar.

**`npm run android:apk` gera o APK de *debug*.** É o caminho mais rápido e serve para testar de
verdade, mas tem dois problemas para distribuir: o Android Studio marca o app como depurável
(qualquer um abre o código dele) e o Play Protect reclama com mais força. Para soltar para outras
pessoas, faça o assinado abaixo.

### Se o app abrir e ficar parado na tela de lançamento

Tela branca com o logo no meio, sem botão nenhum respondendo, é o Capacitor esperando a página
carregar — quase sempre porque **o `www/` não foi copiado para dentro do APK**, não porque o jogo
esteja quebrado. Os três pontos que já derrubaram um build aqui:

1. **Ordem dos comandos.** A sequência é sempre `npx cap add android` → `npm run android:sync`
   (copia `www/` para `android/app/src/main/assets/public`) → `npm run android:prepare`
   (gera ícone/splash dentro de `res/` e ajusta o manifest). O `icons` precisa do `android/` já
   criado, e o `cap sync` não sabe nada sobre os nossos PNGs. Trocar essa ordem rende APK sem
   bundle dentro — que é exatamente a tela congelada.
2. **`APPLICATION_ID` do AdMob ausente do `AndroidManifest`.** Foi o que derrubou o APK de
   v2.0.0: o build rodou `cap add` + `cap sync` + Gradle e pulou o `npm run android:prepare`,
   então a tag nunca entrou. O SDK de anúncios lê essa tag assim que o processo nasce e, sem ela,
   morre antes de pintar o primeiro frame — a tela fica parada no logo. Conferir:
   `grep APPLICATION_ID android/app/src/main/AndroidManifest.xml`. O `prepare` agora falha alto se
   a tag não entrar e o workflow do GitHub repete a checagem antes do Gradle.
3. **O arquivo do GitHub Actions precisa começar com `#`.** YAML não aceita comentário `/* */`;
   com isso na primeira linha o workflow é rejeitado e você baixa um artefato que nunca
   foi construído (ou nenhum artefato).
4. **Plugin sobrando no caminho da abertura.** `@capacitor/splash-screen` segura a tela de
   lançamento até o JavaScript mandar esconder; se o JS não chega lá, o app congela ali para
   sempre e você nunca vê o erro. Ele está fora do bundle desde a v2.0.3 justamente para o app
   abrir primeiro — o `#boot-error` de `app.js` só tem chance de aparecer sem ele.

Para conferir o APK antes de instalar (funciona no Linux/macOS; no Windows use o
[7-Zip](https://www.7-zip.org/) e abra `assets/public/`):

```bash
unzip -l app-debug.apk | grep assets/public/index.html
```

Se não listar nada, o bundle está fora — refaça o `cap sync`. Se listar e mesmo assim congelar,
ligue o app com o celular no cabo USB e rode `adb logcat *:E`: o Capacitor escreve ali o motivo.

## 3. APK de release assinado (para distribuir de verdade)

1. Crie a chave **uma vez** e guarde fora do computador — sem ela você não assina a próxima
   versão e quem instalou a antiga não consegue atualizar por cima:

   ```bash
   keytool -genkeypair -v -keystore traco-e-tom.jks -alias traco -keyalg RSA -keysize 2048 -validity 10000
   ```

   `keytool` vem com o Android Studio (`.../jbr/bin/keytool.exe`). **Não coloque o `.jks` nem as
   senhas dentro da pasta do projeto nem no git.**

2. Cole em `android/app/build.gradle`, dentro do bloco `android { ... }`:

   ```groovy
   signingConfigs {
       release {
           storeFile file(System.env.TRACO_KEYSTORE)
           storePassword System.env.TRACO_STORE_PASSWORD
           keyAlias System.env.TRACO_KEY_ALIAS
           keyPassword System.env.TRACO_KEY_PASSWORD
       }
   }
   buildTypes {
       release {
           signingConfig signingConfigs.release
           minifyEnabled false
       }
   }
   ```

   As senhas vêm de variáveis de ambiente, então nada fica escrito no código.

3. Gere:

   ```bash
   set TRACO_KEYSTORE=C:\caminho\seguro\traco-e-tom.jks
   set TRACO_KEY_ALIAS=traco
   set TRACO_STORE_PASSWORD=sua-senha
   set TRACO_KEY_PASSWORD=sua-senha
   npm run android:apk:release
   ```

   Saída: `android\app\build\outputs\apk\release\app-release.apk`.

   Alternativa sem terminal: Android Studio → **Build → Generate Signed Bundle / APK → APK** →
   escolha o keystore → `release`.

## 4. Onde colocar o arquivo para as pessoas baixarem

- **Seu próprio site.** A mesma página publicada do Traço & Tom serve de endereço de download:
  copie o APK para `site/app.apk`, rode `npm run site` (o botão *Baixar o jogo (APK)* aparece
  sozinho na página) e republique a pasta `site/`. Posso fazer a republicação para você.
- **Lojas alternativas gratuitas:** Galaxy Store (Samsung) e Amazon Appstore não cobram registro.
  A Amazon tem faturamento próprio — dá para vender a remoção de anúncios lá, mas exige trocar o
  plugin de compra pelo SDK da Amazon.
- **Aptoide / Uptodown:** aceitam APK sem custo, com página e contador de downloads.
- Grupo de WhatsApp/Telegram, link no Drive — funciona, mas o aviso do Play Protect assusta mais.

## 5. Testes mínimos antes de mandar para alguém

- [ ] Instalar num aparelho com Android 7.0 (API 24) ou mais novo.
- [ ] Pintar um desenho inteiro, fechar, reabrir: o progresso continua.
- [ ] Modo avião: o jogo funciona e nenhum anúncio trava a tela.
- [ ] Com internet: o banner aparece uma vez na mesa de pintura e o vídeo de recompensa libera o
      pack bloqueado. (Só vale depois de instalar o plugin do AdMob — ver
      [MONETIZACAO.md](MONETIZACAO.md) §1; sem ele, o app roda sem anúncio nenhum.)
- [ ] Configurações: sem botão de compra (com `billing: 'none'`) e sem texto prometendo algo que
      não funciona.
- [ ] Rodar com os **IDs reais do AdMob**, não os de teste — ID de teste nunca gera receita.

## 6. Quando você pagar a conta da Play depois

Nada do trabalho se perde: o mesmo projeto gera o AAB (seção 5 de
[PLAY-STORE.md](PLAY-STORE.md)), é só voltar `billing` para `'play'`, criar o produto não
consumível `remove_ads_once` e enviar o AAB. Quem instalou o APK precisa desinstalar para instalar
pela loja (assinaturas diferentes), então avise.
