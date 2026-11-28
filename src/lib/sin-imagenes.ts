// Reemplaza el optimizador de imágenes de Astro (/_image): el sitio no lo usa
// (las imágenes son archivos de public/) y sin parámetros respondía 500.
export const prerender = false;

export const GET = () =>
  new Response("No encontrado", {
    status: 404,
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
