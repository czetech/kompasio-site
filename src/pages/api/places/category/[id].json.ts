import type { APIRoute } from "astro";
import { db } from "../../../../db";
import { placeCategory } from "../../../../db/schema";
import { eq } from "drizzle-orm";

export async function getStaticPaths() {
  // Fetch all existing place-category relationships.
  const allRelations = await db.query.placeCategory.findMany({
    columns: {
      categoryId: true,
    },
  });

  // Get a unique set of category IDs that are in use.
  const uniqueCategoryIds = [
    ...new Set(allRelations.map((rel) => rel.categoryId)),
  ];

  // Create a static path for each unique category ID.
  return uniqueCategoryIds.map((id) => ({
    params: { id: id.toString() },
  }));
}

export const GET: APIRoute = async ({ params }) => {
  const categoryId = parseInt(params.id!, 10);

  if (isNaN(categoryId)) {
    // This case should ideally not be reached if getStaticPaths is correct.
    return new Response(JSON.stringify({ error: "Invalid ID format" }), {
      status: 400,
    });
  }

  const placesInCategory = await db.query.placeCategory.findMany({
    where: eq(placeCategory.categoryId, categoryId),
    columns: {
      placeId: true,
    },
  });

  const placeIds = placesInCategory.map((p) => p.placeId);

  return new Response(JSON.stringify(placeIds), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
};
