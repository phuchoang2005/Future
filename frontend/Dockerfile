# ── Build stage ───────────────────────────────────────────────────────────────
FROM node:24-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# ── Runtime stage ─────────────────────────────────────────────────────────────
# A small Node server (server/index.mjs) serves the built dist/ bundle and reverse-proxies
# /api + the job-stream WebSocket to the backend. Replaces the previous nginx image.
FROM node:24-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV API_UPSTREAM=http://host.docker.internal:8080
ENV PORT=80

# Install only the server's runtime dependencies (express + http-proxy-middleware).
COPY server/package.json ./
RUN npm install --omit=dev --no-audit --no-fund

COPY server/index.mjs ./
COPY --from=build /app/dist ./dist

EXPOSE 80
CMD ["node", "index.mjs"]
