/**
 * Corre `fn` una sola vez: con la primera interacción o, si no la hay, pasado
 * `topeMs` desde que terminó de cargar la página. Sirve para que los terceros
 * no compitan con la carga.
 */
export function alUsar(fn: () => void, topeMs: number) {
  const eventos = ["pointerdown", "keydown", "scroll", "touchstart", "wheel"];
  let listo = false;
  const correr = () => {
    if (listo) return;
    listo = true;
    for (const e of eventos) removeEventListener(e, correr, true);
    fn();
  };
  for (const e of eventos)
    addEventListener(e, correr, { capture: true, passive: true });
  const contar = () => setTimeout(correr, topeMs);
  if (document.readyState === "complete") contar();
  else addEventListener("load", contar, { once: true });
  return correr;
}
