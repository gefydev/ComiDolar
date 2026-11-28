/**
 * Publicidad (AdSense, unidades manuales y responsive). No hay unidades nuevas:
 * se reutilizan las dos que ya existían en la calculadora. La principal va en el
 * primer espacio de cada página y la segunda en los segundos.
 */
export const EDITOR = "ca-pub-8853864974633365"; // el mismo de public/ads.txt

const PRINCIPAL = "8423742279";
const SEGUNDA = "4837249855";

export const UBICACIONES = {
  home: PRINCIPAL,
  interna: PRINCIPAL,
  blog: PRINCIPAL,
  "calculadora-1": PRINCIPAL,
  "calculadora-2": SEGUNDA,
} as const;

export type Ubicacion = keyof typeof UBICACIONES;
