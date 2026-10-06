// Минимальный локальный сервер для ИИ Дайджест
// Запуск: node server.js  →  http://localhost:8080
const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 8080;
const ROOT = __dirname;

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".webmanifest": "application/manifest+json"
};

http.createServer((req, res) => {
  let urlPath = decodeURIComponent(req.url.split("?")[0]);
  if (urlPath === "/") urlPath = "/index.html";
  const filePath = path.join(ROOT, path.normalize(urlPath));
  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403); res.end("Forbidden"); return;
  }
  fs.readFile(filePath, (err, buf) => {
    if (err) { res.writeHead(404, {"Content-Type": "text/plain; charset=utf-8"}); res.end("404 Not Found"); return; }
    res.writeHead(200, {"Content-Type": MIME[path.extname(filePath)] || "application/octet-stream"});
    res.end(buf);
  });
}).listen(PORT, () => console.log("НейроЛента: http://localhost:" + PORT));
