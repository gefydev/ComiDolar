import { obtenerCotizaciones, type Cotizaciones } from "@/lib/cotizaciones";

let ultima: Cotizaciones | null = null;

/** Si las fuentes fallan, reutiliza lo último que vio esta instancia. */
export async function cotizacionesParaRender() {
  const nuevas = await obtenerCotizaciones();
  if (nuevas) ultima = nuevas;
  return { cotizaciones: ultima, fresco: nuevas !== null };
}
