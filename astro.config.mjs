import { defineConfig } from "astro/config";
import vercel from "@astrojs/vercel";
import react from "@astrojs/react";
import mdx from "@astrojs/mdx";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  site: "https://comidolar.com.ar",
  integrations: [
    react({
      experimentalReactChildren: true,
    }),
    mdx(),
  ],
  vite: {
    plugins: [tailwindcss()],
    cacheDir: "./.astro/vite_cache",
  },
  output: "static",
  // Solo las páginas con `prerender = false` (/ y /calculadora) pasan por ISR
  adapter: vercel({ isr: { expiration: 60 } }),
});
