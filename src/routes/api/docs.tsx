import { createFileRoute } from "@tanstack/react-router";

const DOCS_HTML = `<!doctype html>
<html>
  <head>
    <title>rezervo-mirage provider API</title>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
  </head>
  <body>
    <script id="api-reference" data-url="/api/openapi.json"></script>
    <script src="https://cdn.jsdelivr.net/npm/@scalar/api-reference"></script>
  </body>
</html>`;

export const Route = createFileRoute("/api/docs")({
  server: {
    handlers: {
      GET: () => new Response(DOCS_HTML, { headers: { "Content-Type": "text/html" } }),
    },
  },
});
