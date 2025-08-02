import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import path from "pathe";

const yamlExt = "yaml";
const yamlGlob = ["*", yamlExt].join(".");
const collectionsBase = "content";

const landing = defineCollection({
  loader: glob({
    pattern: ["landing", yamlExt].join("."),
    base: collectionsBase,
  }),
});

const guides = defineCollection({
  loader: glob({
    pattern: ["guides", yamlExt].join("."),
    base: collectionsBase,
  }),
});

const guidesCategories = defineCollection({
  loader: glob({
    pattern: yamlGlob,
    base: path.join(collectionsBase, "guides_categories"),
  }),
});

const guidesJourneys = defineCollection({
  loader: glob({
    pattern: yamlGlob,
    base: path.join(collectionsBase, "guides_journeys"),
  }),
});

export const collections = { landing, guides, guidesCategories, guidesJourneys };
