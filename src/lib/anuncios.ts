// El script de AdSense se carga una sola vez y recién cuando hace falta: un
// espacio está por verse, la persona interactúa o pasan 12 s (Google necesita
// encontrarlo al revisar el sitio). No se activan anuncios automáticos: solo
// las unidades que están en el HTML.
import { EDITOR } from "@/config/anuncios";
import { alUsar } from "@/lib/al-usar";

declare global {
  interface Window {
    adsbygoogle?: object[];
  }
}

let pedido = false;

const insertar = () => {
  if (pedido) return;
  pedido = true;
  const script = document.createElement("script");
  script.async = true;
  script.crossOrigin = "anonymous";
  script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${EDITOR}`;
  document.head.appendChild(script);
};

let cerca: IntersectionObserver | undefined;
let preparado = false;

const cargarScript = () => {
  if (pedido) return;
  if (!preparado) {
    preparado = true;
    alUsar(insertar, 12_000);
  }
  cerca?.disconnect();
  cerca = new IntersectionObserver(
    (entradas) => {
      if (!entradas.some((e) => e.isIntersecting)) return;
      cerca?.disconnect();
      if ("requestIdleCallback" in window)
        requestIdleCallback(insertar, { timeout: 2000 });
      else setTimeout(insertar, 200);
    },
    { rootMargin: "200px" },
  );
  for (const espacio of document.querySelectorAll(".ad"))
    cerca.observe(espacio);
};

// Pedidos de la página que se va: sin el script todavía, se descartan
document.addEventListener("astro:before-swap", () => {
  if (Array.isArray(window.adsbygoogle)) window.adsbygoogle.length = 0;
});

document.addEventListener("astro:page-load", () => {
  const unidades = document.querySelectorAll("ins.adsbygoogle");
  if (!unidades.length) return;
  // Las unidades de la calculadora ya piden su anuncio con su propio script
  for (const unidad of document.querySelectorAll<HTMLElement>(
    ".ad ins.adsbygoogle:not([data-pedido])",
  )) {
    unidad.dataset.pedido = "";
    (window.adsbygoogle ||= []).push({});
  }
  cargarScript();
});
