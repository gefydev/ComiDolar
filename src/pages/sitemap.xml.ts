// Sitemap generado en el build: solo páginas indexables, sin barra final
// (igual que sus canonical).
import { getPosts } from "@/lib/blog";
import { absoluta } from "@/lib/seo";
import { rutaTipo, TIPOS } from "@/lib/tipos";

export async function GET() {
  const posts = await getPosts();
  const paginas: { ruta: string; fecha?: string }[] = [
    { ruta: "/" },
    { ruta: "/calculadora" },
    ...TIPOS.map(({ slug }) => ({ ruta: rutaTipo(slug) })),
    { ruta: "/calculadora/servicios" },
    { ruta: "/blog", fecha: posts[0]?.data.date },
    ...posts.map(({ id, data }) => ({
      ruta: `/blog/${id}`,
      fecha: data.date,
    })),
    { ruta: "/futuro" },
    { ruta: "/donaciones" },
    { ruta: "/whatsapp" },
  ];

  const urls = paginas.map(({ ruta, fecha }) => {
    const lastmod = fecha
      ? `<lastmod>${new Date(fecha).toISOString().slice(0, 10)}</lastmod>`
      : "";
    return `<url><loc>${absoluta(ruta)}</loc>${lastmod}</url>`;
  });

  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>
`,
    { headers: { "Content-Type": "application/xml" } },
  );
}
