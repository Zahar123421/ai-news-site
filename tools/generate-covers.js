// Генератор обложек (SVG) для новостей ИИ Дайджест
// Запуск: node tools/generate-covers.js  → создаёт img/cover-<id>.svg для каждой новости
const fs = require("fs");
const path = require("path");

global.window = {};
require(path.join(__dirname, "..", "js", "data.js"));
const data = global.window.NEWS_DATA;

const OUT = path.join(__dirname, "..", "img");
fs.mkdirSync(OUT, { recursive: true });

const PALETTE = {
  "Модели":   { a: "#1a2a4a", b: "#0d1117", accent: "#4f8cff", icon: "◆" },
  "Бизнес":   { a: "#123528", b: "#0d1117", accent: "#34d399", icon: "▲" },
  "Индустрия":{ a: "#3a2a12", b: "#0d1117", accent: "#f59e0b", icon: "■" },
  "Наука":    { a: "#2a1f4a", b: "#0d1117", accent: "#a78bfa", icon: "●" },
  "Общество": { a: "#3f1a24", b: "#0d1117", accent: "#fb7185", icon: "★" }
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

function nodes(seed, n) {
  // детерминированный псевдослучайный «нейросетевой» узор
  let s = seed;
  const rnd = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
  const pts = [];
  for (let i = 0; i < n; i++) pts.push([60 + rnd() * 1080, 40 + rnd() * 520, 3 + rnd() * 5]);
  let lines = "";
  for (let i = 0; i < pts.length; i++) {
    for (let j = i + 1; j < pts.length; j++) {
      const d = Math.hypot(pts[i][0] - pts[j][0], pts[i][1] - pts[j][1]);
      if (d < 230) lines += `<line x1="${pts[i][0].toFixed(0)}" y1="${pts[i][1].toFixed(0)}" x2="${pts[j][0].toFixed(0)}" y2="${pts[j][1].toFixed(0)}" stroke="${pts[i][2] > 5 ? "#9d6bff" : "#4f8cff"}" stroke-opacity="0.25" stroke-width="1.5"/>`;
    }
  }
  let circles = "";
  for (const [x, y, r] of pts) {
    circles += `<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${r.toFixed(1)}" fill="#e6edf3" fill-opacity="0.55"/>`;
  }
  return lines + circles;
}

let count = 0;
for (const item of data.items) {
  const p = PALETTE[item.category] || PALETTE["Модели"];
  let seed = 0;
  for (const ch of item.id) seed = (seed * 31 + ch.charCodeAt(0)) % 233280;

  const lines = wrap(item.title, 34).slice(0, 4);
  const tspans = lines.map((l, i) =>
    `<tspan x="72" dy="${i === 0 ? 0 : 52}">${l.replace(/&/g, "&amp;").replace(/</g, "&lt;")}</tspan>`
  ).join("");

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${p.a}"/>
      <stop offset="1" stop-color="${p.b}"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  ${nodes(seed, 26)}
  <rect x="0" y="0" width="1200" height="630" fill="${p.b}" fill-opacity="0.45"/>
  <rect x="48" y="48" width="8" height="534" fill="${p.accent}"/>
  <text x="72" y="150" font-family="Arial, sans-serif" font-size="30" font-weight="bold" fill="${p.accent}" letter-spacing="4">ИИ ДАЙДЖЕСТ ${p.icon} ${item.category.toUpperCase()}</text>
  <text x="72" y="250" font-family="Arial, sans-serif" font-size="46" font-weight="bold" fill="#e6edf3">${tspans}</text>
  <text x="72" y="575" font-family="Arial, sans-serif" font-size="26" fill="#9aa7b5">${item.date}</text>
</svg>`;

  fs.writeFileSync(path.join(OUT, "cover-" + item.id + ".svg"), svg, "utf8");
  count++;
}
console.log("covers generated:", count);
