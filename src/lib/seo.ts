// URLs absolutas y datos estructurados (JSON-LD).
export const SITIO = "https://comidolar.com.ar";

export const absoluta = (ruta: string) => (ruta === "/" ? SITIO : SITIO + ruta);

/** WebSite y Organization: van en todas las páginas. */
export const jsonLdSitio = () => ({
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${SITIO}/#sitio`,
      url: `${SITIO}/`,
      name: "comi.dolar",
      alternateName: ["ComiDólar", "Comi Dólar"],
      inLanguage: "es-AR",
      publisher: { "@id": `${SITIO}/#organizacion` },
    },
    {
      "@type": "Organization",
      "@id": `${SITIO}/#organizacion`,
      name: "comi.dolar",
      url: `${SITIO}/`,
      logo: `${SITIO}/assets/img/appicon.png`,
    },
  ],
});

export type Miga = [nombre: string, ruta: string];

/** BreadcrumbList de una página interna; "Inicio" se agrega solo. */
export const jsonLdMigas = (migas: Miga[]) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [["Inicio", "/"] as Miga, ...migas].map(
    ([name, ruta], i) => ({
      "@type": "ListItem",
      position: i + 1,
      name,
      item: absoluta(ruta),
    }),
  ),
});

/** Para meter en un <script>: que un "</script>" del contenido no lo corte. */
export const jsonSeguro = (datos: object) =>
  JSON.stringify(datos).replace(/</g, "\\u003c");
