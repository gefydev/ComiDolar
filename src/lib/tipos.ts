// Los tipos de dólar con página propia (/dolar-<slug>).
import type { Casa } from "@/lib/cotizaciones";

export interface Tipo {
  slug: string;
  casa: Casa;
  /** Como se lo nombra en el título: "Dólar <nombre>" */
  nombre: string;
  corto: string;
  etiqueta: string;
  /** Color de la imagen para compartir (el claro de diseno-spec.md) */
  color: string;
  bajada: string;
}

export const TIPOS: Tipo[] = [
  {
    slug: "oficial",
    casa: "oficial",
    nombre: "oficial",
    corto: "Oficial",
    etiqueta: "Banco",
    color: "#1b6e3a",
    bajada: "El de los bancos y la referencia de los demás.",
  },
  {
    slug: "tarjeta",
    casa: "tarjeta",
    nombre: "tarjeta",
    corto: "Tarjeta",
    etiqueta: "Exterior",
    color: "#10200f",
    bajada: "Oficial más 30 % de percepción.",
  },
  {
    slug: "blue",
    casa: "blue",
    nombre: "blue",
    corto: "Blue",
    etiqueta: "Informal",
    color: "#2548c4",
    bajada: "El que se opera en el mercado informal.",
  },
  {
    slug: "mep",
    casa: "bolsa",
    nombre: "MEP",
    corto: "MEP",
    etiqueta: "Con bonos",
    color: "#855600",
    bajada: "Se consigue comprando y vendiendo bonos.",
  },
  {
    slug: "ccl",
    casa: "contadoconliqui",
    nombre: "contado con liqui",
    corto: "CCL",
    etiqueta: "Afuera",
    color: "#0a6a73",
    bajada: "Dólares en el exterior, a través de bonos o acciones.",
  },
  {
    slug: "cripto",
    casa: "cripto",
    nombre: "cripto",
    corto: "Cripto",
    etiqueta: "24 horas",
    color: "#7a2ea0",
    bajada: "Dólar digital, se opera todo el día.",
  },
  {
    slug: "mayorista",
    casa: "mayorista",
    nombre: "mayorista",
    corto: "Mayorista",
    etiqueta: "Comercio",
    color: "#9a3d1f",
    bajada: "El de empresas y bancos para comercio exterior.",
  },
];

export const tipoPorSlug = (slug: string) => {
  const tipo = TIPOS.find((t) => t.slug === slug);
  if (!tipo) throw new Error(`No existe el tipo de dólar ${slug}`);
  return tipo;
};

export const rutaTipo = (slug: string) => `/dolar-${slug}`;
