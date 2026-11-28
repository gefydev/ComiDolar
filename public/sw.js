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

// Los archivos con hash y las fuentes no cambian: primero la copia. Si el
// almacenamiento falla (lleno o bloqueado), el archivo llega igual por la red.
async function copiaPrimero(request) {
  let cache;
  try {
    cache = await caches.open(CACHE);
    const copia = await cache.match(request);
    if (copia) return copia;
  } catch {
    cache = null;
  }
  const respuesta = await fetch(request);
  if (cache && respuesta.ok) {
    try {
      await cache.put(request, respuesta.clone());
      const claves = await cache.keys();
      const hash = claves.filter((k) => k.url.includes("/_astro/"));
      for (const clave of hash.slice(0, Math.max(0, claves.length - MAXIMO)))
        await cache.delete(clave);
    } catch {
      // sin lugar: no se guarda
    }
  }
  return respuesta;
}

// La página sin conexión se renueva con la red andando, una vez por arranque
let renovada = false;
async function renovar() {
  if (renovada) return;
  renovada = true;
  try {
    await (await caches.open(CACHE)).add("/offline.html");
  } catch {
    // queda la copia anterior
  }
}

self.addEventListener("fetch", (e) => {
  const { request } = e;
  const url = new URL(request.url);
  // anuncios, analítica y cotizaciones van directo a la red
  if (request.method !== "GET" || url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    const red = fetch(request);
    e.respondWith(red.catch(() => caches.match("/offline.html")));
    e.waitUntil(red.then(renovar, () => {}));
  } else if (/^\/(_astro|fonts)\//.test(url.pathname))
    e.respondWith(copiaPrimero(request));
  else if (FIJOS.includes(url.pathname))
    e.respondWith(fetch(request).catch(() => caches.match(url.pathname)));
});
