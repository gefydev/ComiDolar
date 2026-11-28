import { getCollection } from "astro:content";

/**
 * Posts publicables, del más nuevo al más viejo. Los marcados con `draft: true`
 * no salen en ninguna página ni feed.
 */
export const getPosts = async () =>
  (await getCollection("blog", ({ data }) => !data.draft)).sort(
    (a, b) => Date.parse(b.data.date) - Date.parse(a.data.date),
  );

/** El título sin la marca repetida al final. */
export const tituloCorto = (titulo: string) =>
  titulo.replace(/\s*-\s*Comi ?D[oó]lar\s*$/i, "");
