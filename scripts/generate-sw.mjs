// Produce a self-contained offline cache from the actual Vite build.
import { readdir, readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
const files = await readdir("dist", { recursive: true, withFileTypes: true });
const paths = files
  .filter((f) => f.isFile() && f.name !== "sw.js")
  .map((f) => `${f.parentPath}/${f.name}`.replace(/^dist\//, ""));
const hash = createHash("sha256");
for (const path of paths.sort()) hash.update(await readFile(`dist/${path}`));
hash.update(await readFile(new URL(import.meta.url)));
const version = hash.digest("hex").slice(0, 12);
await writeFile(
  "dist/sw.js",
  `
const PREFIX = 'emberfall-' + new URL(self.registration.scope).pathname + '-';
const CACHE = PREFIX + '${version}';
const FILES = ${JSON.stringify(paths.map((p) => `./${p}`))};
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith(PREFIX) && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET' || !event.request.url.startsWith(self.registration.scope)) return;
  if (event.request.mode === 'navigate') {
    event.respondWith(fetch(event.request).catch(() => caches.open(CACHE).then(cache => cache.match(new URL('./index.html', self.registration.scope), { ignoreVary: true }))));
    return;
  }
  event.respondWith(caches.open(CACHE).then(cache => cache.match(event.request, { ignoreVary: true })).then(cached => cached || fetch(event.request)));
});
`,
);
console.log(`Offline cache ${version}: ${paths.length} assets.`);
