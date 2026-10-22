import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import sanitizeHtml from "sanitize-html";
import MarkdownIt from "markdown-it";
const parser = new MarkdownIt({ html: true });

const prohibitedTags = [
  "script",
  "style",
  "iframe",
  "object",
  "embed",
  "link",
  "form",
  "input",
  "button",
  "select",
  "textarea",
  "canvas",
  "svg",
  "audio",
  "video",
  "math",
  "frame",
  "frameset",
  "noscript",
  "noembed",
  "frame",
  "frameset",
  "base",
  "basefont",
];

export async function GET(context) {
  const blog = await getCollection("blog");
  return rss({
    title: "Blog de ComiDólar",
    description:
      "Todas las últimas publicaciones de ComiDólar a través de su blog oficial. Noticias del dólar, del CNBA y mucho más.",
    site: context.site,
    items: blog.map((post) => {
      const imageUrl = `/assets/img/opengraph/blog/${post.id}.webp`;
      const imageHtml = `<img src="${imageUrl}" alt="${post.data.title}" class="opengraph-image" />`;
      let contentHtml = parser.render(
        (post.body ?? "").replace(/^(import|export)\s.*$/gm, ""),
      );
      const containsProhibitedTags = prohibitedTags.some((tag) =>
        new RegExp(`<${tag}\\b[^>]*>`, "i").test(contentHtml),
      );
      if (containsProhibitedTags) {
        contentHtml =
          "<div>Este artículo necesita ser cargado en la web de ComiDólar.</div>";
      } else {
        contentHtml = sanitizeHtml(contentHtml, {
          allowedTags: ["a", "img"],
          allowedAttributes: {
            a: ["href", "title", "class"],
            img: ["src", "alt", "title", "width", "height", "class"],
          },
        });
      }
      const finalContentHtml = imageHtml + contentHtml;
      return {
        title: post.data.title,
        pubDate: post.data.date,
        description: post.data.description,
        categories: post.data.tags,
        author: post.data.rssauthor,
        link: `/blog/${post.id}/`,
        content: finalContentHtml,
      };
    }),
    customData: [
      "<language>es-es</language>",
      `<atom:link xmlns:atom="http://www.w3.org/2005/Atom" href="${new URL(
        "rss.xml",
        context.site,
      )}" rel="self" type="application/rss+xml" />`,
    ].join(""),
  });
}
