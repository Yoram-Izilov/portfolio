// Generates static/og.png (1200x630) — the social link-preview card.
// One-off asset generator; the PNG is committed, so this isn't a build/CI dep.
//   npm i -D @resvg/resvg-js && node scripts/gen-og.mjs
import { Resvg } from '@resvg/resvg-js';
import { writeFileSync } from 'node:fs';

const W = 1200;
const H = 630;

// blueprint grid lines every 44px
let grid = '';
for (let x = 44; x < W; x += 44) grid += `<line x1="${x}" y1="0" x2="${x}" y2="${H}"/>`;
for (let y = 44; y < H; y += 44) grid += `<line x1="0" y1="${y}" x2="${W}" y2="${y}"/>`;

// commit -> build -> test -> deploy -> LIVE pipeline motif (bottom edge)
const nodes = [820, 880, 940, 1000, 1060];
let pipe = `<line x1="${nodes[0]}" y1="548" x2="${nodes[nodes.length - 1]}" y2="548" stroke="#1d2839" stroke-width="2"/>`;
nodes.forEach((cx, i) => {
	const last = i === nodes.length - 1;
	pipe += `<circle cx="${cx}" cy="548" r="${last ? 7 : 5}" fill="${last ? '#46d17e' : '#121a26'}" stroke="${last ? '#46d17e' : '#4fe3d4'}" stroke-width="2"/>`;
});

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <radialGradient id="glow" cx="78%" cy="-5%" r="70%">
      <stop offset="0%" stop-color="#4fe3d4" stop-opacity="0.16"/>
      <stop offset="60%" stop-color="#4fe3d4" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="#070a0f"/>
  <g stroke="#4fe3d4" stroke-width="1" opacity="0.05">${grid}</g>
  <rect width="${W}" height="${H}" fill="url(#glow)"/>
  ${pipe}

  <!-- OPERATIONAL pill -->
  <g>
    <rect x="90" y="96" width="208" height="40" rx="20" fill="#46d17e" fill-opacity="0.08" stroke="#46d17e" stroke-opacity="0.4"/>
    <circle cx="116" cy="116" r="5" fill="#46d17e"/>
    <text x="134" y="122" font-family="Consolas, monospace" font-size="18" letter-spacing="3" fill="#46d17e">OPERATIONAL</text>
  </g>

  <text x="92" y="262" font-family="Consolas, monospace" font-size="24" letter-spacing="6" fill="#4fe3d4">DEVOPS ENGINEER</text>
  <text x="88" y="372" font-family="Arial, 'Segoe UI', sans-serif" font-size="120" font-weight="700" letter-spacing="-3" fill="#e9eff6">Yoram Izilov</text>

  <text x="92" y="452" font-family="Arial, 'Segoe UI', sans-serif" font-size="30" fill="#aab6c5">Production AWS &amp; Kubernetes infrastructure —</text>
  <text x="92" y="494" font-family="Arial, 'Segoe UI', sans-serif" font-size="30" fill="#aab6c5">observability &amp; CI/CD, instrumented before it breaks.</text>

  <text x="92" y="556" font-family="Consolas, monospace" font-size="20" letter-spacing="1" fill="#6a778a">www.yoram-izilov.com</text>
</svg>`;

const png = new Resvg(svg, {
	fitTo: { mode: 'width', value: W },
	font: { loadSystemFonts: true, defaultFontFamily: 'Arial' }
})
	.render()
	.asPng();

writeFileSync(new URL('../static/og.png', import.meta.url), png);
console.log('wrote static/og.png', png.length, 'bytes');
