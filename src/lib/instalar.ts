// Botón "Instalar": solo aparece si el navegador ofreció instalar.
// El evento se captura en <head> (layout.astro) para no perderlo.
interface EventoInstalar extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

declare global {
  interface Window {
    __instalar?: EventoInstalar | null;
    posthog?: { capture?: (evento: string) => void };
  }
}

const medir = (evento: string) => window.posthog?.capture?.(evento);
const botones = () =>
  document.querySelectorAll<HTMLButtonElement>("[data-instalar]");
const instalada = () => window.matchMedia("(display-mode: standalone)").matches;

const pintar = () => {
  for (const boton of botones())
    boton.hidden = !window.__instalar || instalada();
};

document.addEventListener("instalar:disponible", pintar);
document.addEventListener("astro:page-load", pintar);

document.addEventListener("click", async (e) => {
  if (!(e.target as Element).closest("[data-instalar]")) return;
  const evento = window.__instalar;
  if (!evento) return;
  // prompt() solo se puede usar una vez
  window.__instalar = null;
  pintar();
  medir("instalacion_iniciada");
  await evento.prompt();
  const { outcome } = await evento.userChoice;
  medir(
    outcome === "accepted" ? "instalacion_aceptada" : "instalacion_rechazada",
  );
});

window.addEventListener("appinstalled", () => {
  window.__instalar = null;
  pintar();
});

pintar();
