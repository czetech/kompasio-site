export const prerender = false

import type { APIRoute } from 'astro';
import { db } from '../../db';
import {
  address,
  category,
  county,
  district,
  place,
  placeCategory,
  town,
} from '../../db/schema';import { inArray, eq } from 'drizzle-orm';

export const GET: APIRoute = async ({request}) => {
  try {
    const { searchParams } = new URL(request.url);
    // Read county, district, or town IDs from the URL
    const townIdParam = searchParams.get('townId');
    const districtIdParam = searchParams.get('districtId');
    const countyIdParam = searchParams.get('countyId');

    let placeFilter: any = undefined; // This will hold our Drizzle filter condition

    // The order of these checks is important to establish priority: town > district > county.
    if (townIdParam) {
      const townId = parseInt(townIdParam, 10);
      // Ensure the ID is a valid number before querying
      if (!isNaN(townId)) {
        const addresses = await db.query.address.findMany({
          where: eq(address.townId, townId), // Filter addresses directly by townId
          columns: { id: true },
        });
        const addressIds = addresses.map((a) => a.id);

        // If no addresses are in this town, no places can be found.
        if (addressIds.length === 0) {
          return new Response(JSON.stringify([]), { status: 200 });
        }
        placeFilter = inArray(place.addressId, addressIds);
      }
    } else if (districtIdParam) {
      const districtId = parseInt(districtIdParam, 10);
      if (!isNaN(districtId)) {
        // Find all towns within the given district
        const towns = await db.query.town.findMany({
          where: eq(town.districtId, districtId),
          columns: { id: true },
        });
        const townIds = towns.map((t) => t.id);

        if (townIds.length === 0) {
          return new Response(JSON.stringify([]), { status: 200 });
        }

        // Find all addresses within those towns
        const addresses = await db.query.address.findMany({
          where: inArray(address.townId, townIds),
          columns: { id: true },
        });
        const addressIds = addresses.map((a) => a.id);

        if (addressIds.length === 0) {
          return new Response(JSON.stringify([]), { status: 200 });
        }
        placeFilter = inArray(place.addressId, addressIds);
      }
    } else if (countyIdParam) {
      const countyId = parseInt(countyIdParam, 10);
      if (!isNaN(countyId)) {
        // Find all districts within the given county
        const districts = await db.query.district.findMany({
          where: eq(district.countyId, countyId),
          columns: { id: true },
        });
        const districtIds = districts.map((d) => d.id);

        if (districtIds.length === 0) {
          return new Response(JSON.stringify([]), { status: 200 });
        }

        // Find all towns within those districts
        const towns = await db.query.town.findMany({
          where: inArray(town.districtId, districtIds),
          columns: { id: true },
        });
        const townIds = towns.map((t) => t.id);

        if (townIds.length === 0) {
          return new Response(JSON.stringify([]), { status: 200 });
        }

        // Find all addresses within those towns
        const addresses = await db.query.address.findMany({
          where: inArray(address.townId, townIds),
          columns: { id: true },
        });
        const addressIds = addresses.map((a) => a.id);

        if (addressIds.length === 0) {
          return new Response(JSON.stringify([]), { status: 200 });
        }
        placeFilter = inArray(place.addressId, addressIds);
      }
    }

    // 1. Fetch the initial batch of places
    const initialPlaces = await db.query.place.findMany({
      columns: {
        id: true,
        name: true,
        shortDescription: true, // Renamed from short_description to match schema
        addressId: true,        // Renamed from address_id to match schema
      },
      where: placeFilter,
      limit: 10,
    });

    if (initialPlaces.length === 0) {
      return new Response(JSON.stringify([]), { status: 200 });
    }

    // 2. Collect all necessary foreign keys from the initial data.
    // This prepares us for the next batch of queries.
    const placeIds = initialPlaces.map((p) => p.id);
    const addressIds = initialPlaces
      .map((p) => p.addressId)
      .filter((id): id is number => id !== null); // Correctly filter out nulls

    // 3. Fetch all directly related data in parallel.
    // This is efficient as it runs two queries simultaneously.
    const [placeCategories, addresses] = await Promise.all([
      // Get all place-category relations for the places we fetched
      db.query.placeCategory.findMany({
        where: inArray(placeCategory.placeId, placeIds), // Corrected column name
      }),
      // Get all addresses for the places we fetched
      db.query.address.findMany({
        where: inArray(address.id, addressIds),
        columns: {
          id: true,
          townId: true, // Renamed from town_id
        },
      }),
    ]);

    // 4. From the second batch of data, collect the next and final set of foreign keys.
    const categoryIds = placeCategories.map((pc) => pc.categoryId); // Corrected column name
    const townIds = addresses
      .map((a) => a.townId)
      .filter((id): id is number => id !== null);

    // 5. Fetch the final pieces of lookup data (categories and towns) in parallel.
    const [categories, towns] = await Promise.all([
      db.query.category.findMany({
        where: inArray(category.id, categoryIds),
        columns: { id: true, name: true },
      }),
      db.query.town.findMany({
        where: inArray(town.id, townIds),
        columns: { id: true, name: true },
      }),
    ]);

    // 6. Stitch all the fetched data together in the application.
    // Using Maps provides an efficient O(1) average time complexity for lookups.
    const townMap = new Map(towns.map((t) => [t.id, t.name]));
    const categoryMap = new Map(categories.map((c) => [c.id, c.name]));

    // Create a map from address ID to its town's name
    const addressTownMap = new Map(
      addresses.map((a) => [a.id, townMap.get(a.townId!)])
    );

    // Create a map from place ID to a list of its category names
    const placeCategoriesMap = new Map<number, string[]>();
    for (const pc of placeCategories) {
      const categoryName = categoryMap.get(pc.categoryId);
      if (categoryName) {
        // If the map doesn't have this placeId yet, initialize it
        if (!placeCategoriesMap.has(pc.placeId)) {
          placeCategoriesMap.set(pc.placeId, []);
        }
        placeCategoriesMap.get(pc.placeId)!.push(categoryName);
      }
    }

    // 7. Assemble the final data structure for the API response.
    const places = initialPlaces.map((p) => ({
      placeName: p.name,
      placeShortDescription: p.shortDescription,
      townName: p.addressId ? addressTownMap.get(p.addressId) ?? null : null,
      categoryNames: placeCategoriesMap.get(p.id) ?? [],
    }));

    return new Response(
      JSON.stringify(places), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({ error: 'Internal Server Error' }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
};
