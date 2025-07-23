import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import path from "pathe";

const yamlExt = ".yaml";
const yamlGlob = `*${yamlExt}`;
const collectionsBase = "content";

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

export const collections = { guidesCategories, guidesJourneys };
