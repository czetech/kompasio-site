export const prerender = false;

import type { APIRoute } from "astro";
import { db } from "../../db";
import { county, district, town } from "../../db/schema";

export const GET: APIRoute = async () => {
  try {
    // Since we need all the data for the dropdowns, we fetch all three tables
    // in parallel. This is very efficient for databases that don't support
    // complex joins for nested data fetching.
    const [countiesData, districtsData, townsData] = await Promise.all([
      db.query.county.findMany({
        columns: {
          id: true,
          name: true,
        },
        orderBy: (county, { asc }) => [asc(county.name)],
      }),
      db.query.district.findMany({
        columns: {
          id: true,
          name: true,
          countyId: true,
        },
        orderBy: (district, { asc }) => [asc(district.name)],
      }),
      db.query.town.findMany({
        columns: {
          id: true,
          name: true,
          districtId: true,
        },
        orderBy: (town, { asc }) => [asc(town.name)],
      }),
    ]);

    // Return the data in a structured format that's easy for the
    // frontend to consume.
    return new Response(
      JSON.stringify({
        counties: countiesData,
        districts: districtsData,
        towns: townsData,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  } catch (error) {
    console.error("Failed to fetch location data:", error);
    return new Response(JSON.stringify({ message: "Internal Server Error" }), {
      status: 500,
    });
  }
};
