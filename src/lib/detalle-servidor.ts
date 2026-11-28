import { cotizacionesParaRender } from "@/lib/cotizaciones-servidor";
import { obtenerHistorial } from "@/lib/historial";
import { tipoPorSlug } from "@/lib/tipos";

/** Todo lo que necesita /dolar-<slug>. Sin historial la página sale igual. */
export async function datosDetalle(slug: string) {
  const tipo = tipoPorSlug(slug);
  const [{ cotizaciones, fresco }, historial] = await Promise.all([
    cotizacionesParaRender(),
    obtenerHistorial(tipo.casa),
  ]);
  return { tipo, cotizaciones, fresco, historial };
}
