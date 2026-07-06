const http = require("http");
const fs = require("fs");
const path = require("path");

const port = Number(process.env.PORT || 3000);
const root = path.join(__dirname, "dist");

const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".webmanifest": "application/manifest+json; charset=utf-8",
};

function send(res, status, body, type = "text/plain; charset=utf-8") {
  res.writeHead(status, { "Content-Type": type, "Cache-Control": "no-cache" });
  res.end(body);
}

function safePath(urlPath) {
  const decoded = decodeURIComponent(urlPath.split("?")[0]);
  const normalized = path.normalize(decoded).replace(/^\.\.(\/|\\|$)/, "");
  return path.join(root, normalized === "/" ? "index.html" : normalized);
}

const server = http.createServer((req, res) => {
  if (!req.url || req.method !== "GET") {
    send(res, 405, "Method not allowed");
    return;
  }

  if (req.url.startsWith("/api/health")) {
    send(res, 200, JSON.stringify({ ok: true, app: "Kishi's Kitchen", mode: "static-pwa" }), "application/json; charset=utf-8");
    return;
  }

  let filePath = safePath(req.url);
  if (!filePath.startsWith(root)) {
    send(res, 403, "Forbidden");
    return;
  }

  fs.stat(filePath, (statError, stat) => {
    if (statError || !stat.isFile()) {
      filePath = path.join(root, "index.html");
    }

    fs.readFile(filePath, (readError, file) => {
      if (readError) {
        send(res, 404, "Not found");
        return;
      }
      const ext = path.extname(filePath);
      res.writeHead(200, {
        "Content-Type": contentTypes[ext] || "application/octet-stream",
        "Cache-Control": ext === ".html" ? "no-cache" : "public, max-age=31536000, immutable",
      });
      res.end(file);
    });
  });
});

server.listen(port, "0.0.0.0", () => {
  console.log(`Kishi's Kitchen static PWA listening on ${port}`);
});
