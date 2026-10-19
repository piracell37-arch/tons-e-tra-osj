/* Servidor estatico minimo para desenvolver sem instalar nada.
   Jogo:      node scripts/serve.mjs            -> http://localhost:8123
   Validador: node scripts/serve.mjs 8124 .     -> http://localhost:8124/tools/art-check.html */
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize, resolve } from 'node:path';

const root = resolve(process.argv[3] || 'www');
const port = Number(process.argv[2] || 8123);
const types = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.webmanifest': 'application/manifest+json',
};

createServer(async (req, res) => {
  const url = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  const file = normalize(join(root, url === '/' ? '/index.html' : url));
  if (!file.startsWith(root)) { res.writeHead(403).end('proibido'); return; }
  try {
    const body = await readFile(file);
    res.writeHead(200, { 'content-type': types[extname(file)] || 'application/octet-stream', 'cache-control': 'no-store' });
    res.end(body);
  } catch {
    res.writeHead(404).end('nao encontrado');
  }
}).listen(port, () => console.log(`servindo ${root} em http://localhost:${port}`));
