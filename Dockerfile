FROM node:22-alpine AS build
WORKDIR /app
COPY package.json ./
RUN npm install --ignore-scripts
COPY tsconfig.json tsconfig.build.json ./
COPY src ./src
RUN npm run build && npm prune --omit=dev

FROM node:22-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app
RUN addgroup -S fisiovision && adduser -S fisiovision -G fisiovision
COPY --from=build --chown=fisiovision:fisiovision /app/dist ./dist
COPY --from=build --chown=fisiovision:fisiovision /app/package.json ./
COPY --from=build --chown=fisiovision:fisiovision /app/node_modules ./node_modules
USER fisiovision
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 CMD wget -qO- http://127.0.0.1:8080/healthz || exit 1
CMD ["node", "dist/http-entry.js"]
