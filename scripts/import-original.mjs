// One-time, pinned import in GitHub Actions. No secrets or original-repo writes.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pipeline } from 'node:stream/promises';
import { Readable } from 'node:stream';
import { execFileSync } from 'node:child_process';

const source = '8ef6cc91f1fb686467b7725089d5485d393580ff';
const root = process.cwd();
if (fs.existsSync('.v2/imported.json')) {
  console.log('Original content already stored in this independent repository.');
  process.exit(0);
}
const overrides = JSON.parse(fs.readFileSync('.v2/overrides.json', 'utf8'));
const saved = new Map(overrides.map(file => [file, fs.readFileSync(file)]));
const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'kiran-v2-import-'));
try {
  const archive = path.join(temp, 'source.tar.gz');
  const response = await fetch(`https://codeload.github.com/Kiran-ZQR/kiranzhang-portfolio/tar.gz/${source}`, { signal: AbortSignal.timeout(15 * 60 * 1000) });
  if (!response.ok) throw new Error(`Pinned source download failed: ${response.status}`);
  await pipeline(Readable.fromWeb(response.body), fs.createWriteStream(archive));
  const unpacked = path.join(temp, 'source');
  fs.mkdirSync(unpacked);
  execFileSync('tar', ['-xzf', archive, '-C', unpacked, '--strip-components=1'], { stdio: 'inherit' });
  // Archive has no .git. Keep the new repository's identity, workflows and v2 state.
  for (const entry of fs.readdirSync(unpacked)) {
    if (['.git', '.github', '.v2'].includes(entry)) continue;
    fs.cpSync(path.join(unpacked, entry), path.join(root, entry), { recursive: true, force: true });
  }
  for (const [file, bytes] of saved) {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, bytes);
  }
  fs.mkdirSync('.v2', { recursive: true });
  fs.writeFileSync('.v2/imported.json', JSON.stringify({ repository: 'Kiran-ZQR/kiranzhang-portfolio', commit: source, importedAt: new Date().toISOString() }, null, 2));
  console.log('Original assets, source and content imported; v2 overrides restored.');
} finally {
  fs.rmSync(temp, { recursive: true, force: true });
}
