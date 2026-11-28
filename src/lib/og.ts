/**
 * Imágenes para compartir (Open Graph): qué imágenes hay y con qué datos.
 * Las dibuja src/pages/og/[nombre].png.ts en el build. Diseño: Davinci.
 */
import { createHash } from "node:crypto";
import blog from "@/assets/og/plantillas/blog.html?raw";
import calculadora from "@/assets/og/plantillas/calculadora.html?raw";
import generica from "@/assets/og/plantillas/generica.html?raw";
import home from "@/assets/og/plantillas/home.html?raw";
import tipo from "@/assets/og/plantillas/tipo.html?raw";
import { getPosts, tituloCorto } from "@/lib/blog";
import { FICHAS } from "@/lib/fichas";
import { SITIO } from "@/lib/seo";
import { TIPOS } from "@/lib/tipos";

export const PLANTILLAS = { blog, calculadora, generica, home, tipo };

export interface ImagenOg {
  plantilla: keyof typeof PLANTILLAS;
  /** `{ raw }` va sin escapar (SVG) */
  datos: Record<string, string | number | { raw: string }>;
}

const limpiar = (t: string) =>
  tituloCorto(t)
    .replace(/[\p{Extended_Pictographic}️‍]/gu, "")
    .replace(/\s+/g, " ")
    .trim();

export const recortar = (t: string, max: number) => {
  if (t.length <= max) return t;
  const c = t.slice(0, max - 1);
  return c.slice(0, c.lastIndexOf(" ")).replace(/[,.;:!¡¿?]+$/, "") + "…";
};

const icono = (trazos: string, color: string, lado: number) => ({
  raw: `<svg xmlns="http://www.w3.org/2000/svg" width="${lado}" height="${lado}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${trazos}</svg>`,
});
const trazos = (slug: string) => FICHAS.find((f) => f.clase === slug)!.icono;

const generico = (titulo: string, bajada: string): ImagenOg => {
  const t = recortar(limpiar(titulo), 40);
  return {
    plantilla: "generica",
    datos: {
      titulo: t,
      tamano: t.length <= 12 ? 108 : t.length <= 22 ? 86 : 66,
      bajada: recortar(bajada, 80),
    },
  };
};

const GENERICAS: Record<string, [string, string]> = {
  blog: ["Blog", "Noticias y guías sobre el dólar."],
  donaciones: ["Donaciones", "comi.dolar es un proyecto sin fines de lucro."],
  servicios: [
    "Lista de servicios digitales",
    "Los servicios alcanzados por el IVA del 21 % al pagar con tarjeta.",
  ],
  whatsapp: ["Grupo de WhatsApp", "La comunidad de comi.dolar."],
  futuro: ["Tu Futuro", "CBC o 6to año: compará los dos caminos."],
  terminos: ["Términos y condiciones", "Condiciones de uso del sitio."],
  privacidad: ["Política de privacidad", "Cómo ComiDólar trata tus datos."],
};

/** Nombre de archivo para una etiqueta, tema o autor. */
export const nombreOg = (texto: string) =>
  texto
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-");

async function armarLista() {
  const lista = new Map<string, ImagenOg>();

  const datosHome: ImagenOg["datos"] = {
    linea1: "Dólar",
    linea2: "hoy",
    bajada: "Cotizaciones y calculadora de dólar tarjeta",
  };
  for (const t of [
    ...TIPOS,
    { slug: "brecha", color: "#a3164f", corto: "Brecha" },
  ]) {
    datosHome[`${t.slug}_color`] = t.color;
    datosHome[`${t.slug}_nombre`] = t.corto;
    datosHome[`${t.slug}_icono`] = icono(trazos(t.slug), "#ffffff", 44);
  }
  lista.set("home", { plantilla: "home", datos: datosHome });
  lista.set("calculadora", {
    plantilla: "calculadora",
    datos: {
      linea1: "Calculadora",
      linea2: "dólar tarjeta",
      bajada: "Cuánto te sale en pesos, paso a paso",
    },
  });
  for (const t of TIPOS) {
    const n = t.nombre.length;
    lista.set(`tipo-${t.slug}`, {
      plantilla: "tipo",
      datos: {
        color: t.color,
        etiqueta: t.etiqueta,
        antetitulo: "Dólar",
        nombre: t.nombre,
        bajada: t.bajada,
        pie: "Cotización",
        tamano: n <= 6 ? 176 : n <= 7 ? 148 : n <= 9 ? 120 : 80,
        icono: icono(trazos(t.slug), t.color, 230),
      },
    });
  }
  for (const [nombre, [titulo, bajada]] of Object.entries(GENERICAS))
    lista.set(nombre, generico(titulo, bajada));

  for (const { id, data } of await getPosts()) {
    const titulo = recortar(limpiar(data.title), 80);
    lista.set(`blog-${id}`, {
      plantilla: "blog",
      datos: {
        titulo,
        tamano: titulo.length <= 34 ? 84 : titulo.length <= 55 ? 72 : 60,
        tema: data.theme,
        fecha: new Date(data.date).toLocaleDateString("es-AR", {
          timeZone: "America/Argentina/Buenos_Aires",
          day: "numeric",
          month: "long",
          year: "numeric",
        }),
        autor: data.author,
      },
    });
    const deBlog = (clave: string, titulo: string) =>
      lista.set(clave, generico(titulo, "Del blog de comi.dolar."));
    for (const tag of data.tags ?? [])
      deBlog(`tag-${nombreOg(tag)}`, `#${tag.toLowerCase()}`);
    deBlog(`tema-${nombreOg(data.theme)}`, data.theme);
    deBlog(`autor-${nombreOg(data.author)}`, `Posts de ${data.author}`);
  }
  return lista;
}

let lista: ReturnType<typeof armarLista> | undefined;
export const listaOg = () => (lista ??= armarLista());

/** URL absoluta, con `?v=` para que no quede una imagen vieja en caché. */
export async function urlOg(nombre: string) {
  const imagen = (await listaOg()).get(nombre);
  if (!imagen) throw new Error(`No hay imagen para compartir "${nombre}"`);
  const v = createHash("sha1")
    .update(PLANTILLAS[imagen.plantilla] + JSON.stringify(imagen.datos))
    .digest("hex")
    .slice(0, 8);
  return `${SITIO}/og/${nombre}.png?v=${v}`;
}
