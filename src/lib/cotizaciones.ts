/**
 * Única fuente de cotizaciones del sitio: la usan el render en servidor y el
 * refresco en el navegador. Principal: DolarApi. Respaldo: CriptoYa.
 */
export const CASAS = [
  "oficial",
  "blue",
  "bolsa",
  "contadoconliqui",
  "mayorista",
  "cripto",
  "tarjeta",
] as const;

export type Casa = (typeof CASAS)[number];

export const NOMBRES: Record<Casa, string> = {
  oficial: "Oficial",
  blue: "Blue",
  bolsa: "Bolsa",
  contadoconliqui: "Contado con Liqui",
  mayorista: "Mayorista",
  cripto: "Cripto",
  tarjeta: "Tarjeta",
};

export interface Cotizacion {
  venta: number;
  compra: number | null;
  /** Fecha del dato según la fuente (ISO 8601) */
  fecha: string;
}

export interface Cotizaciones {
  fuente: "DolarApi" | "CriptoYa";
  /** Momento en que se consultó la fuente (epoch ms) */
  consultado: number;
  casas: Partial<Record<Casa, Cotizacion>>;
}

const DOLARAPI = "https://dolarapi.com/v1/dolares";
const CRIPTOYA = "https://criptoya.com/api/dolar";

type Json = Record<string, unknown>;

const objeto = (v: unknown): Json =>
  typeof v === "object" && v !== null ? (v as Json) : {};

const precio = (v: unknown): number | null =>
  typeof v === "number" && Number.isFinite(v) && v > 0 ? v : null;

function cotizacion(
  venta: unknown,
  compra: unknown,
  fecha: Date,
): Cotizacion | null {
  const v = precio(venta);
  if (v === null || Number.isNaN(fecha.getTime())) return null;
  return { venta: v, compra: precio(compra), fecha: fecha.toISOString() };
}

export function leerDolarApi(json: unknown): Cotizaciones["casas"] {
  const casas: Cotizaciones["casas"] = {};
  for (const item of Array.isArray(json) ? json : []) {
    const d = objeto(item);
    const casa = CASAS.find((c) => c === d.casa);
    if (!casa) continue;
    const c = cotizacion(
      d.venta,
      d.compra,
      new Date(String(d.fechaActualizacion)),
    );
    if (c) casas[casa] = c;
  }
  return casas;
}

export function leerCriptoYa(json: unknown): Cotizaciones["casas"] {
  const raiz = objeto(json);
  const origen: Record<Casa, unknown> = {
    oficial: raiz.oficial,
    blue: raiz.blue,
    bolsa: objeto(objeto(raiz.mep).al30).ci,
    contadoconliqui: objeto(objeto(raiz.ccl).al30).ci,
    mayorista: raiz.mayorista,
    cripto: objeto(raiz.cripto).usdt,
    tarjeta: raiz.tarjeta,
  };
  const casas: Cotizaciones["casas"] = {};
  for (const casa of CASAS) {
    const d = objeto(origen[casa]);
    const c = cotizacion(
      d.ask ?? d.price,
      d.bid,
      new Date(Number(d.timestamp) * 1000),
    );
    if (c) casas[casa] = c;
  }
  return casas;
}

/** Brecha entre blue y oficial, en %. */
export function brecha(casas: Cotizaciones["casas"]): number | null {
  const { oficial, blue } = casas;
  if (!oficial || !blue) return null;
  return ((blue.venta - oficial.venta) / oficial.venta) * 100;
}

/**
 * Devuelve `null` si ninguna fuente entrega al menos el oficial.
 * Nunca lanza: quien llama decide qué mostrar.
 */
export async function obtenerCotizaciones(
  timeoutMs = 4000,
): Promise<Cotizaciones | null> {
  const fuentes = [
    { fuente: "DolarApi", url: DOLARAPI, leer: leerDolarApi },
    { fuente: "CriptoYa", url: CRIPTOYA, leer: leerCriptoYa },
  ] as const;

  for (const { fuente, url, leer } of fuentes) {
    try {
      // Sin headers propios: DolarApi no responde el preflight de CORS
      const res = await fetch(url, { signal: AbortSignal.timeout(timeoutMs) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const casas = leer(await res.json());
      if (casas.oficial) return { fuente, consultado: Date.now(), casas };
      throw new Error("respuesta sin dólar oficial");
    } catch (error) {
      console.warn(`Cotizaciones: falló ${fuente}`, error);
    }
  }
  return null;
}
