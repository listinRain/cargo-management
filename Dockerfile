# ── 本地用 SQLite，云部署用 PostgreSQL ──
# docker build --build-arg DATABASE_URL="postgresql://..." -t cargo-mgmt .
# docker run -e DATABASE_URL="..." -e NEXTAUTH_SECRET="..." -e NEXTAUTH_URL="..." -p 3000:3000 cargo-mgmt

FROM node:20-alpine AS base
WORKDIR /app

FROM base AS deps
COPY package.json package-lock.json* ./
RUN npm ci

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ARG DATABASE_URL
ENV DATABASE_URL=${DATABASE_URL}
RUN npx prisma generate
RUN npx prisma migrate deploy || echo "migrate skipped (no DB connection)"
RUN npx next build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

EXPOSE 3000
ENV PORT=3000
CMD ["npx", "next", "start"]
