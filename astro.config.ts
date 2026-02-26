import solidJs from "@astrojs/solid-js";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";
import yaml from "@rollup/plugin-yaml";

export default defineConfig({
  outDir: "dist-astro",
  trailingSlash: "never",
  integrations: [solidJs()],
  vite: {
    plugins: [tailwindcss(), yaml()],
  },
});
