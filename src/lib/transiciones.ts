// En celular, sin animación de página al entrar o salir de la calculadora.
// Chrome de Android no dibuja su barra fija inferior (sticky) mientras hay una
// view transition: se veía el campo de monto en su lugar. Al salir no alcanza
// con saltearla, porque la página vieja ya se capturó sin la barra; hay que
// evitar que empiece. Sin ella se pinta como en una carga directa.
import type { TransitionBeforePreparationEvent } from "astro:transitions/client";

type Doc = { startViewTransition?: unknown };

/** Vuelve a la del navegador (la del prototipo). */
const restaurar = () => delete (document as Doc).startViewTransition;

/** Reemplazo para una sola navegación: cambia la página sin capturar nada. */
const sinTransicion = (actualizar: () => unknown) => {
  restaurar();
  const listo = Promise.resolve().then(actualizar);
  return {
    updateCallbackDone: listo,
    ready: listo,
    finished: listo,
    skipTransition() {},
    types: new Set<string>(),
  };
};

document.addEventListener("astro:before-preparation", (evento) => {
  const e = evento as TransitionBeforePreparationEvent;
  restaurar();
  if (!("startViewTransition" in document)) return;
  const cargar = e.loader;
  e.loader = async () => {
    await cargar();
    // desde 900 px la barra no se muestra (calculadora.css): se anima igual
    if (
      window.matchMedia("(max-width: 899px)").matches &&
      [document, e.newDocument].some((d) => d.querySelector(".barra-total"))
    )
      (document as Doc).startViewTransition = sinTransicion;
  };
});
