FROM node:22-alpine AS deps
WORKDIR /app
RUN apk add --no-cache libc6-compat openssl
COPY package.json package-lock.json ./
COPY backend/package.json ./backend/
RUN npm ci -w dogrsc-backend --include=dev

FROM node:22-alpine AS builder
WORKDIR /app
RUN apk add --no-cache libc6-compat openssl
COPY --from=deps /app/node_modules ./node_modules
COPY package.json package-lock.json ./
COPY backend ./backend
ENV DATABASE_URL=postgresql://dogrsc:dogrsc@localhost:5432/dogrsc
RUN npx prisma@6.19.3 generate --schema=backend/prisma/schema.prisma
RUN npm run build -w dogrsc-backend

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN apk add --no-cache openssl libc6-compat
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/backend/dist ./backend/dist
COPY --from=builder /app/backend/prisma ./backend/prisma
COPY --from=builder /app/backend/package.json ./backend/package.json
COPY --from=builder /app/package.json ./package.json
WORKDIR /app/backend
EXPOSE 4000
CMD ["sh", "-c", "cd /app && npm run db:migrate:deploy -w dogrsc-backend && node backend/dist/main.js"]
