# use the official Bun image
# see all versions at https://hub.docker.com/r/oven/bun/tags
FROM oven/bun:1-alpine AS base
WORKDIR /app

# install dependencies into temp directory
# this will cache them and speed up future builds
FROM base AS install
RUN mkdir -p /temp/dev
COPY package.json bun.lock bunfig.toml /temp/dev/
COPY prisma /temp/dev/prisma
COPY prisma.config.ts /temp/dev/
# dummy value: `prisma generate` (run via postinstall) only needs prisma.config.ts
# to resolve, it never connects to a database
RUN cd /temp/dev && DATABASE_URL="postgresql://user:pass@localhost:5432/db" bun install --frozen-lockfile

# install with --production (exclude devDependencies)
# --ignore-scripts: no need to run `prisma generate` here, the client comes
# from the dev install above, which already has the schema available
RUN mkdir -p /temp/prod
COPY package.json bun.lock /temp/prod/
RUN cd /temp/prod && bun install --frozen-lockfile --production --ignore-scripts

# copy node_modules from temp directory
# then copy all (non-ignored) project files into the image
FROM base AS prerelease
COPY --from=install /temp/dev/node_modules node_modules
COPY --from=install /temp/dev/generated generated
COPY . .

# build the Vite/Nitro bundle into .output/
ENV NODE_ENV=production
RUN bun run build

# copy production dependencies and built output into final image
FROM base AS release
COPY --from=install /temp/prod/node_modules node_modules
COPY --from=prerelease /app/generated generated
COPY --from=prerelease /app/.output .output
COPY --from=prerelease /app/package.json .

ENV NODE_ENV=production
ENV PORT=3000

USER bun
EXPOSE 3000/tcp

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD bun -e "fetch('http://localhost:3000/health').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

ENTRYPOINT [ "bun", ".output/server/index.mjs" ]
