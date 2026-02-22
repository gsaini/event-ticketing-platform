# ── Build stage ───────────────────────────────────────────────────────────────
FROM node:22-slim AS builder
WORKDIR /app
RUN apt-get update && apt-get install -y openssl
COPY package*.json ./
RUN npm install
COPY prisma ./prisma/
RUN npx prisma generate
COPY tsconfig.json ./
COPY src ./src/
RUN npm run build

# ── Production stage ─────────────────────────────────────────────────────────
FROM node:22-slim AS runtime
WORKDIR /app
RUN apt-get update && apt-get install -y openssl
COPY package*.json ./
RUN npm install --omit=dev
COPY --from=builder /app/dist ./dist
    COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
    COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY prisma ./prisma/

USER node
EXPOSE 3004
HEALTHCHECK --interval=10s --timeout=5s --retries=3 CMD wget -q --spider http://localhost:3004/actuator/health || exit 1
CMD ["sh", "-c", "npx prisma db push --accept-data-loss 2>/dev/null; node dist/index.js"]
