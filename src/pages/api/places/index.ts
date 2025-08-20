import type { APIRoute } from "astro";
import { db } from "../../../db";
import { place } from "../../../db/schema";

// This ensures the endpoint is pre-rendered at build time.
export const prerender = true;

export const GET: APIRoute = async () => {
  const allPlaces = await db.query.place.findMany({
    columns: {
      id: true,
    },
  });

  const placeIds = allPlaces.map((p) => p.id);

  return new Response(JSON.stringify(placeIds), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
};
