/* Gera os recursos de Android (icones, splash e adaptive icon) a partir de resources/.
   Use depois de `npm run android:sync` e antes de abrir o Android Studio:
     npm run icons
   Idempotente. Sem dependencias nativas: so expande o payload PNG e copia.

   Para recriar o payload (quando o desenho do icone mudar):
     1. node scripts/serve.mjs 8124 .
     2. abra http://localhost:8124/tools/icons-render.html
     3. salve window.ICON_PAYLOAD em resources/android/_payload.json
        (no DevTools: copy(window.ICON_PAYLOAD) e cole num arquivo) */
import { readFileSync, writeFileSync, existsSync, mkdirSync, rmSync, readdirSync, statSync, copyFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, relative } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const res = join(root, 'resources');
const payload = join(res, 'android', '_payload.json');
const androidRes = join(root, 'android/app/src/main/res');

/* 1. expande o payload JSON { "caminho.png": "base64" } em resources/ */
if (existsSync(payload)) {
  let map = JSON.parse(readFileSync(payload, 'utf8'));
  /* o arquivo pode ter sido salvo pelo navegador como string JSON dupla */
  if (typeof map === 'string') map = JSON.parse(map);
  let n = 0;
  for (const [rel, b64] of Object.entries(map)) {
    if (rel.includes('..') || rel.startsWith('/')) throw new Error('caminho invalido no payload: ' + rel);
    const out = join(res, rel);
    mkdirSync(dirname(out), { recursive: true });
    writeFileSync(out, Buffer.from(b64, 'base64'));
    n++;
  }
  rmSync(payload);
  console.log('OK  payload expandido em resources/ (' + n + ' PNGs)');
}

if (!existsSync(join(res, 'android'))) {
  console.error('resources/android nao existe. Gere o payload primeiro (veja o cabecalho deste script).');
  process.exit(1);
}

/* 2. adaptive icon (Android 8+) — fundo cor pura + primeiro plano recortado */
const XML = (name) => `<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@color/ic_launcher_background" />
    <foreground android:drawable="@mipmap/${name}" />
    <monochrome android:drawable="@mipmap/${name}" />
</adaptive-icon>
`;

function walk(dir, base = '') {
  const out = [];
  for (const e of readdirSync(dir)) {
    const rel = base ? base + '/' + e : e;
    if (statSync(join(dir, e)).isDirectory()) out.push(...walk(join(dir, e), rel));
    else out.push(rel);
  }
  return out;
}

const files = walk(join(res, 'android'));
if (!files.length) { console.error('resources/android esta vazio.'); process.exit(1); }

if (!existsSync(androidRes)) {
  console.error('android/ ainda nao existe. Rode primeiro:  npm run android:add && npm run android:sync');
  console.error('Os PNGs continuam guardados em resources/android/.');
  process.exit(1);
}

/* 3. copia tudo para android/app/src/main/res */
let copied = 0;
for (const rel of files) {
  if (rel.startsWith('play/')) continue;
  const dest = join(androidRes, rel);
  mkdirSync(dirname(dest), { recursive: true });
  copyFileSync(join(res, 'android', rel), dest);
  copied++;
}
console.log('OK  ' + copied + ' PNGs copiados para android/app/src/main/res');

/* 4. escreve os XML e a cor de fundo que o adaptive icon referencia */
mkdirSync(join(androidRes, 'mipmap-anydpi-v26'), { recursive: true });
writeFileSync(join(androidRes, 'mipmap-anydpi-v26/ic_launcher.xml'), XML('ic_launcher_foreground'));
writeFileSync(join(androidRes, 'mipmap-anydpi-v26/ic_launcher_round.xml'), XML('ic_launcher_foreground'));

mkdirSync(join(androidRes, 'values'), { recursive: true });
const colorsPath = join(androidRes, 'values/ic_launcher_background.xml');
if (!existsSync(colorsPath)) {
  writeFileSync(colorsPath, `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="ic_launcher_background">#17304F</color>
</resources>
`);
}
console.log('OK  adaptive icon (mipmap-anydpi-v26) + cor de fundo');

const storeIcon = join(res, 'play', 'store-icon-512.png');
console.log('\nProximos passos:');
console.log('  - Play Console > Presenca na loja > Icone: use ' + relative(root, storeIcon).replace(/\\/g, '/'));
console.log('  - confira android/app/src/main/AndroidManifest.xml (ic_launcher / ic_launcher_round ja existem no template)');
