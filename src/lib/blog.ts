import { getCollection } from "astro:content";

/** Posts publicables: los marcados con `draft: true` no salen en ninguna página ni feed. */
export const getPosts = () => getCollection("blog", ({ data }) => !data.draft);
