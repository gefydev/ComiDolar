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

/** AbortSignal.timeout no existe en iOS anterior a 16. */
export function limite(ms: number) {
  const control = new AbortController();
  setTimeout(() => control.abort(), ms);
  return control.signal;
}

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

const completas = (casas: Cotizaciones["casas"]) =>
  CASAS.every((casa) => casas[casa]);

/** Revalida una copia guardada con el mismo criterio que las fuentes. */
export function leerCopia(json: unknown): Cotizaciones | null {
  const raiz = objeto(json);
  const { fuente, consultado } = raiz;
  if (fuente !== "DolarApi" && fuente !== "CriptoYa") return null;
  // Una fecha de consulta en el futuro le ganaría para siempre a los datos nuevos
  if (typeof consultado !== "number" || !(consultado <= Date.now() + 300_000))
    return null;
  const casas: Cotizaciones["casas"] = {};
  for (const casa of CASAS) {
    const d = objeto(objeto(raiz.casas)[casa]);
    const c = cotizacion(d.venta, d.compra, new Date(String(d.fecha)));
    if (c) casas[casa] = c;
  }
  return casas.oficial ? { fuente, consultado, casas } : null;
}

/**
 * Si DolarApi responde incompleta, completa lo que falta con CriptoYa.
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

  let resultado: Cotizaciones | null = null;
  for (const { fuente, url, leer } of fuentes) {
    try {
      // Sin headers propios: DolarApi no responde el preflight de CORS
      const res = await fetch(url, { signal: limite(timeoutMs) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const casas = leer(await res.json());
      if (resultado) resultado.casas = { ...casas, ...resultado.casas };
      else if (casas.oficial)
        resultado = { fuente, consultado: Date.now(), casas };
      else throw new Error("respuesta sin dólar oficial");
      if (completas(resultado.casas)) break;
    } catch (error) {
      console.warn(`Cotizaciones: falló ${fuente}`, error);
    }
  }
  return resultado;
}

export const estanCompletas = (c: Cotizaciones | null) =>
  c !== null && completas(c.casas);
