import type { Cotizaciones } from "@/lib/cotizaciones";
import { formatearCorta } from "@/lib/formato";

/** Renglón bajo "Dólar hoy" (textos.md): fecha del dato, dato viejo o sin dato. */
export function textoEstado(c: Cotizaciones | null, fallo: boolean) {
  if (!c)
    return fallo
      ? "No pudimos cargar la cotización. Probá de nuevo en unos minutos."
      : "Cargando cotizaciones…";
  const cuando = formatearCorta(c.consultado);
  return fallo
    ? `No pudimos actualizar. Último dato: ${cuando} (${c.fuente})`
    : `Precio de venta · ${cuando} (${c.fuente})`;
}
