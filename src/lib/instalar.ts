// Botón "Instalar": solo aparece si tocarlo sirve para algo. Con el aviso del
// navegador abre su diálogo; en iPhone, iPad y Safari de Mac muestra los pasos.
// El aviso se captura en <head> (layout.astro) para no perderlo.
import { modoInstalacion } from "@/lib/instalacion";

interface EventoInstalar extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

declare global {
  interface Window {
    __instalar?: EventoInstalar | null;
    posthog?: { capture?: (evento: string, datos?: object) => void };
  }
}

const medir = (evento: string, datos?: object) =>
  window.posthog?.capture?.(evento, datos);

/** Una sola vez por visita, aunque se navegue entre páginas. */
const unaVez = (evento: string, datos?: object) => {
  try {
    if (sessionStorage.getItem(evento)) return;
    sessionStorage.setItem(evento, "1");
  } catch {
    // almacenamiento bloqueado: se mide igual
  }
  medir(evento, datos);
};

const instalada = () =>
  ["standalone", "window-controls-overlay", "minimal-ui"].some(
    (m) => window.matchMedia(`(display-mode: ${m})`).matches,
  ) || (navigator as Navigator & { standalone?: boolean }).standalone === true;

let recienInstalada = false;
const modo = () =>
  modoInstalacion({
    aviso: Boolean(window.__instalar),
    instalada: recienInstalada || instalada(),
    ua: navigator.userAgent,
    toques: navigator.maxTouchPoints,
  });

const pintar = () => {
  const actual = modo();
  for (const boton of document.querySelectorAll<HTMLButtonElement>(
    "[data-instalar]",
  )) {
    boton.hidden = !actual;
    if (actual && actual !== "aviso")
      boton.setAttribute("aria-haspopup", "dialog");
    else boton.removeAttribute("aria-haspopup");
  }
  if (actual) unaVez("instalacion_disponible", { modo: actual });
};

document.addEventListener("instalar:disponible", pintar);
document.addEventListener("astro:page-load", pintar);

document.addEventListener("click", async (e) => {
  if (!(e.target as Element).closest("[data-instalar]")) return;
  const actual = modo();
  if (!actual) return;
  if (actual !== "aviso") {
    const guia = document.querySelector<HTMLDialogElement>("[data-guia]");
    if (!guia) return;
    for (const pasos of guia.querySelectorAll<HTMLElement>("[data-pasos]"))
      pasos.hidden = pasos.dataset.pasos !== actual;
    guia.showModal();
    medir("instrucciones_instalacion", { modo: actual });
    return;
  }
  const evento = window.__instalar!;
  // prompt() solo se puede usar una vez
  window.__instalar = null;
  pintar();
  medir("instalacion_iniciada");
  try {
    await evento.prompt();
    const { outcome } = await evento.userChoice;
    medir(
      outcome === "accepted" ? "instalacion_aceptada" : "instalacion_rechazada",
    );
  } catch {
    // el navegador no abrió su diálogo; si vuelve a ofrecer, vuelve el botón
    medir("instalacion_fallida");
  }
});

window.addEventListener("appinstalled", () => {
  window.__instalar = null;
  recienInstalada = true;
  medir("app_instalada");
  pintar();
});

if (instalada()) unaVez("app_abierta_instalada");
pintar();

// Página sin conexión (public/sw.js)
if ("serviceWorker" in navigator) {
  const registrar = () =>
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  if (document.readyState === "complete") registrar();
  else window.addEventListener("load", registrar, { once: true });
}
