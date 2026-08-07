FROM node:22-alpine AS deps
WORKDIR /app
RUN apk add --no-cache libc6-compat
COPY package.json package-lock.json ./
COPY admin/package.json ./admin/
RUN npm ci -w dogrsc-admin --include=dev

FROM node:22-alpine AS builder
WORKDIR /app
RUN apk add --no-cache libc6-compat
ARG NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
COPY --from=deps /app/node_modules ./node_modules
COPY package.json package-lock.json ./
COPY admin ./admin
WORKDIR /app/admin
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV PORT=3000
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
COPY --from=builder /app/admin/public ./admin/public
COPY --from=builder --chown=nextjs:nodejs /app/admin/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/admin/.next/static ./admin/.next/static
USER nextjs
EXPOSE 3000
CMD ["node", "admin/server.js"]
