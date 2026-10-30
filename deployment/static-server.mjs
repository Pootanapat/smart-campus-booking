import { createServer } from 'node:http';
import { readFile, realpath, stat } from 'node:fs/promises';
import { resolve, sep, extname } from 'node:path';
import { pathToFileURL } from 'node:url';
export const securityHeaders = {
  'Content-Security-Policy':
    "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'",
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'no-referrer',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
};
const mime = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.webmanifest': 'application/manifest+json',
  '.svg': 'image/svg+xml',
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
};
export function createStaticServer(directory, basePath = '/') {
  if (!basePath.startsWith('/') || !basePath.endsWith('/') || basePath.split('/').includes('..'))
    throw new Error('Invalid mount path');
  const root = resolve(directory);
  return createServer(async (req, res) => {
    for (const [name, value] of Object.entries(securityHeaders)) res.setHeader(name, value);
    res.setHeader('Cache-Control', 'no-store');
    if (!['GET', 'HEAD'].includes(req.method)) {
      res.writeHead(405, { Allow: 'GET, HEAD' });
      res.end();
      return;
    }
    try {
      let pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
      if (basePath !== '/') {
        if (!pathname.startsWith(basePath)) {
          res.writeHead(404);
          res.end('Not found');
          return;
        }
        pathname = pathname.slice(basePath.length - 1);
      }
      const parts = pathname.split('/');
      if (
        pathname.includes('\0') ||
        pathname.includes('\\') ||
        parts.some((p) => p === '..' || p.startsWith('.'))
      ) {
        res.writeHead(403);
        res.end('Forbidden');
        return;
      }
      let file = resolve(root, `.${pathname}`);
      if (file !== root && !file.startsWith(root + sep)) {
        res.writeHead(403);
        res.end('Forbidden');
        return;
      }
      try {
        if ((await stat(file)).isDirectory()) file = resolve(file, 'index.html');
      } catch {
        if (extname(file)) {
          res.writeHead(404);
          res.end('Not found');
          return;
        }
        file = resolve(root, 'index.html');
      }
      const actual = await realpath(file);
      const actualRoot = await realpath(root);
      if (!actual.startsWith(actualRoot + sep)) {
        res.writeHead(403);
        res.end('Forbidden');
        return;
      }
      const content = await readFile(actual);
      res.setHeader('Content-Type', mime[extname(actual)] ?? 'application/octet-stream');
      res.writeHead(200);
      res.end(req.method === 'HEAD' ? undefined : content);
    } catch (error) {
      res.writeHead(error instanceof URIError ? 400 : 404);
      res.end('Not found');
    }
  });
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const arg = (name) => process.argv[process.argv.indexOf(name) + 1];
  const root = process.argv.includes('--root') ? arg('--root') : '.deployment/current';
  const port = Number(process.argv.includes('--port') ? arg('--port') : 5190);
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('Invalid port');
  createStaticServer(root).listen(port, '127.0.0.1', () =>
    console.log(`Static deployment: http://127.0.0.1:${port} (root: ${root})`),
  );
}
