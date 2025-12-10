import { algoliasearch } from "algoliasearch";
import { db } from "~/db/index.ts";
import * as schema from "~/db/schema.ts";
import { inArray, eq, gt, and, gte } from "drizzle-orm";
import { convert } from "html-to-text";
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
import { visit } from "unist-util-visit";
import { parseFragment, serializeOuter } from "parse5";

const ALGOLIA_APP_ID = process.env.ALGOLIA_APP_ID;
const ALGOLIA_ADMIN_KEY = process.env.ALGOLIA_ADMIN_KEY;

const client = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_ADMIN_KEY);
const collectionBase = path.join(process.cwd(), "content");

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

async function indexGuidesCategories() {
  console.log("Inserting into GUIDES_CATEGORIES");

  const filePaths = await glob(
    path.join(collectionBase, "guides_categories", "*.yaml"),
  );
  for (const filePath of filePaths) {
    const data = parse(await fs.readFile(filePath, "utf8"));

    const algoliaObject = {
      title: data.title,
      descriptionHtml: splitTopLevelElementsWithParse5(
        await processHtml(data.description),
      ),
      slug: path.parse(filePath).name,
    };

    await client.addOrUpdateObject({
      indexName: "guides_categories",
      objectID: data.uuid,
      body: algoliaObject,
    });

    console.log(`- Inserted ID ${data.uuid}`);
  }
}

async function indexGuidesJourneys() {
  console.log("Inserting into GUIDES_JOURNEYS");

  let categories = [];
  const categoriesFilePaths = await glob(
    path.join(collectionBase, "guides_categories", "*.yaml"),
  );
  for (const categoryFilePath of categoriesFilePaths) {
    categories.push(parse(await fs.readFile(categoryFilePath, "utf8")));
  }
  categories = categories.reduce((acc, item) => {
    acc[item.uuid] = item;
    return acc;
  }, {});

  const filePaths = await glob(
    path.join(collectionBase, "guides_journeys", "*.yaml"),
  );
  for (const filePath of filePaths) {
    const data = parse(await fs.readFile(filePath, "utf8"));

    const algoliaSteps = [];
    for (const step of data.steps) {
      algoliaSteps.push({
        title: step.title,
        bodyHtml: splitTopLevelElementsWithParse5(await processHtml(step.body)),
      });
    }

    const algoliaObject = {
      title: data.title,
      descriptionHtml: splitTopLevelElementsWithParse5(
        await processHtml(data.description),
      ),
      steps: algoliaSteps,
      category: categories[data.category].title,
      slug: path.parse(filePath).name,
    };

    await client.addOrUpdateObject({
      indexName: "guides_journeys",
      objectID: data.uuid,
      body: algoliaObject,
    });

    console.log(`- Inserted ID ${data.uuid}`);
  }
}

async function indexLocations() {
  console.log("Inserting into LOCATIONS");

  const places = await db.query.place.findMany({
    columns: {
      addressId: true,
    },
  });

  const addresses = await db.query.address.findMany({
    columns: {
      townId: true,
    },
    where: inArray(
      schema.address.id,
      places.map((place) => place.addressId),
    ),
  });

  const townIds = [...new Set(addresses.map((address) => address.townId))];

  const counties = await db.query.county.findMany();
  const districts = await db.query.district.findMany();
  const towns = await db.query.town.findMany({
    where: inArray(schema.town.id, townIds),
  });

  const items = [];
  let sortOrder = 0;

  const sortedCounties = [...counties].sort((a, b) =>
    a.name.localeCompare(b.name),
  );

  for (const c of sortedCounties) {
    items.push({
      name: `${c.name} kraj`,
      type: "county",
      code: c.code,
      sortOrder: sortOrder++,
    });

    const districtsInCounty = districts.filter((d) => d.countyId === c.id);
    const sortedDistricts = [...districtsInCounty].sort((a, b) =>
      a.name.localeCompare(b.name),
    );

    for (const d of sortedDistricts) {
      items.push({
        name: `${d.name} (okres)`,
        type: "district",
        code: d.code,
        sortOrder: sortOrder++,
      });

      const townsInDistrict = towns.filter((t) => t.districtId === d.id);
      const sortedTowns = [...townsInDistrict].sort((a, b) =>
        a.name.localeCompare(b.name),
      );

      for (const t of sortedTowns) {
        items.push({
          name: t.name,
          type: "town",
          code: t.code,
          sortOrder: sortOrder++,
        });
      }
    }
  }

  for (const item of items) {
    if (!item.code) {
      console.log("Item has no code:", item);
      continue;
    }

    await client.addOrUpdateObject({
      indexName: "locations",
      objectID: item.code,
      body: item,
    });

    console.log(`- Inserted ID ${item.code}`);
  }
}

async function indexPlaces() {
  console.log("Inserting into PLACES");

  const places = await db.query.place.findMany({
    columns: {
      id: true,
    },
    where: and(
      eq(schema.place.active, 1),
      gte(schema.place.id, 1183),
    ),
  });

  const parameters = await db.query.parameter.findMany();

  const parameterOptions = await db.query.parameterOption.findMany();

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

  for (const { id } of places) {
    const place = await db.query.place.findFirst({
      where: eq(schema.place.id, id),
    });

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

    const path = (await db.query.alias.findFirst({
      columns: {
        path: true,
      },
      where: and(
        eq(schema.alias.paramId, id),
        eq(schema.alias.presenter, "Place:default"),
      ),
    })).path;

    const algoliaObject = {
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
      path: path,
    };

    await client.addOrUpdateObject({
      indexName: "places",
      objectID: id,
      body: algoliaObject,
    });

    console.log(`- Inserted ID ${id}`);
  }
}

async function indexPlacesCategories() {
  console.log("Inserting into PLACES_CATEGORIES");

  const categories = await db.query.category.findMany();

  for (const category of categories) {
    const algoliaObject = {
      alias: category.alias,
      name: category.name,
      descriptionHtml: splitTopLevelElementsWithParse5(
        category.description.replace(/<img[^>]*>/gi, ""),
      ),
      color: category.color,
      sortOrder: category.sortOrder,
    };

    await client.addOrUpdateObject({
      indexName: "places_categories",
      objectID: category.id,
      body: algoliaObject,
    });

    console.log(`- Inserted ID ${category.id}`);
  }
}

indexGuidesCategories();
indexGuidesJourneys();
//indexLocations();
//indexPlacesCategories();
//indexPlaces();
