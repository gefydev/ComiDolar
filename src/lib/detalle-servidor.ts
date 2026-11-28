import { cotizacionesParaRender } from "@/lib/cotizaciones-servidor";
import { obtenerHistorial } from "@/lib/historial";
import { tipoPorSlug } from "@/lib/tipos";

/**
 * Todo lo que necesita /dolar-<slug>. Sin historial la página sale igual, pero
 * no cuenta como fresca: así ISR no pisa una versión que sí tenía gráfico.
 */
export async function datosDetalle(slug: string) {
  const tipo = tipoPorSlug(slug);
  const [{ cotizaciones, fresco: conPrecios }, historial] = await Promise.all([
    cotizacionesParaRender(),
    obtenerHistorial(tipo.casa),
  ]);
  const fresco = conPrecios && historial.length > 1;
  return { tipo, cotizaciones, fresco, historial };
}
