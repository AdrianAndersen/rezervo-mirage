import { defineConfig } from "oxfmt";

export default defineConfig({
  ignorePatterns: ["routeTree.gen.ts", "openapi.json", ".playwright-mcp"],
});
