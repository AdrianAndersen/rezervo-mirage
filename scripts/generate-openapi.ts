import { writeFileSync } from "node:fs";
import { resolve } from "node:path";

import { getOpenApiDocument } from "../src/features/provider-api/openapi";

/**
 * Write the provider API's OpenAPI document to `openapi.json` at the repo root.
 * The rezervo side can codegen a client from this file without running the app.
 */
const outputPath = resolve(process.cwd(), "openapi.json");
writeFileSync(outputPath, `${JSON.stringify(getOpenApiDocument(), null, 2)}\n`);
console.log(`Wrote OpenAPI document to ${outputPath}`);
