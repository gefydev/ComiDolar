import { getPosts } from "@/lib/blog";

export async function GET() {
  const siteUrl = "https://comidolar.com.ar";

  const blogPosts = await getPosts();

  const urls = [
    { url: `${siteUrl}/`, changefreq: "hourly", priority: 1.0 },
    { url: `${siteUrl}/whatsapp`, changefreq: "never", priority: 0.5 },
    { url: `${siteUrl}/calculadora`, changefreq: "never", priority: 0.5 },
    {
      url: `${siteUrl}/calculadora/servicios`,
      changefreq: "yearly",
      priority: 0.5,
    },
    { url: `${siteUrl}/blog`, changefreq: "weekly", priority: 0.5 },
    { url: `${siteUrl}/donaciones`, changefreq: "never", priority: 0.5 },

    ...blogPosts.map((post) => ({
      url: `${siteUrl}/blog/${post.id}/`,
      changefreq: "never",
      priority: 0.1,
    })),
    {
      url: "https://prode.comidolar.com.ar/",
      changefreq: "never",
      priority: 0.5,
    },
  ];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    ${urls
      .map(
        ({ url, changefreq, priority }) => `
        <url>
          <loc>${url}</loc>
          <changefreq>${changefreq}</changefreq>
          <priority>${priority}</priority>
        </url>`,
      )
      .join("")}
  </urlset>`;

  return new Response(sitemap, {
    headers: {
      "Content-Type": "application/xml",
    },
  });
}
