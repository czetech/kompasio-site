import { algoliasearch } from "algoliasearch";
import { db } from "~/db/index.ts";
import * as schema from "~/db/schema.ts";
import { inArray, eq, and } from "drizzle-orm";
import fs from "fs/promises";
import path from "path";
import { glob } from "glob";
import { parse } from "yaml";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import rehypeExternalLinks from "rehype-external-links";
import rehypeStringify from "rehype-stringify";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { parseFragment, serializeOuter } from "parse5";
import { fileURLToPath } from "url";

const ALGOLIA_APP_ID = process.env.ALGOLIA_APP_ID;
const ALGOLIA_ADMIN_KEY = process.env.ALGOLIA_ADMIN_KEY;

const client = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_ADMIN_KEY);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const collectionBase = path.resolve(__dirname, "..", "..", "content");

const VALID_TYPES = [
  "guides_categories",
  "guides_journeys",
  "places",
  "places_categories",
] as const;
type IndexType = (typeof VALID_TYPES)[number];

function parseArgs(): { type: IndexType | null; id: string | null } {
  const args = process.argv.slice(2);
  let type: IndexType | null = null;
  let id: string | null = null;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--type" && args[i + 1]) {
      const value = args[++i];
      if (!VALID_TYPES.includes(value as IndexType)) {
        console.error(
          `Invalid type: ${value}. Valid types: ${VALID_TYPES.join(", ")}`,
        );
        process.exit(1);
      }
      type = value as IndexType;
    } else if (args[i] === "--id" && args[i + 1]) {
      id = args[++i];
    } else {
      console.error(
        `Usage: tsx src/scripts/algolia-index.ts [--type <type>] [--id <id>]`,
      );
      process.exit(1);
    }
  }

  if (id && !type) {
    console.error("--id requires --type");
    process.exit(1);
  }

  return { type, id };
}

const processHtml = async (content) =>
  String(
    await unified()
      .use(remarkParse)
      .use(remarkGfm)
      .use(remarkRehype, { allowDangerousHtml: true })
      .use(rehypeRaw)
      .use(rehypeExternalLinks, {
        rel: ["nofollow", "noopener", "noreferrer"],
        target: "_blank",
      })
      .use(rehypeStringify)
      .process(content),
  );

function splitTopLevelElementsWithParse5(html) {
  return parseFragment(html).childNodes.flatMap((node) =>
    node.nodeName === "#text" && !node.value.trim()
      ? []
      : [serializeOuter(node)],
  );
}

async function syncSingle(
  indexName: string,
  objectID: string | number,
  body: Record<string, any> | null,
) {
  if (body === null) {
    console.log(`- ID ${objectID} not in source, deleting from Algolia`);
    await client.deleteObject({
      indexName,
      objectID: String(objectID),
    });
  } else {
    await client.addOrUpdateObject({
      indexName,
      objectID: String(objectID),
      body,
    });
    console.log(`- Synced ID ${objectID}`);
  }
}

async function replaceAll(
  indexName: string,
  objects: Array<Record<string, any> & { objectID: string }>,
) {
  if (objects.length === 0) {
    console.error(
      `- ABORT: 0 objects built for ${indexName}. Refusing to wipe index. ` +
        `Check that source data exists.`,
    );
    process.exit(1);
  }
  console.log(`- Built ${objects.length} objects, replacing index atomically`);
  await client.replaceAllObjects({
    indexName,
    objects,
  });
  console.log(`- Replaced ${indexName} with ${objects.length} objects`);
}

// ----- guides_categories -----

async function buildGuideCategoryObject(filePath: string, data: any) {
  return {
    title: data.title,
    descriptionHtml: splitTopLevelElementsWithParse5(
      await processHtml(data.description),
    ),
    slug: path.parse(filePath).name,
  };
}

async function loadGuideCategoryFiles() {
  const filePaths = await glob(
    path.join(collectionBase, "guides_categories", "*.yaml"),
  );
  const files: { uuid: string; filePath: string; data: any }[] = [];
  for (const filePath of filePaths) {
    const data = parse(await fs.readFile(filePath, "utf8"));
    files.push({ uuid: data.uuid, filePath, data });
  }
  return files;
}

async function indexGuidesCategories(singleId: string | null) {
  console.log("Syncing guides_categories");
  const files = await loadGuideCategoryFiles();

  if (singleId) {
    const file = files.find((f) => f.uuid === singleId);
    const body = file
      ? await buildGuideCategoryObject(file.filePath, file.data)
      : null;
    await syncSingle("guides_categories", singleId, body);
    return;
  }

  const objects = [];
  for (const file of files) {
    const body = await buildGuideCategoryObject(file.filePath, file.data);
    objects.push({ objectID: file.uuid, ...body });
    console.log(`- Built ID ${file.uuid}`);
  }
  await replaceAll("guides_categories", objects);
}

// ----- guides_journeys -----

async function indexGuidesJourneys(singleId: string | null) {
  console.log("Syncing guides_journeys");

  const categoryFiles = await loadGuideCategoryFiles();
  const categories = categoryFiles.reduce(
    (acc, item) => {
      acc[item.uuid] = item.data;
      return acc;
    },
    {} as Record<string, any>,
  );

  const filePaths = await glob(
    path.join(collectionBase, "guides_journeys", "*.yaml"),
  );
  const files: { uuid: string; filePath: string; data: any }[] = [];
  for (const filePath of filePaths) {
    const data = parse(await fs.readFile(filePath, "utf8"));
    files.push({ uuid: data.uuid, filePath, data });
  }

  const buildObject = async (filePath: string, data: any) => {
    const algoliaSteps = [];
    for (const step of data.steps) {
      algoliaSteps.push({
        title: step.title,
        bodyHtml: splitTopLevelElementsWithParse5(await processHtml(step.body)),
      });
    }
    return {
      title: data.title,
      descriptionHtml: splitTopLevelElementsWithParse5(
        await processHtml(data.description),
      ),
      steps: algoliaSteps,
      category: categories[data.category].title,
      slug: path.parse(filePath).name,
    };
  };

  if (singleId) {
    const file = files.find((f) => f.uuid === singleId);
    const body = file ? await buildObject(file.filePath, file.data) : null;
    await syncSingle("guides_journeys", singleId, body);
    return;
  }

  const objects = [];
  for (const file of files) {
    const body = await buildObject(file.filePath, file.data);
    objects.push({ objectID: file.uuid, ...body });
    console.log(`- Built ID ${file.uuid}`);
  }
  await replaceAll("guides_journeys", objects);
}

// ----- places -----

async function buildPlaceObject(place: any, placeParameterValues: any[]) {
  const id = place.id;

  const placeCategories = await db.query.placeCategory.findMany({
    where: eq(schema.placeCategory.placeId, id),
  });

  const categories = await db.query.category.findMany({
    where: inArray(
      schema.category.id,
      placeCategories.map((placeCategory) => placeCategory.categoryId),
    ),
  });

  let address = null;
  let town = null;
  let district = null;
  let county = null;

  if (place.addressId) {
    address = await db.query.address.findFirst({
      where: eq(schema.address.id, place.addressId),
    });

    if (address && address.townId) {
      town = await db.query.town.findFirst({
        where: eq(schema.town.id, address.townId),
      });

      if (town && town.districtId) {
        district = await db.query.district.findFirst({
          where: eq(schema.district.id, town.districtId),
        });

        if (district && district.countyId) {
          county = await db.query.county.findFirst({
            where: eq(schema.county.id, district.countyId),
          });
        }
      }
    }
  }

  const parameters = {};
  placeParameterValues
    .filter((ppv) => ppv.placeId === id)
    .forEach((ppv) => {
      if (!parameters[ppv.parameterId]) {
        parameters[ppv.parameterId] = [];
      }
      ppv.value.split(",").forEach((num) => {
        const numInt = parseInt(num);
        if (Number.isNaN(numInt)) {
          console.log("Invalid number: got NaN");
        } else {
          parameters[ppv.parameterId].push(numInt);
        }
      });
    });
  const dedupedParameters = Object.fromEntries(
    Object.entries(parameters).map(([key, arr]) => [key, [...new Set(arr)]]),
  );

  const aliasPath = (
    await db.query.alias.findFirst({
      columns: {
        path: true,
      },
      where: and(
        eq(schema.alias.paramId, id),
        eq(schema.alias.presenter, "Place:default"),
      ),
    })
  ).path;

  return {
    alias: place.alias,
    name: place.name,
    shortDescriptionHtml: splitTopLevelElementsWithParse5(
      place.shortDescription.replace(/<img[^>]*>/gi, ""),
    ),
    descriptionHtml: splitTopLevelElementsWithParse5(
      place.description.replace(/<img[^>]*>/gi, ""),
    ),
    email: place.publicEmail,
    address: address
      ? {
          id: address.id,
          street: address.street,
          postcode: address.postcode,
        }
      : null,
    town: town
      ? {
          id: town.id,
          code: town.code,
          name: town.name,
        }
      : null,
    district: district
      ? {
          id: district.id,
          code: district.code,
          name: district.name,
        }
      : null,
    county: county
      ? {
          id: county.id,
          code: county.code,
          name: county.name,
        }
      : null,
    categories: categories.map((category) => ({
      alias: category.alias,
      name: category.name,
      color: category.color,
      sortOrder: category.sortOrder,
    })),
    _geoloc:
      place.locationLat != null && place.locationLng != null
        ? {
            lat: place.locationLat,
            lng: place.locationLng,
          }
        : null,
    parameters: dedupedParameters,
    path: aliasPath,
  };
}

async function indexPlaces(singleId: string | null) {
  console.log("Syncing places");

  const parameters = await db.query.parameter.findMany();

  await client.setSettings({
    indexName: "places",
    indexSettings: {
      attributesForFaceting: [
        "categories.alias",
        "county.code",
        "county.name",
        "district.code",
        "town.code",
        ...parameters.map((parameter) => `parameters.${parameter.id}`),
      ],
    },
  });

  const placeParameterValues = await db.query.placeParameterValue.findMany();

  if (singleId) {
    const id = parseInt(singleId);
    const place = await db.query.place.findFirst({
      where: and(eq(schema.place.id, id), eq(schema.place.active, true)),
    });
    const body = place
      ? await buildPlaceObject(place, placeParameterValues)
      : null;
    await syncSingle("places", singleId, body);
    return;
  }

  const places = await db.query.place.findMany({
    where: eq(schema.place.active, true),
  });

  const objects = [];
  for (const place of places) {
    const body = await buildPlaceObject(place, placeParameterValues);
    objects.push({ objectID: String(place.id), ...body });
    console.log(`- Built ID ${place.id}`);
  }
  await replaceAll("places", objects);
}

// ----- places_categories -----

function buildPlaceCategoryObject(category: any) {
  return {
    alias: category.alias,
    name: category.name,
    descriptionHtml: splitTopLevelElementsWithParse5(
      category.description.replace(/<img[^>]*>/gi, ""),
    ),
    color: category.color,
    sortOrder: category.sortOrder,
  };
}

async function indexPlacesCategories(singleId: string | null) {
  console.log("Syncing places_categories");

  if (singleId) {
    const id = parseInt(singleId);
    const category = await db.query.category.findFirst({
      where: eq(schema.category.id, id),
    });
    const body = category ? buildPlaceCategoryObject(category) : null;
    await syncSingle("places_categories", singleId, body);
    return;
  }

  const categories = await db.query.category.findMany();
  const objects = [];
  for (const category of categories) {
    objects.push({
      objectID: String(category.id),
      ...buildPlaceCategoryObject(category),
    });
    console.log(`- Built ID ${category.id}`);
  }
  await replaceAll("places_categories", objects);
}

async function syncType(type: IndexType, id: string | null) {
  const indexFn = {
    guides_categories: indexGuidesCategories,
    guides_journeys: indexGuidesJourneys,
    places: indexPlaces,
    places_categories: indexPlacesCategories,
  }[type];

  await indexFn(id);
}

async function main() {
  const { type, id } = parseArgs();

  if (type) {
    await syncType(type, id);
  } else {
    for (const t of VALID_TYPES) {
      await syncType(t, null);
    }
  }

  process.exit(0);
}

main();
