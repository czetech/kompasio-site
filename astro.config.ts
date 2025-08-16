import solidJs from "@astrojs/solid-js";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";
import node from "@astrojs/node";

export default defineConfig({
  adapter: node({
    mode: "standalone",
  }),
  trailingSlash: "never",
  integrations: [solidJs()],
  vite: {
    plugins: [tailwindcss()],
  },
});
