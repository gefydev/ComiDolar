// Al tocar un link, el router de Astro pide la página con fetch y espera sin
// límite: con el servidor colgado no pasaría nada. Pasado un rato se deja la
// navegación en manos del navegador, que muestra que está cargando y, si
// tampoco responde, recibe la página de respaldo (public/sw.js).
import type { TransitionBeforePreparationEvent } from "astro:transitions/client";

const ESPERA_MS = 8000;

document.addEventListener("astro:before-preparation", (evento) => {
  const e = evento as TransitionBeforePreparationEvent;
  const cargar = e.loader;
  e.loader = async () => {
    let reloj: ReturnType<typeof setTimeout> | undefined;
    const tarde = new Promise<"tarde">((listo) => {
      reloj = setTimeout(listo, ESPERA_MS, "tarde");
    });
    // preventDefault: el router hace una carga completa de la misma dirección
    if ((await Promise.race([cargar(), tarde])) === "tarde") e.preventDefault();
    clearTimeout(reloj);
  };
});
