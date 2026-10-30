import { cp, mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve, sep } from 'node:path';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
const workspace = process.cwd();
const output = resolve(workspace, '.deployment/current');
if (!output.startsWith(resolve(workspace, '.deployment') + sep))
  throw new Error('ตำแหน่งติดตั้งไม่ถูกต้อง');
const html = await readFile('dist/index.html');
let revision = 'uncommitted';
try {
  revision = execFileSync('git', ['rev-parse', 'HEAD'], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'ignore'],
  }).trim();
} catch {}
await mkdir(output, { recursive: true });
await cp('dist', output, { recursive: true, force: true });
const evidence = {
  environment: 'local-static',
  deployedAt: new Date().toISOString(),
  revision,
  indexSha256: createHash('sha256').update(html).digest('hex'),
  url: 'http://127.0.0.1:5190',
  note: 'เป็นการติดตั้งในเครื่องเท่านั้น ไม่ใช่หลักฐานการรัน GitHub Actions/CD',
};
await writeFile(resolve(output, 'deployment.json'), JSON.stringify(evidence, null, 2) + '\n');
console.log(JSON.stringify(evidence, null, 2));
