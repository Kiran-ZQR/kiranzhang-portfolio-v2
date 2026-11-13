import fs from 'node:fs';
import path from 'node:path';
const home = fs.readFileSync('index.html', 'utf8');
const errors = [];
for (const marker of ['aria-label="kiranzhang"', 'id="loader"', 'id="projects"', 'id="contact"', 'assets/js/v2.js']) {
  if (!home.includes(marker)) errors.push(`Missing homepage requirement: ${marker}`);
}
// Follow actual source/href attributes, not inactive source-template asset manifests.
for (const file of fs.readdirSync('.').filter(x => x.endsWith('.html'))) {
  const html = fs.readFileSync(file, 'utf8');
  for (const [, url] of html.matchAll(/(?:src|href)=["']([^"']+)["']/g)) {
    if (/^(?:#|https?:|mailto:|data:|tel:|javascript:)/i.test(url) || url.includes('${')) continue;
    const target = decodeURIComponent(url.split(/[?#]/)[0]);
    if (target && !fs.existsSync(path.resolve(target))) errors.push(`${file}: ${target}`);
  }
}
if (errors.length) { console.error([...new Set(errors)].join('\n')); process.exitCode = 1; }
else console.log('V2 homepage requirements and all root-page local links/assets passed.');
