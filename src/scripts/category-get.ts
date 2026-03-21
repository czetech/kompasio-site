import { eq } from "drizzle-orm";
import { stringify } from "yaml";
import { db } from "~/db/index.ts";
import * as schema from "~/db/schema.ts";

async function main() {
  const categoryId = parseInt(process.argv[2]);
  if (isNaN(categoryId)) {
    console.error("Usage: tsx src/scripts/category-get.ts <category_id>");
    process.exit(1);
  }

  const category = await db.query.category.findFirst({
    where: eq(schema.category.id, categoryId),
  });

  if (!category) {
    console.error(`Category with ID ${categoryId} not found`);
    process.exit(1);
  }

  const result = {
    id: category.id,
    name: category.name,
    description: category.description,
  };

  console.log(stringify(result, { lineWidth: 0 }));

  process.exit(0);
}

main();
