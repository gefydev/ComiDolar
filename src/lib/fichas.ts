// Las ocho fichas de la home, con su color, ícono y etiqueta (diseno-spec.md §1).
import { brecha, type Casa, type Cotizaciones } from "@/lib/cotizaciones";
import { pesos, porcentaje } from "@/lib/formato";

export interface Ficha {
  id: Casa | "brecha";
  clase: string;
  nombre: string;
  etiqueta: string;
  /** Trazos SVG de 24×24 */
  icono: string;
}

export const FICHAS: Ficha[] = [
  {
    id: "oficial",
    clase: "oficial",
    nombre: "Oficial",
    etiqueta: "Banco",
    icono:
      '<path d="M3 21h18M5 21V10m4.5 11V10m5 11V10M19 21V10M3 10l9-7 9 7z"/>',
  },
  {
    id: "tarjeta",
    clase: "tarjeta",
    nombre: "Tarjeta",
    etiqueta: "Exterior",
    icono:
      '<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20M6 15h4"/>',
  },
  {
    id: "blue",
    clase: "blue",
    nombre: "Blue",
    etiqueta: "Informal",
    icono:
      '<rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="3"/><path d="M6 12h.01M18 12h.01"/>',
  },
  {
    id: "bolsa",
    clase: "mep",
    nombre: "MEP (Bolsa)",
    etiqueta: "Con bonos",
    icono: '<path d="M3 3v18h18"/><path d="M7 15l4-5 3 3 5-7"/>',
  },
  {
    id: "contadoconliqui",
    clase: "ccl",
    nombre: "Contado con liqui",
    etiqueta: "Afuera",
    icono:
      '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18-3-3-3-15 0-18"/>',
  },
  {
    id: "cripto",
    clase: "cripto",
    nombre: "Cripto",
    etiqueta: "24 horas",
    icono:
      '<path d="M12 2l8.700 5v10L12 22l-8.700-5V7z"/><path d="M9 12h6M12 9v6"/>',
  },
  {
    id: "mayorista",
    clase: "mayorista",
    nombre: "Mayorista",
    etiqueta: "Comercio",
    icono: '<path d="M3 13h8v8H3zM13 13h8v8h-8zM8 3h8v8H8z"/>',
  },
  {
    id: "brecha",
    clase: "brecha",
    nombre: "Brecha",
    etiqueta: "Indicador",
    icono: '<path d="M8 8l-5 4 5 4M16 8l5 4-5 4M3 12h6M15 12h6"/>',
  },
];

/** Número grande y renglón chico de cada ficha. */
export function textosFicha(id: Ficha["id"], casas: Cotizaciones["casas"]) {
  if (id === "brecha") {
    const b = brecha(casas);
    return {
      valor: b === null ? "—" : porcentaje(b),
      sub: "blue vs. oficial",
    };
  }
  const c = casas[id];
  return {
    valor: c ? pesos(c.venta) : "—",
    sub:
      id === "tarjeta"
        ? "oficial + 30%"
        : c?.compra
          ? `compra ${pesos(c.compra)}`
          : "compra —",
  };
}

/** Ejemplo del bloque de la calculadora: US$100 con percepción del 30%. */
export const ejemploExterior = (casas: Cotizaciones["casas"]) =>
  casas.oficial ? pesos(casas.oficial.venta * 100 * 1.3) : "—";
