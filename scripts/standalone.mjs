import { readFileSync, writeFileSync } from 'node:fs';
const entry = new URL('../dist/index.html', import.meta.url);
let html = readFileSync(entry, 'utf8');
const script = html.match(/<script type="module" crossorigin src="([^"]+)"><\/script>/);
const style = html.match(/<link rel="stylesheet" crossorigin href="([^"]+)">/);
if (!script || !style) throw new Error('Cannot find build entries for standalone export');
const js = readFileSync(new URL(script[1], entry), 'utf8').replace(/<\/script/gi, '<\\/script');
const css = readFileSync(new URL(style[1], entry), 'utf8');
html = html
  .replace(script[0], () => `<script type="module">${js}</script>`)
  .replace(style[0], () => `<style>${css}</style>`);
const favicon = readFileSync(new URL('../public/favicon.svg', import.meta.url), 'utf8');
html = html.replace(
  'href="./favicon.svg"',
  () => `href="data:image/svg+xml,${encodeURIComponent(favicon)}"`,
);
writeFileSync(new URL('../dist/审美DNA.html', import.meta.url), html);
console.log('Standalone HTML generated: dist/审美DNA.html');
