import { describe, expect, test } from "bun:test";
import { TEXTOS_COTIZACION } from "../src/db/textosCotizacion";
import { vistaDetalle } from "../src/lib/detalle";
import { conEnlaces, sinEnlaces } from "../src/lib/enlaces";
import { leerHistorial, puntos } from "../src/lib/historial";
import { jsonLdMigas, jsonSeguro } from "../src/lib/seo";
import { rutaTipo, tipoPorSlug, TIPOS } from "../src/lib/tipos";

const fecha = "2026-11-27T18:00:00.000Z";
const casas = {
  oficial: { venta: 1625, compra: 1575, fecha },
  blue: { venta: 1710, compra: 1690, fecha },
  tarjeta: { venta: 2112.5, compra: null, fecha },
};
const texto = (h: string) => h.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");

describe("historial", () => {
  test("ordena, descarta lo inválido y recorta", () => {
    const crudo = [
      { fecha: "2026-11-27", venta: 3 },
      { fecha: "2026-11-25", venta: 1 },
      { fecha: "ayer", venta: 9 },
      { fecha: "2026-11-26", venta: -1 },
      { fecha: "2026-11-26", venta: 2 },
    ];
    expect(leerHistorial(crudo, 2).map((d) => d.venta)).toEqual([2, 3]);
    expect(leerHistorial({ error: "x" })).toEqual([]);
  });
  test("gráfico: sube hacia arriba y sin variación va al medio", () => {
    expect(
      puntos([
        { fecha: "2026-11-26", venta: 1 },
        { fecha: "2026-11-27", venta: 2 },
      ]),
    ).toEqual([
      [8, 157],
      [632, 32],
    ]);
    expect(
      puntos([
        { fecha: "2026-11-26", venta: 5 },
        { fecha: "2026-11-27", venta: 5 },
      ]).map((p) => p[1]),
    ).toEqual([95, 95]);
  });
});

describe("detalle", () => {
  test("tarjeta: oficial más 30 %", () => {
    const v = vistaDetalle(tipoPorSlug("tarjeta"), casas);
    expect(v.venta).toBe("$2.112,50");
    expect(texto(v.html)).toContain("Percepción 30 % RG 5617 $487,50");
  });
  test("blue: brecha con el oficial", () => {
    const v = vistaDetalle(tipoPorSlug("blue"), casas);
    expect(texto(v.html)).toContain("Diferencia con el oficial 5,23%");
  });
  test("sin dato no inventa", () => {
    const v = vistaDetalle(tipoPorSlug("cripto"), {});
    expect([v.venta, v.nota]).toEqual(["—", "Sin dato"]);
  });
});

describe("datos estructurados", () => {
  test("migas con Inicio y URLs absolutas", () => {
    expect(jsonLdMigas([["Blog", "/blog"]]).itemListElement).toEqual([
      {
        "@type": "ListItem",
        position: 1,
        name: "Inicio",
        item: "https://comidolar.com.ar",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Blog",
        item: "https://comidolar.com.ar/blog",
      },
    ]);
  });
  test("no puede cerrar el script", () => {
    expect(jsonSeguro({ a: "</script>" })).not.toContain("</script>");
  });
});

describe("textos de cada tipo", () => {
  test("todos tienen texto y enlazan a páginas que existen", () => {
    const rutas = new Set([
      "/calculadora",
      ...TIPOS.map((t) => rutaTipo(t.slug)),
    ]);
    for (const { slug } of TIPOS) {
      const t = TEXTOS_COTIZACION[slug];
      expect(t.faq.length).toBeGreaterThan(2);
      for (const [, ruta] of JSON.stringify(t).matchAll(/\]\((\/[^)]*)\)/g))
        expect(rutas.has(ruta)).toBe(true);
    }
  });
  test("enlaces: HTML en la página, texto pelado en JSON-LD", () => {
    const t = "Usá la [calculadora](/calculadora) <ya>.";
    expect(conEnlaces(t)).toBe(
      'Usá la <a class="enlace" href="/calculadora">calculadora</a> &lt;ya>.',
    );
    expect(sinEnlaces(t)).toBe("Usá la calculadora <ya>.");
  });
});
