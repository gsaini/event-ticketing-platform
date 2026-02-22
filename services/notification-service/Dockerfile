FROM node:22-slim AS builder
WORKDIR /app
RUN apt-get update && apt-get install -y openssl
COPY package*.json ./
RUN npm install
COPY tsconfig.json ./
COPY src ./src/
RUN npm run build

FROM node:22-slim AS runtime
WORKDIR /app
RUN apt-get update && apt-get install -y openssl
COPY package*.json ./
RUN npm install --omit=dev
COPY --from=builder /app/dist ./dist
USER node
EXPOSE 3006
HEALTHCHECK --interval=10s --timeout=5s --retries=3 CMD wget -q --spider http://localhost:3006/health || exit 1
CMD ["node", "dist/index.js"]
