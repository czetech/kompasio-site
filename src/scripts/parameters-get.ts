import { asc } from "drizzle-orm";
import { stringify } from "yaml";
import { db } from "~/db/index.ts";
import * as schema from "~/db/schema.ts";

async function main() {
  const parameters = await db.query.parameter.findMany({
    orderBy: [asc(schema.parameter.sortOrder), asc(schema.parameter.id)],
  });

  const options = await db.query.parameterOption.findMany({
    orderBy: [
      asc(schema.parameterOption.sortOrder),
      asc(schema.parameterOption.id),
    ],
  });

  const optionsByParam = new Map<number, string[]>();
  for (const o of options) {
    if (o.parameterId == null) continue;
    if (!optionsByParam.has(o.parameterId))
      optionsByParam.set(o.parameterId, []);
    optionsByParam.get(o.parameterId)!.push(o.name);
  }

  const result = parameters.map((p) => ({
    id: p.id,
    name: p.name,
    type: p.type,
    options: optionsByParam.get(p.id) ?? [],
  }));

  console.log(stringify(result, { lineWidth: 0 }));

  process.exit(0);
}

main();
