import type { APIRoute } from "astro";
import { db } from "../../../db";
import { category } from "../../../db/schema";
import { eq } from "drizzle-orm";

// This ensures the endpoint is pre-rendered into a static file at build time.
export const prerender = true;

export const GET: APIRoute = async () => {
  const activeCategories = await db.query.category.findMany({
    // Select only the required fields for the response.
    // We still select 'id' here because that's its name in the database.
    columns: {
      id: true,
      color: true,
      name: true,
      description: true,
    },
    // Filter to include only categories where the 'active' flag is true.
    where: eq(category.active, true),
  });

  // Transform the fetched data to rename 'id' to 'objectID'
  const transformedCategories = activeCategories.map(({ id, ...rest }) => ({
    objectID: id, // Rename 'id' to 'objectID'
    ...rest,     // Include all other properties (color, name, description)
  }));

  return new Response(JSON.stringify(transformedCategories), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
};
