import solidJs from "@astrojs/solid-js";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

export default defineConfig({
  trailingSlash: "never",
  integrations: [solidJs()],
  vite: {
    plugins: [
      tailwindcss(),
    ],
  },
});
