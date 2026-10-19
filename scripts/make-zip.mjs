/* Empacota o projeto num .zip pronto para jogar no GitHub (Add file > Upload files),
   onde o workflow .github/workflows/apk.yml compila o APK sem você instalar nada.

     node scripts/make-zip.mjs [saida.zip]

   Separador POSIX de propósito: o Compress-Archive do PowerShell grava "pasta\arquivo"
   e o importador do GitHub pode ler isso como um nome de arquivo plano. */
import { readFileSync, writeFileSync, readdirSync, statSync, mkdirSync } from 'node:fs';
import { deflateRawSync } from 'node:zlib';
import { fileURLToPath } from 'node:url';
import { dirname, join, posix, resolve } from 'node:path';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const out = resolve(process.argv[2] || join(root, '..', 'traco-e-tom-para-apk.zip'));
const SKIP_NAMES = new Set(['android', 'ios', 'node_modules', '.git', '.gradle', '.qoder']);

const files = [];
(function walk(dir, base) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const rel = base ? posix.join(base, e.name) : e.name;
    /* só o android/node_modules da raiz ficam de fora — resources/android precisa entrar */
    if (!base && SKIP_NAMES.has(e.name)) continue;
    if (e.name.endsWith('.qoder.site') || e.name.endsWith('.zip')) continue;
    const abs = join(dir, e.name);
    if (e.isDirectory()) walk(abs, rel);
    else if (e.isFile()) files.push({ abs, rel });
  }
})(root, '');

const now = new Date();
const dosTime = (now.getHours() << 11) | (now.getMinutes() << 5) | Math.floor(now.getSeconds() / 2);
const dosDate = ((now.getFullYear() - 1980) << 9) | ((now.getMonth() + 1) << 5) | now.getDate();

const crcTable = (() => {
  const t = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[i] = c >>> 0;
  }
  return t;
})();
const crc32 = buf => {
  let c = 0xffffffff;
  for (const b of buf) c = crcTable[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
};

const local = [], central = [];
let offset = 0;
for (const f of files) {
  const name = Buffer.from(f.rel, 'utf8');
  const data = readFileSync(f.abs);
  const raw = deflateRawSync(data, { level: 9 });
  const crc = crc32(data);

  const lh = Buffer.alloc(30);
  lh.writeUInt32LE(0x04034b50, 0); lh.writeUInt16LE(20, 4); lh.writeUInt16LE(0x0800, 6);
  lh.writeUInt16LE(8, 8); lh.writeUInt16LE(dosTime, 10); lh.writeUInt16LE(dosDate, 12);
  lh.writeUInt32LE(crc, 14); lh.writeUInt32LE(raw.length, 18); lh.writeUInt32LE(data.length, 22);
  lh.writeUInt16LE(name.length, 26);
  local.push(lh, name, raw);

  const cd = Buffer.alloc(46);
  cd.writeUInt32LE(0x02014b50, 0); cd.writeUInt16LE(20, 4); cd.writeUInt16LE(20, 6);
  cd.writeUInt16LE(0x0800, 8); cd.writeUInt16LE(8, 10); cd.writeUInt16LE(dosTime, 12); cd.writeUInt16LE(dosDate, 14);
  cd.writeUInt32LE(crc, 16); cd.writeUInt32LE(raw.length, 20); cd.writeUInt32LE(data.length, 24);
  cd.writeUInt16LE(name.length, 28); cd.writeUInt32LE(0, 32); cd.writeUInt16LE(0, 34);
  cd.writeUInt32LE(0, 38); cd.writeUInt32LE(offset, 42);
  central.push(Buffer.concat([cd, name]));

  offset += lh.length + name.length + raw.length;
}

const cdBuf = Buffer.concat(central);
const eocd = Buffer.alloc(22);
eocd.writeUInt32LE(0x06054b50, 0);
eocd.writeUInt16LE(files.length, 8); eocd.writeUInt16LE(files.length, 10);
eocd.writeUInt32LE(cdBuf.length, 12); eocd.writeUInt32LE(offset, 16);

mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, Buffer.concat([...local, cdBuf, eocd]));
console.log('OK  ' + files.length + ' arquivos -> ' + out + ' (' + statSync(out).size + ' bytes)');
console.log('    abra github.com > seu repo > Add file > Upload files, e depois Actions > apk > Run workflow');
