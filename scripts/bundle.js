/**
 * Zero-Dependency Single-File HTML Bundler for Changoku
 * Inlines CSS and all ES modules into a single standalone .html file
 * that can be opened directly on a phone (WhatsApp, Files, Safari, Chrome)
 * without a web server or internet connection.
 *
 * Usage:
 *   node scripts/bundle.js --lang=es
 *   node scripts/bundle.js --lang=en
 *   node scripts/bundle.js --lang=es --out=dist/changoku-mama.html
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

// Parse CLI arguments
const args = process.argv.slice(2);
let lang = 'es';
let customOut = null;

for (const arg of args) {
  if (arg.startsWith('--lang=')) {
    const val = arg.split('=')[1].trim().toLowerCase();
    if (val === 'es' || val === 'en') {
      lang = val;
    } else {
      console.warn(`Unknown language "${val}", falling back to "es".`);
    }
  } else if (arg.startsWith('--out=')) {
    customOut = arg.split('=')[1].trim();
  }
}

// Topological dependency order of ES modules
const MODULE_FILES = [
  'js/engine/sudoku.js',
  'js/engine/techniques.js',
  'js/engine/solver.js',
  'js/engine/generator.js',
  'js/study/studyPuzzles.js',
  'js/i18n/translations.js',
  'js/ui/boardUI.js',
  'js/ui/visualizerUI.js',
  'js/ui/theoryUI.js',
  'js/app.js'
];

function stripImportsAndExports(source) {
  return source
    // Remove multi-line or single-line ES module import statements
    .replace(/^\s*import\s+[\s\S]*?from\s+['"][^'"]+['"];?\s*$/gm, '')
    // Replace `export class`, `export function`, `export const`, `export let`
    .replace(/^\s*export\s+(class|function|const|let|var)\s+/gm, '$1 ')
    // Remove any trailing `export { ... };`
    .replace(/^\s*export\s*\{[\s\S]*?\};?\s*$/gm, '');
}

function buildBundle() {
  const indexHtmlPath = path.join(ROOT_DIR, 'index.html');
  const cssPath = path.join(ROOT_DIR, 'css/style.css');

  let html = fs.readFileSync(indexHtmlPath, 'utf8');
  const css = fs.readFileSync(cssPath, 'utf8');

  // Combine all JS modules in order
  const combinedModules = MODULE_FILES.map((relPath) => {
    const fullPath = path.join(ROOT_DIR, relPath);
    const raw = fs.readFileSync(fullPath, 'utf8');
    const cleaned = stripImportsAndExports(raw);
    return `  // ==========================================\n  // MODULE: ${relPath}\n  // ==========================================\n${cleaned}`;
  }).join('\n\n');

  const inlineJs = `(() => {\n  "use strict";\n  window.DEFAULT_LANG = ${JSON.stringify(lang)};\n\n${combinedModules}\n})();`;

  // Update <html lang="...">
  html = html.replace(/<html\s+lang="[^"]*"/i, `<html lang="${lang}"`);

  // For single-file bundle: remove external manifest link and inline SVG icon as data URI
  const iconSvgPath = path.join(ROOT_DIR, 'icon.svg');
  if (fs.existsSync(iconSvgPath)) {
    const svgBase64 = Buffer.from(fs.readFileSync(iconSvgPath, 'utf8')).toString('base64');
    const dataUri = `data:image/svg+xml;base64,${svgBase64}`;
    html = html.replace(/<link\s+rel="manifest"\s+href="manifest\.json"\s*\/?>\s*/i, '');
    html = html.replace(/href="icon\.svg"/gi, `href="${dataUri}"`);
  }

  // Replace external stylesheet link with inline <style>
  html = html.replace(
    /<link\s+rel="stylesheet"\s+href="css\/style\.css"\s*\/?>/i,
    () => `<style>\n${css}\n  </style>`
  );

  // Replace <script type="module" src="js/app.js"></script> with inline <script>
  html = html.replace(
    /<script\s+type="module"\s+src="js\/app\.js"\s*><\/script>/i,
    () => `<script>\n${inlineJs}\n  </script>`
  );

  const distDir = path.join(ROOT_DIR, 'dist');
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
  }

  const outPath = customOut
    ? path.resolve(ROOT_DIR, customOut)
    : path.join(distDir, `changoku-${lang}.html`);

  fs.writeFileSync(outPath, html, 'utf8');
  const sizeKb = (Buffer.byteLength(html, 'utf8') / 1024).toFixed(1);
  console.log(`✅ Packaged single-file HTML (${lang.toUpperCase()}): ${outPath} (${sizeKb} KB)`);
}

buildBundle();
