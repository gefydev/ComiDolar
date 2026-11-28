/**
 * Publicidad (AdSense, unidades manuales). Cada ubicación apunta a una unidad.
 * Mientras no haya unidades propias, todas reutilizan la que ya existía en la
 * calculadora: para cambiar una, se edita su línea.
 */
export const EDITOR = "ca-pub-8853864974633365"; // el mismo de public/ads.txt

const UNIDAD_COMPARTIDA = "4837249855";

export const UBICACIONES = {
  home: UNIDAD_COMPARTIDA,
  interna: UNIDAD_COMPARTIDA,
  blog: UNIDAD_COMPARTIDA,
  "calculadora-1": UNIDAD_COMPARTIDA,
  "calculadora-2": UNIDAD_COMPARTIDA,
} as const;

export type Ubicacion = keyof typeof UBICACIONES;
