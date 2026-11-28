import {
  estanCompletas,
  obtenerCotizaciones,
  type Cotizaciones,
} from "@/lib/cotizaciones";

let ultima: Cotizaciones | null = null;

/**
 * Si las fuentes fallan, reutiliza lo último que vio esta instancia.
 * `fresco` es falso si faltan casas: así ISR no pisa una versión completa.
 */
export async function cotizacionesParaRender() {
  const nuevas = await obtenerCotizaciones();
  if (nuevas)
    ultima = { ...nuevas, casas: { ...ultima?.casas, ...nuevas.casas } };
  return { cotizaciones: ultima, fresco: estanCompletas(nuevas) };
}
