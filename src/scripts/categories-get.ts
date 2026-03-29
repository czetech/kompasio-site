import { asc } from "drizzle-orm";
import { stringify } from "yaml";
import { db } from "~/db/index.ts";
import * as schema from "~/db/schema.ts";

async function main() {
  const categories = await db.query.category.findMany({
    orderBy: [asc(schema.category.id)],
  });

  const result = categories.map((c) => ({
    id: c.id,
    name: c.name,
  }));

  console.log(stringify(result, { lineWidth: 0 }));

  process.exit(0);
}

main();
