import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const blogCollection = defineCollection({
  loader: glob({ pattern: "**/[^_]*.{md,mdx}", base: "./src/content/blog" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.string(),
    draft: z.boolean(),
    author: z.string().default("Anonimo"),
    rssauthor: z.string().default("Anonimo"),
    copyright: z.string().default("2024 ©️ComiDólar"),
    theme: z.string(),
    tags: z.array(z.string()).optional(),
    hideImage: z.boolean().optional(),
  }),
});

export const collections = {
  blog: blogCollection,
};
