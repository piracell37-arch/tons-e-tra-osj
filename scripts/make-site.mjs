/* Monta a pasta site/ com o que precisa ir para a URL publica (politica de
   privacidade + suporte). Rode antes de publicar:  npm run site
   Depois é só arrastar site/ para Netlify/GitHub Pages/Qoder Sites. */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, 'site');
mkdirSync(out, { recursive: true });

/* Os arquivos publicados nao sao o app: tiramos o link "voltar ao jogo", que no
   site publico levaria a um HTML que nao existe la. */
const strip = html => html
  .replace(/\s*<a href="index\.html">[\s\S]*?<\/a>/g, '')
  .replace(/<\/footer>/, '</footer>');

const privacy = strip(readFileSync(join(root, 'www/privacy.html'), 'utf8'));
const support = strip(readFileSync(join(root, 'www/support.html'), 'utf8'));

writeFileSync(join(out, 'privacidade.html'), privacy);
writeFileSync(join(out, 'suporte.html'), support);
/* Se um APK for colocado dentro de site/ com o nome app.apk, a pagina oficial
   ganha o botao de download — serve de endereço público para distribuir fora da Play. */
const apkLink = existsSync(join(out, 'app.apk'))
  ? '<a href="app.apk">Baixar o jogo (APK)</a>\n' : '';
writeFileSync(join(out, 'index.html'), `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>Traço &amp; Tom — Colorir por Números</title>
<style>
  body{margin:0;padding:48px 18px;background:#f4f1e8;color:#22314a;font:16px/1.7 -apple-system,"Segoe UI",Roboto,Arial,sans-serif;text-align:center}
  h1{font-size:26px;color:#203a5c;margin:0 0 6px}
  p{color:#5b6b86;margin:6px 0 26px}
  a{display:inline-block;margin:6px;padding:14px 22px;border-radius:14px;background:#203a5c;color:#fff;font-weight:700;text-decoration:none}
</style>
</head>
<body>
<h1>Traço &amp; Tom — Colorir por Números</h1>
<p>Página oficial do desenvolvedor.</p>
<a href="privacidade.html">Política de Privacidade</a>
<a href="suporte.html">Suporte</a>
${apkLink}</body>
</html>
`);

console.log('OK  site/ gerado: privacidade.html, suporte.html, index.html');
console.log('    publique a pasta e use a URL final em www/js/config.js -> privacyUrl');
