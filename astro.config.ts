import solidJs from "@astrojs/solid-js";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";
import node from "@astrojs/node";
import AstroPWA from "@vite-pwa/astro";

export default defineConfig({
  adapter: node({
    mode: "standalone",
  }),
  trailingSlash: "never",
  integrations: [AstroPWA({}), solidJs()],
  vite: {
    plugins: [tailwindcss()],
  },
  site: "https://kompasio-site-prod.apps.czetech.net"
});
