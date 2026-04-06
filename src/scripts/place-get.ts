import { eq, inArray } from "drizzle-orm";
import { stringify } from "yaml";
import { db } from "~/db/index.ts";
import * as schema from "~/db/schema.ts";

async function main() {
  const placeId = parseInt(process.argv[2]);
  if (isNaN(placeId)) {
    console.error("Usage: tsx src/scripts/place-get.ts <place_id>");
    process.exit(1);
  }

  const place = await db.query.place.findFirst({
    where: eq(schema.place.id, placeId),
  });

  if (!place) {
    console.error(`Place with ID ${placeId} not found`);
    process.exit(1);
  }

  // Address
  let address: string | null = null;
  if (place.addressId) {
    const addressRow = await db.query.address.findFirst({
      where: eq(schema.address.id, place.addressId),
    });
    if (addressRow) {
      const parts: string[] = [];
      if (addressRow.street) parts.push(addressRow.street);
      if (addressRow.townId) {
        const town = await db.query.town.findFirst({
          where: eq(schema.town.id, addressRow.townId),
        });
        if (town) parts.push(town.name);
      }
      if (addressRow.postcode) parts.push(addressRow.postcode);
      address = parts.join(", ");
    }
  }

  // Categories
  const placeCategories = await db.query.placeCategory.findMany({
    where: eq(schema.placeCategory.placeId, placeId),
  });
  const categories =
    placeCategories.length > 0
      ? (
          await db.query.category.findMany({
            where: inArray(
              schema.category.id,
              placeCategories.map((pc) => pc.categoryId),
            ),
          })
        ).map((c) => c.name)
      : [];

  // Parameters
  const placeParamValues = await db.query.placeParameterValue.findMany({
    where: eq(schema.placeParameterValue.placeId, placeId),
  });

  const parameterIds = [
    ...new Set(placeParamValues.map((pv) => pv.parameterId).filter(Boolean)),
  ];

  const allParameters =
    parameterIds.length > 0
      ? await db.query.parameter.findMany({
          where: inArray(schema.parameter.id, parameterIds as number[]),
        })
      : [];

  const paramMap = new Map(
    allParameters.map((p) => [p.id, { name: p.name, type: p.type }]),
  );

  // Collect option IDs only for select/multiselect parameters
  const selectParamValues = placeParamValues.filter((pv) => {
    const param = paramMap.get(pv.parameterId!);
    return param && (param.type === "select" || param.type === "multiselect");
  });

  const allOptionIds = selectParamValues.flatMap((pv) =>
    pv.value
      .split(",")
      .map((v) => parseInt(v.trim()))
      .filter((n) => !isNaN(n)),
  );

  const allOptions =
    allOptionIds.length > 0
      ? await db.query.parameterOption.findMany({
          where: inArray(schema.parameterOption.id, allOptionIds),
        })
      : [];

  const optionMap = new Map(allOptions.map((o) => [o.id, o.name]));

  const parameters: Record<string, string | string[]> = {};
  for (const pv of placeParamValues) {
    const param = paramMap.get(pv.parameterId!);
    if (!param) continue;

    if (param.type === "select" || param.type === "multiselect") {
      const optionNames = pv.value
        .split(",")
        .map((v) => parseInt(v.trim()))
        .filter((n) => !isNaN(n))
        .map((id) => optionMap.get(id))
        .filter(Boolean) as string[];

      if (optionNames.length > 0) {
        if (!parameters[param.name]) parameters[param.name] = [];
        (parameters[param.name] as string[]).push(...optionNames);
      }
    } else if (param.type === "text") {
      parameters[param.name] = pv.value;
    }
  }

  function tryParseJson(value: string): unknown {
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }

  const result = {
    id: place.id,
    name: place.name,
    description: place.description,
    shortDescription: place.shortDescription,
    address,
    addressInstructions: place.addressInstructions || null,
    website: place.website || null,
    additionalWebsites: tryParseJson(place.additionalWebsites),
    email: place.publicEmail || null,
    additionalEmails: tryParseJson(place.additionalEmails),
    location:
      place.locationLat != null && place.locationLng != null
        ? { lat: place.locationLat, lng: place.locationLng }
        : null,
    parameters,
    categories,
    externalReferences: tryParseJson(place.externalReferences),
    internalNote: place.internalNote || null,
    eduid: place.eduid || null,
  };

  console.log(stringify(result, { lineWidth: 0 }));

  process.exit(0);
}

main();
