import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import path from "pathe";
// import { db } from "~/db/index.ts";

const yamlExt = "yaml";
const yamlGlob = ["*", yamlExt].join(".");
const collectionsBase = "content";

const global = defineCollection({
  loader: glob({
    pattern: ["global", yamlExt].join("."),
    base: collectionsBase,
  }),
});

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

const donate = defineCollection({
  loader: glob({
    pattern: ["donate", yamlExt].join("."),
    base: collectionsBase,
  }),
});

const vop = defineCollection({
  loader: glob({
    pattern: ["vop", yamlExt].join("."),
    base: collectionsBase,
  }),
});

const gdpr = defineCollection({
  loader: glob({
    pattern: ["gdpr", yamlExt].join("."),
    base: collectionsBase,
  }),
});

const footer = defineCollection({
  loader: glob({
    pattern: ["footer", yamlExt].join("."),
    base: collectionsBase,
  }),
});

// const placesParameters = defineCollection({
//   loader: async () => {
//     const parameters = await db.query.parameter.findMany();
//     return parameters.map((parameter) => ({
//       id: parameter.id.toString(),
//       type: parameter.type,
//       description: parameter.description,
//       name: parameter.name,
//     }));
//   },
// });
//
// const placesParametersOptions = defineCollection({
//   loader: async () => {
//     const parametersOptions = await db.query.parameterOption.findMany();
//     return parametersOptions.map((parameterOption) => ({
//       id: parameterOption.id.toString(),
//       name: parameterOption.name,
//     }));
//   },
// });

export const collections = {
  global,
  landing,
  guides,
  guidesCategories,
  guidesJourneys,
  contact,
  donate,
  vop,
  gdpr,
  footer,
  //placesParameters,
  //placesParametersOptions,
};
