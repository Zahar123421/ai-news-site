// Генератор обложек (SVG) для Нейроленты
// Запуск: node tools/generate-covers.js  → создаёт img/cover-<id>.svg для каждой новости
const fs = require("fs");
const path = require("path");

global.window = {};
require(path.join(__dirname, "..", "js", "data.js"));
const data = global.window.NEWS_DATA;

const OUT = path.join(__dirname, "..", "img");
fs.mkdirSync(OUT, { recursive: true });

const PALETTE = {
  "Модели":   { a: "#152040", b: "#0d1117", accent: "#4f8cff", accent2: "#9d6bff", icon: "◆" },
  "Бизнес":   { a: "#103020", b: "#0d1117", accent: "#34d399", accent2: "#34d399", icon: "▲" },
  "Индустрия":{ a: "#3a2610", b: "#0d1117", accent: "#f59e0b", accent2: "#fbbf24", icon: "■" },
  "Наука":    { a: "#201840", b: "#0d1117", accent: "#a78bfa", accent2: "#7c3aed", icon: "●" },
  "Общество": { a: "#33182a", b: "#0d1117", accent: "#fb7185", accent2: "#f43f5e", icon: "★" }
};

function wrap(text, max) {
  const words = text.split(" ");
  const lines = [];
  let cur = "";
  for (const w of words) {
    if ((cur + " " + w).trim().length > max) { lines.push(cur.trim()); cur = w; }
    else cur += " " + w;
  }
  if (cur.trim()) lines.push(cur.trim());
  return lines;
}

function pick(seed, n) {
  let s = seed;
  const rnd = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
  const out = [];
  for (let i = 0; i < n; i++) out.push(60 + rnd() * 1080, 40 + rnd() * 520, 3 + rnd() * 5);
  return out;
}

function glow(seed, color, alpha) {
  let s = seed;
  const rnd = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
  const cx = 60 + rnd() * 1080;
  const cy = 60 + rnd() * 520;
  const r = 220 + rnd() * 360;
  return `<circle cx="${cx.toFixed(0)}" cy="${cy.toFixed(0)}" r="${r.toFixed(0)}" fill="${color}" opacity="${alpha || 0.18}"/>`;
}

let count = 0;
for (const item of data.items) {
  const p = PALETTE[item.category] || PALETTE["Модели"];
  let seed = 0;
  for (const ch of item.id) seed = (seed * 31 + ch.charCodeAt(0)) % 233280;

  const lines = wrap(item.title, 30).slice(0, 4);
  const tspans = lines.map((l, i) =>
    `<tspan x="72" dy="${i === 0 ? 0 : 56}">${l.replace(/&/g, "&amp;").replace(/</g, "&lt;")}</tspan>`
  ).join("");

  // детерминированный «нейросетевой» узор (верёвочки со случайными точками)
  let s = seed;
  const rnd = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
  const pts = [];
  for (let i = 0; i < 24; i++) pts.push([60 + rnd() * 1080, 40 + rnd() * 520, 3 + rnd() * 5]);
  let net = "";
  for (let i = 0; i < pts.length; i++) {
    for (let j = i + 1; j < pts.length; j++) {
      const d = Math.hypot(pts[i][0] - pts[j][0], pts[i][1] - pts[j][1]);
      if (d < 230) {
        const bright = pts[i][2] > 5 ? "#9d6bff" : "#4f8cff";
        net += `<line x1="${pts[i][0].toFixed(0)}" y1="${pts[i][1].toFixed(0)}" x2="${pts[j][0].toFixed(0)}" y2="${pts[j][1].toFixed(0)}" stroke="${bright}" stroke-opacity="0.22" stroke-width="1.5"/>`;
      }
    }
  }
  let dots = "";
  for (const [x, y, r] of pts) {
    dots += `<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${r.toFixed(1)}" fill="#e6edf3" fill-opacity="0.5"/>`;
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 640" width="1200" height="640">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${p.a}"/>
      <stop offset="1" stop-color="${p.b}"/>
    </linearGradient>
    <linearGradient id="glow" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="${p.accent}" stop-opacity="0.9"/>
      <stop offset="1" stop-color="${p.accent2}" stop-opacity="0.9"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="640" fill="url(#bg)"/>
  ${glow(seed, "url(#glow)")}
  ${net}
  ${dots}
  <rect x="0" y="0" width="1200" height="640" fill="rgba(13,17,23,0.35)"/>

  <!-- Левая панель-элементы -->
  <rect x="48" y="52" width="96" height="6" rx="3" fill="${p.accent}"/>
  <rect x="48" y="72" width="58" height="5" rx="2.5" fill="${p.accent}" opacity="0.75"/>
  <rect x="48" y="90" width="78" height="5" rx="2.5" fill="${p.accent}" opacity="0.5"/>
  <text x="152" y="112" font-family="Arial, sans-serif" font-size="27" font-weight="bold" fill="${p.accent}" letter-spacing="3">НЕЙРОЛЕНТА</text>
  <text x="152" y="148" font-family="Arial, sans-serif" font-size="17" fill="#9aa7b5" letter-spacing="1.5">${item.category.toUpperCase()}</text>

  <!-- Надпись даты -->
  <rect x="48" y="562" width="160" height="22" rx="11" fill="rgba(255,255,255,0.14)" stroke="rgba(255,255,255,0.35)"/>
  <text x="128" y="584" font-family="Arial, sans-serif" font-size="19" fill="#e6edf3" text-anchor="middle">${item.date}</text>

  <!-- Заголовок -->
  <text x="72" y="250" font-family="Arial, sans-serif" font-size="50" font-weight="bold" fill="#ffffff" letter-spacing="1.5">${tspans}</text>
  <text x="72" y="320" font-family="Arial, sans-serif" font-size="25" fill="#c8d4e0" opacity="0.9" letter-spacing="0.5">${item.category.toUpperCase()} · ${item.source}</text>

  <!-- Большой линейный значок категории справа -->
  <text x="1040" y="470" font-family="Arial, sans-serif" font-size="210" font-weight="bold" fill="url(#glow)" text-anchor="end" opacity="0.85">${p.icon}</text>
  <text x="1040" y="510" font-family="Arial, sans-serif" font-size="210" font-weight="bold" fill="rgba(255,255,255,0.35)" text-anchor="end" opacity="0.8">${p.icon}</text>
</svg>`;

  fs.writeFileSync(path.join(OUT, "cover-" + item.id + ".svg"), svg, "utf8");
  count++;
}
console.log("covers generated:", count);
