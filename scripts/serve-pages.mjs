// Local verification of GitHub Pages' repository subdirectory layout, not a backend.
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { resolve, extname } from "node:path";
const root = resolve("dist");
const base = "/HeroMissions/";
const types = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".svg": "image/svg+xml",
  ".woff2": "font/woff2",
  ".txt": "text/plain",
};
createServer(async (req, res) => {
  try {
    const url = new URL(req.url, "http://localhost");
    if (!url.pathname.startsWith(base)) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }
    const relative =
      decodeURIComponent(url.pathname.slice(base.length)) || "index.html";
    const file = resolve(root, relative);
    if (!file.startsWith(root + "/")) {
      res.writeHead(403);
      res.end();
      return;
    }
    const data = await readFile(file);
    res.writeHead(200, {
      "Content-Type": types[extname(file)] || "application/octet-stream",
      "Cache-Control": "no-cache",
    });
    res.end(data);
  } catch {
    res.writeHead(404);
    res.end("Not found");
  }
}).listen(4174, "0.0.0.0", () =>
  console.log("Pages-compatible build: http://localhost:4174/HeroMissions/"),
);
