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

const contact = defineCollection({
  loader: glob({
    pattern: ["contact", yamlExt].join("."),
    base: collectionsBase,
  }),
});

const vpp = defineCollection({
  loader: glob({
    pattern: ["vpp", yamlExt].join("."),
    base: collectionsBase,
  }),
});

const gdpr = defineCollection({
  loader: glob({
    pattern: ["gdpr", yamlExt].join("."),
    base: collectionsBase,
  }),
});

export const collections = { landing, guides, guidesCategories, guidesJourneys, contact, vpp, gdpr };
