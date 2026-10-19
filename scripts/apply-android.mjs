/* Ajusta o projeto Android gerado pelo Capacitor (`npx cap add android`).
   Rode depois de `npm run android:sync`:  node scripts/apply-android.mjs
   Idempotente: pode rodar quantas vezes quiser. */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const cfg = JSON.parse(readFileSync(join(root, 'capacitor.config.json'), 'utf8'));
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));

const manifestPath = join(root, 'android/app/src/main/AndroidManifest.xml');
const gradlePath = join(root, 'android/app/build.gradle');
const stringsPath = join(root, 'android/app/src/main/res/values/strings.xml');

if (!existsSync(manifestPath)) {
  console.error('android/ ainda nao existe. Rode primeiro:  npx cap add android');
  process.exit(1);
}
/* Se o index.html nao foi copiado para dentro do projeto, o Capacitor abre e mostra
   apenas a tela de lancamento para sempre — entao isso e erro de build, nao aviso. */
const indexPath = join(root, 'android/app/src/main/assets/public/index.html');
if (!existsSync(indexPath)) {
  console.error('FALHOU: android/app/src/main/assets/public/index.html nao existe.');
  console.error('  Rode  npx cap sync android  antes desta linha (webDir = ' + (cfg.webDir || 'www') + ').');
  process.exit(1);
}

const ADMOB_ID = cfg.plugins?.AdMob?.appId || '';
/* As tags de anuncio so entram no manifest se o plugin nativo estiver instalado.
   Sem o plugin, <queries> e APPLICATION_ID sao peso morto e atrapalham a leitura. */
const hasAdMob = !!(pkg.dependencies && pkg.dependencies['@capacitor-community/admob']);
/* O SDK de anúncios lê APPLICATION_ID no abrir do app: se o valor for de UNIDADE (barra)
   em vez de APLICATIVO (til), ele mata o processo antes da primeira tela. */
if (hasAdMob && !/^ca-app-pub-\d+~\d+$/.test(ADMOB_ID)) {
  console.error('FALHOU: plugins.AdMob.appId em capacitor.config.json nao e um ID de APLICATIVO.');
  console.error('  esperado ca-app-pub-XXXXXXXX~YYYYYYYYYY (com til), encontrado: ' + (ADMOB_ID || '(vazio)'));
  process.exit(1);
}
const VERSION_NAME = pkg.version || '1.0.0';
const VERSION_CODE = Number(process.env.VERSION_CODE || (VERSION_NAME.split('.').reduce((a, p) => a * 100 + Number(p || 0), 0)));

let m = readFileSync(manifestPath, 'utf8');
const before = m;

/* permissoes necessarias — sempre antes de <application>, que é o único ponto
   do manifest onde <uses-permission> é filho direto de <manifest> */
for (const perm of ['android.permission.INTERNET', 'android.permission.ACCESS_NETWORK_STATE', 'android.permission.VIBRATE']) {
  if (m.includes(perm)) continue;
  m = m.replace(/(\s*<application)/, `\n    <uses-permission android:name="${perm}" />$1`);
  if (!m.includes(perm)) { console.error('FALHOU: nao deu para inserir ' + perm + ' no AndroidManifest.xml'); process.exit(1); }
}
/* AdMob: APPLICATION_ID dentro de <application> e <queries> para o navegador de publicidade */
if (hasAdMob && ADMOB_ID && !m.includes('com.google.android.gms.ads.APPLICATION_ID')) {
  m = m.replace(/<application/, `<application\n        android:usesCleartextTraffic="false"`);
  m = m.replace(/(<application[^>]*>)/, `$1\n        <meta-data\n            android:name="com.google.android.gms.ads.APPLICATION_ID"\n            android:value="${ADMOB_ID}" />`);
}
if (hasAdMob && !m.includes('com.google.android.gms.ads.intent.AD_VIEW')) {
  m = m.replace(/(<application)/, `    <queries>\n        <intent>\n            <action android:name="com.google.android.gms.ads.intent.AD_VIEW" />\n            <category android:name="android.intent.category.BROWSABLE" />\n            <data android:scheme="https" />\n        </intent>\n        <package android:name="com.google.android.gms" />\n    </queries>\n\n    $1`);
}
/* tela apenas retrato, como o manifest.webmanifest declara. O atributo entra colado
   dentro da tag <activity>: jogar texto depois do ">" deixaria o manifest malformado.
   Vale só para a MainActivity — os activities de terceiros (anúncios, file provider)
   precisam manter a orientação deles. */
if (!m.includes('android:screenOrientation="portrait"')) {
  const before2 = m;
  m = m.replace(/<activity\b[^>]*android:name="\.MainActivity"[^>]*>/, tag => {
    if (tag.includes('android:screenOrientation')) return tag;
    const comConfig = tag.replace(/android:configChanges="([^"]*)"/, 'android:configChanges="$1" android:screenOrientation="portrait"');
    return comConfig === tag ? comConfig.replace(/>$/, ' android:screenOrientation="portrait">') : comConfig;
  });
  if (m === before2) console.log('AVISO  nao achei <activity android:name=".MainActivity"> no manifest: a tela pode girar');
}
if (hasAdMob && !m.includes('com.google.android.gms.ads.APPLICATION_ID')) {
  console.error('FALHOU: o plugin do AdMob esta no package.json mas o APPLICATION_ID nao entrou no manifest.');
  console.error('  Sem essa tag o app morre antes de abrir a primeira tela. Confira se o AndroidManifest.xml');
  console.error('  gerado pelo Capacitor esta no formato esperado (tag <application ...> aberta).');
  process.exit(1);
}
if (m !== before) { writeFileSync(manifestPath, m); console.log('OK  AndroidManifest.xml'); }
else console.log('--  AndroidManifest.xml ja estava certo');

/* nome do app na launcher — o nome tem &, entao precisa escapar: senao o strings.xml
   vira XML malformado e o Gradle quebra no merge de recursos */
const xml = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
if (existsSync(stringsPath)) {
  let s = readFileSync(stringsPath, 'utf8');
  const want = `<string name="app_name">${xml(cfg.appName)}</string>`;
  if (!s.includes(want)) {
    s = s.replace(/<string name="app_name">[^<]*<\/string>/, want);
    writeFileSync(stringsPath, s);
    console.log('OK  strings.xml -> ' + cfg.appName);
  } else console.log('--  strings.xml ja estava certa');
}

/* versao do bundle */
if (existsSync(gradlePath)) {
  let g = readFileSync(gradlePath, 'utf8');
  g = g.replace(/versionCode\s+\d+/, 'versionCode ' + VERSION_CODE);
  g = g.replace(/versionName\s+"[^"]*"/, 'versionName "' + VERSION_NAME + '"');
  writeFileSync(gradlePath, g);
  console.log('OK  build.gradle -> versionCode ' + VERSION_CODE + ' / versionName ' + VERSION_NAME);
}

/* ícone e splash próprios: é o `npm run icons` que copia resources/android para dentro
   de res/. Se alguém rodar só o apply-android, o app sai com o logo do Capacitor. */
if (!existsSync(join(root, 'android/app/src/main/res/mipmap-anydpi-v26/ic_launcher.xml'))) {
  console.log('AVISO  res/ ainda tem o icone padrao do Capacitor. Rode:  npm run icons');
}

console.log('\nProximos passos:');
console.log('  1. confira android/app/src/main/AndroidManifest.xml');
console.log('  2. npm run android:open   (abre o Android Studio)');
console.log('  3. Build > Generate Signed Bundle > AAB');
