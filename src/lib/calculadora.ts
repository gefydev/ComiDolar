/**
 * Cálculos de la calculadora, sin DOM. Fórmulas: investigacion-calculadora.md §7 y §8.
 * `tc` es el tipo de cambio (por defecto el oficial venta).
 */
export const PERCEPCION = 0.3; // RG 5617/2024
export const IVA_DIGITAL = 0.21; // RG 4240/2018
export const FRANQUICIA_USD = 400; // ARCA, 30/07/2026
export const ENVIOS_POR_ANIO = 5;
export const FOB_MAXIMO_USD = 3000;

/** Ingresos Brutos por provincia. `null`: no tenemos el dato. */
export const PROVINCIAS = [
  { id: "caba", nombre: "CABA", iibb: 2, confirmado: true },
  { id: "pba", nombre: "Buenos Aires", iibb: 2, confirmado: false },
  { id: "santafe", nombre: "Santa Fe", iibb: 4.5, confirmado: false },
  { id: "cordoba", nombre: "Córdoba", iibb: null, confirmado: false },
  { id: "mendoza", nombre: "Mendoza", iibb: null, confirmado: false },
  { id: "otra", nombre: "Otra", iibb: null, confirmado: false },
] as const;

export type Numero =
  | { valor: number; error?: undefined }
  | { valor?: undefined; error: "vacio" | "letras" | "negativo" };

/**
 * Lee un número escrito a la argentina: "1.000.000", "10,5", "US$ 100".
 * Un punto que no separa miles se toma como decimal ("10.5").
 */
export function leerNumero(texto: string, { permiteCero = false } = {}): Numero {
  const limpio = texto.replace(/\s|US\$|R\$|\$|€|%/g, "");
  if (!limpio) return { error: "vacio" };
  const sinSigno = limpio.replace(/^-/, "");
  let normal: string;
  if (/^(\d{1,3}(\.\d{3})+|\d+)(,\d*)?$/.test(sinSigno))
    normal = sinSigno.replace(/\./g, "").replace(",", ".");
  else if (/^\d*\.\d+$|^\d+\.$/.test(sinSigno)) normal = sinSigno;
  else return { error: "letras" };
  const valor = Number(normal);
  if (limpio.startsWith("-") || (valor === 0 && !permiteCero))
    return { error: "negativo" };
  return Number.isFinite(valor) ? { valor } : { error: "letras" };
}

const centavos = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

export interface Exterior {
  /** Precio en dólares (si es € o R$, ya convertido con la cotización cruzada) */
  usd: number;
  tc: number;
  dolaresPropios?: boolean;
}

export function exterior({ usd, tc, dolaresPropios = false }: Exterior) {
  const convertido = centavos(usd * tc);
  const percepcion = dolaresPropios ? 0 : centavos(convertido * PERCEPCION);
  const total = centavos(convertido + percepcion);
  return { convertido, percepcion, total, porDolar: centavos(total / usd) };
}

export interface Digital {
  /** En dólares si se cobra en USD; en pesos si se cobra en pesos */
  monto: number;
  cobro: "usd" | "pesos";
  tc: number;
  /** Porcentaje de Ingresos Brutos (2 = 2 %) */
  iibb: number;
  /** USD: el precio ya trae el IVA. Pesos: no se usa. */
  incluyeIva?: boolean;
  /** Pesos: el prestador no factura en el país, así que el IVA se suma */
  sumarIva?: boolean;
}

export function digital(d: Digital) {
  const enPesos = d.cobro === "pesos";
  const convertido = centavos(enPesos ? d.monto : d.monto * d.tc);
  // Cobrado en pesos no hay cambio de divisas: no corresponde el 30 %
  const percepcion = enPesos ? 0 : centavos(convertido * PERCEPCION);
  const neto = d.incluyeIva ? convertido / (1 + IVA_DIGITAL) : convertido;
  const iva =
    !enPesos || d.sumarIva ? centavos(neto * IVA_DIGITAL) : 0;
  const iibb = centavos((convertido * d.iibb) / 100);
  const total = centavos(convertido + percepcion + iva + iibb);
  return {
    convertido,
    percepcion,
    iva,
    iibb,
    total,
    porDolar: enPesos ? null : centavos(total / d.monto),
  };
}

/** Viaje pagado en pesos: la percepción va sobre el precio sin impuestos. */
export function viaje(pesos: number, cuotas = 1) {
  const percepcion = centavos(pesos * PERCEPCION);
  const total = centavos(pesos + percepcion);
  const cuota = centavos(pesos / cuotas);
  // En agencias y transporte la percepción se cobra entera con el primer pago
  return { percepcion, total, primerPago: centavos(cuota + percepcion), cuota };
}

export interface Envio {
  usd: number;
  tc: number;
  /** Porcentaje de IVA de importación */
  iva: number;
  /** Ya usó los envíos con franquicia del año */
  sinCupo?: boolean;
  /** Porcentaje de derechos y tasa, solo fuera de franquicia */
  derechos?: number | null;
}

export function envio(e: Envio) {
  const excedeMaximo = e.usd > FOB_MAXIMO_USD;
  const fueraDeFranquicia = e.usd > FRANQUICIA_USD || Boolean(e.sinCupo);
  const convertido = centavos(e.usd * e.tc);
  const percepcion = centavos(convertido * PERCEPCION);
  const iva = centavos((convertido * e.iva) / 100);
  const derechos = !fueraDeFranquicia
    ? 0
    : e.derechos == null
      ? null
      : centavos((convertido * e.derechos) / 100);
  return {
    excedeMaximo,
    fueraDeFranquicia,
    convertido,
    percepcion,
    iva,
    derechos,
    incompleto: derechos === null,
    total: centavos(convertido + percepcion + iva + (derechos ?? 0)),
  };
}

/** Cuota estimada si el dólar fuera `tcCuota` en cada resumen. */
export const cuotaEstimada = (total: number, cuotas: number) =>
  centavos(total / cuotas);

/** Pagar con dólares propios: lo que cuesta comprarlos, sin comisiones. */
export const conDolares = (usd: number, cotizacion: number) =>
  centavos(usd * cotizacion);
