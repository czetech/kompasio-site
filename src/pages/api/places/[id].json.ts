import type { APIRoute } from "astro";
import { db } from "../../../db";
import {
  address,
  category,
  place,
  placeCategory,
  town,
} from "../../../db/schema";
import { inArray, eq } from "drizzle-orm";

export async function getStaticPaths() {
  const allPlaces = await db.query.place.findMany({
    columns: {
      id: true,
    },
  });

  return allPlaces.map((p) => ({
    params: { id: p.id.toString() },
  }));
}

export const GET: APIRoute = async ({ params }) => {
  const placeId = parseInt(params.id!, 10);

  // 1. Fetch the specific place by its ID.
  const foundPlace = await db.query.place.findFirst({
    columns: {
      id: true,
      name: true,
      shortDescription: true,
      description: true,
      addressId: true,
    },
    where: eq(place.id, placeId),
  });

  // 2. Fetch all directly related data in parallel.
  const [placeCategories, placeAddress] = await Promise.all([
    // Get all place-category relations for the place
    db.query.placeCategory.findMany({
      where: eq(placeCategory.placeId, placeId),
    }),
    // Get the address for the place, if it exists
    foundPlace.addressId
      ? db.query.address.findFirst({
          where: eq(address.id, foundPlace.addressId),
          columns: {
            townId: true,
          },
        })
      : Promise.resolve(null),
  ]);

  // 3. From the second batch of data, collect the next and final set of foreign keys.
  const categoryIds = placeCategories.map((pc) => pc.categoryId);
  const townId = placeAddress?.townId;

  // 4. Fetch the final pieces of lookup data (categories and town) in parallel.
  const [categories, townData] = await Promise.all([
    categoryIds.length > 0
      ? db.query.category.findMany({
          where: inArray(category.id, categoryIds),
          columns: { name: true },
        })
      : Promise.resolve([]),
    townId
      ? db.query.town.findFirst({
          where: eq(town.id, townId),
          columns: { name: true },
        })
      : Promise.resolve(null),
  ]);

  // 5. Assemble the final data structure for the API response.
  const result = {
    id: foundPlace.id,
    placeName: foundPlace.name,
    placeShortDescription: foundPlace.shortDescription,
    placeDescription: foundPlace.description,
    townName: townData?.name ?? null,
    categoryNames: categories.map((c) => c.name),
  };

  return new Response(JSON.stringify(result), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
};
