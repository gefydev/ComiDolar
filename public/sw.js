/* global self, caches, fetch, URL */
// Service worker de comi.dolar. No guarda ninguna página: las cotizaciones del
// HTML quedarían viejas sin avisar. Sin conexión muestra /offline.html, que
// lee la última cotización guardada en el dispositivo, con su fecha.
const CACHE = "comidolar-v1";
const FIJOS = [
  "/offline.html",
  "/fonts/archivo-var.woff2",
  "/assets/img/appicon_192.png",
];
const MAXIMO = 80;

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches
      .open(CACHE)
      .then((c) => c.addAll(FIJOS))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    (async () => {
      for (const nombre of await caches.keys())
        if (nombre.startsWith("comidolar-") && nombre !== CACHE)
          await caches.delete(nombre);
      await self.clients.claim();
    })(),
  );
});

// Los archivos con hash y las fuentes no cambian: primero la copia
async function copiaPrimero(request) {
  const cache = await caches.open(CACHE);
  const copia = await cache.match(request);
  if (copia) return copia;
  const respuesta = await fetch(request);
  if (respuesta.ok) {
    await cache.put(request, respuesta.clone());
    const claves = await cache.keys();
    const sobran = claves.filter((k) => k.url.includes("/_astro/"));
    for (const clave of sobran.slice(0, Math.max(0, claves.length - MAXIMO)))
      await cache.delete(clave);
  }
  return respuesta;
}

self.addEventListener("fetch", (e) => {
  const { request } = e;
  const url = new URL(request.url);
  // anuncios, analítica y cotizaciones van directo a la red
  if (request.method !== "GET" || url.origin !== self.location.origin) return;

  if (request.mode === "navigate")
    e.respondWith(fetch(request).catch(() => caches.match("/offline.html")));
  else if (/^\/(_astro|fonts)\//.test(url.pathname))
    e.respondWith(copiaPrimero(request));
  else if (FIJOS.includes(url.pathname))
    e.respondWith(fetch(request).catch(() => caches.match(url.pathname)));
});
