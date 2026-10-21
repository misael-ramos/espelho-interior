// Servidor para testar o app no seu computador, sem precisar da Vercel.
// Uso: crie o arquivo .env (veja .env.example) e rode `npm run dev`.
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Readable } from 'node:stream';

try { process.loadEnvFile('.env'); } catch { console.log('Sem arquivo .env: a leitura usará o modo básico.'); }
const { POST } = await import('./api/leitura.js');

const raiz = fileURLToPath(new URL('.', import.meta.url));
const tipos = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.json': 'application/json' };
const porta = Number(process.env.PORT || 3000);

http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  if (url.pathname === '/api/leitura' && req.method === 'POST') {
    const ctl = new AbortController();
    res.on('close', () => ctl.abort());
    const request = new Request(url, { method: 'POST', headers: req.headers, body: Readable.toWeb(req), duplex: 'half', signal: ctl.signal });
    const resposta = await POST(request);
    res.writeHead(resposta.status, Object.fromEntries(resposta.headers));
    if (resposta.body) Readable.fromWeb(resposta.body).on('error', () => res.end()).pipe(res);
    else res.end();
    return;
  }
  const caminho = normalize(join(raiz, url.pathname === '/' ? 'index.html' : decodeURIComponent(url.pathname)));
  if (!caminho.startsWith(raiz) || caminho.includes('node_modules') || caminho.endsWith('.env')) { res.writeHead(404).end(); return; }
  try {
    const arquivo = await readFile(caminho);
    res.writeHead(200, { 'Content-Type': tipos[extname(caminho)] || 'application/octet-stream' }).end(arquivo);
  } catch {
    res.writeHead(404).end('Não encontrado');
  }
}).listen(porta, () => console.log(`Espelho Interior rodando em http://localhost:${porta}`));
