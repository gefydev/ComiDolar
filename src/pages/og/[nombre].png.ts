// Genera en el build las imágenes para compartir: plantilla → Satori → PNG.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { APIRoute } from "astro";
import { Resvg } from "@resvg/resvg-js";
import satori from "satori";
import { html } from "satori-html";
import { listaOg, PLANTILLAS, type ImagenOg } from "@/lib/og";

export async function getStaticPaths() {
  return [...(await listaOg())].map(([nombre, imagen]) => ({
    params: { nombre },
    props: imagen,
  }));
}

const leer = (ruta: string) => readFileSync(join(process.cwd(), ruta));
const fuente = (archivo: string) => leer(`src/assets/og/fonts/${archivo}.ttf`);

const escapar = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// El logo de 256 px alcanza (se dibuja a 228) y es mucho más rápido en Satori
// satori-html deja las entidades sin decodificar y lineClamp como texto
/* eslint-disable @typescript-eslint/no-explicit-any */
const arreglar = (n: any): any => {
  if (typeof n === "string")
    return n.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
  if (Array.isArray(n)) return n.map(arreglar);
  if (n?.props?.children !== undefined)
    n.props.children = arreglar(n.props.children);
  if (n?.props?.style?.lineClamp)
    n.props.style.lineClamp = Number(n.props.style.lineClamp);
  return n;
};

export const GET: APIRoute<ImagenOg> = async ({ props }) => {
  const logo = `data:image/png;base64,${leer("public/assets/img/appicon_256.png").toString("base64")}`;
  const datos: ImagenOg["datos"] = { logo: { raw: logo }, ...props.datos };
  const plantilla = PLANTILLAS[props.plantilla];
  const marcado = plantilla
    .slice(plantilla.indexOf("</style>") + 8)
    .trim()
    .replace(/\{\{(\w+)\}\}/g, (_, clave: string) => {
      const v = datos[clave];
      if (v === undefined) throw new Error(`falta el campo ${clave}`);
      return typeof v === "object" ? v.raw : escapar(String(v));
    });
  const svg = await satori(arreglar(html(marcado.replace(/>\s+</g, "><"))), {
    width: 1200,
    height: 630,
    fonts: [
      { name: "Archivo", weight: 500, data: fuente("Archivo-Medium") },
      { name: "Archivo", weight: 700, data: fuente("Archivo-Bold") },
      { name: "ArchivoWide", weight: 400, data: fuente("ArchivoWide-Black") },
      { name: "ArchivoCond", weight: 400, data: fuente("ArchivoCond-Black") },
    ],
  });
  const png = new Resvg(svg).render().asPng();
  return new Response(new Uint8Array(png), {
    headers: { "Content-Type": "image/png" },
  });
};
