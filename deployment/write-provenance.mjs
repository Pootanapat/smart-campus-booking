import { writeFile } from 'node:fs/promises';
const data = {
  environment: 'github-pages',
  revision: process.env.GITHUB_SHA,
  repository: process.env.GITHUB_REPOSITORY,
  runId: process.env.GITHUB_RUN_ID,
  builtAt: new Date().toISOString(),
};
if (!data.revision || !data.repository || !data.runId)
  throw new Error('ไม่พบข้อมูลกำกับการสร้างจาก GitHub');
await writeFile('dist/deployment.json', JSON.stringify(data, null, 2) + '\n');
