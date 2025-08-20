import type { APIRoute } from "astro";
import { db } from "../../../db";
import { category } from "../../../db/schema";
import { eq } from "drizzle-orm";

// This ensures the endpoint is pre-rendered into a static file at build time.
export const prerender = true;

export const GET: APIRoute = async () => {
  const activeCategories = await db.query.category.findMany({
    // Select only the required fields for the response.
    columns: {
      id: true,
      color: true,
      name: true,
    },
    // Filter to include only categories where the 'active' flag is true.
    where: eq(category.active, true),
  });

  return new Response(JSON.stringify(activeCategories), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
};
