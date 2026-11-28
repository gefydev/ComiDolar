/**
 * Últimos días de un tipo de dólar (ArgentinaDatos) y su gráfico. La fuente
 * devuelve todo el historial (cientos de KB), así que se pide en el servidor,
 * se recorta y se guarda una hora en la instancia.
 */
import { limite, type Casa } from "@/lib/cotizaciones";

export interface Dia {
  /** AAAA-MM-DD */
  fecha: string;
  venta: number;
}

export const DIAS = 10;

export function leerHistorial(json: unknown, dias = DIAS): Dia[] {
  if (!Array.isArray(json)) return [];
  return json
    .filter(
      (d): d is Dia =>
        typeof d?.fecha === "string" &&
        /^\d{4}-\d{2}-\d{2}$/.test(d.fecha) &&
        Number.isFinite(d.venta) &&
        d.venta > 0,
    )
    .map(({ fecha, venta }) => ({ fecha, venta }))
    .sort((a, b) => a.fecha.localeCompare(b.fecha))
    .slice(-dias);
}

const guardado = new Map<Casa, { dias: Dia[]; cuando: number }>();
const UNA_HORA = 3_600_000;

/** Nunca lanza: si la fuente falla, devuelve lo último que vio o nada. */
export async function obtenerHistorial(casa: Casa): Promise<Dia[]> {
  const previo = guardado.get(casa);
  if (previo && Date.now() - previo.cuando < UNA_HORA) return previo.dias;
  try {
    const res = await fetch(
      `https://api.argentinadatos.com/v1/cotizaciones/dolares/${casa}`,
      { signal: limite(4000) },
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const dias = leerHistorial(await res.json());
    if (!dias.length) throw new Error("historial vacío");
    guardado.set(casa, { dias, cuando: Date.now() });
    return dias;
  } catch (error) {
    console.warn(`Historial de ${casa}: falló ArgentinaDatos`, error);
    return previo?.dias ?? [];
  }
}

/** "2026-11-27" → "27/11" (sin zonas horarias de por medio). */
export const diaMes = (fecha: string) =>
  `${fecha.slice(8, 10)}/${fecha.slice(5, 7)}`;

/** Puntos de la línea en un lienzo de 640×190, con margen. */
export function puntos(dias: Dia[]): [number, number][] {
  const valores = dias.map((d) => d.venta);
  const min = Math.min(...valores);
  const rango = Math.max(...valores) - min;
  return dias.map((d, i) => [
    dias.length === 1 ? 320 : Math.round(8 + (i * 624) / (dias.length - 1)),
    // sin variación, la línea va al medio
    rango ? Math.round(157 - ((d.venta - min) / rango) * 125) : 95,
  ]);
}
