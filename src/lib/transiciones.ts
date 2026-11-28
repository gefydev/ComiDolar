// En celular, sin animación al entrar o salir de la calculadora. En Chrome de Android, su
// barra fija inferior (sticky) aparecía recién al terminar la transición de
// página y mientras tanto se veía el campo de monto en su lugar. Sin
// transición se pinta como en una carga directa, que ahí funciona bien.
import type { TransitionBeforeSwapEvent } from "astro:transitions/client";

document.addEventListener("astro:before-swap", (evento) => {
  const e = evento as TransitionBeforeSwapEvent;
  // desde 900 px la barra no se muestra (calculadora.css): se anima igual
  if (!window.matchMedia("(max-width: 899px)").matches) return;
  if (![document, e.newDocument].some((d) => d.querySelector(".barra-total")))
    return;
  // saltearla rechaza `ready`, y el router de Astro no lo espera
  e.viewTransition.ready?.catch(() => {});
  e.viewTransition.skipTransition();
});
