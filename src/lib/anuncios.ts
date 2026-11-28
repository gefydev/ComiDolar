// El script de AdSense se carga una sola vez y recién con la página ya cargada.
// No se activan anuncios automáticos: solo las unidades que están en el HTML.
import { EDITOR } from "@/config/anuncios";

declare global {
  interface Window {
    adsbygoogle?: object[];
  }
}

let pedido = false;

const cargarScript = () => {
  if (pedido) return;
  pedido = true;
  const insertar = () => {
    const script = document.createElement("script");
    script.async = true;
    script.crossOrigin = "anonymous";
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${EDITOR}`;
    document.head.appendChild(script);
  };
  const despues = () => {
    if ("requestIdleCallback" in window)
      requestIdleCallback(insertar, { timeout: 5000 });
    else setTimeout(insertar, 2000);
  };
  if (document.readyState === "complete") despues();
  else window.addEventListener("load", despues, { once: true });
};

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
