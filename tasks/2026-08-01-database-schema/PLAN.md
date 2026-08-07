# PLAN: database schema

Дата: 2026-08-01

Папка задачи: `tasks/2026-08-01-database-schema/`

## Шаги

1. **Prerequisite** — ДО кода:
   - `cd c:\dogrsc\infra && docker compose -f docker-compose.dev.yml ps` → postgres healthy
   - `cd c:\dogrsc\backend && copy .env.example .env` (если нет `.env`)

2. **Установить Prisma** в `backend/`:
   - `npm install prisma @prisma/client -w dogrsc-backend`
   - `npx prisma init` → `prisma/schema.prisma`, datasource `DATABASE_URL`

3. **`prisma/schema.prisma`** — модели MVP-minimum:

   **Enums:**
   - `UserRole`: `ADMIN`, `STAFF`, `USER` (USER — задел на этап 2)
   - `DogStatus`: `AVAILABLE`, `ADOPTED`, `IN_CARE`, `ARCHIVED`
   - `ReportStatus`: `PENDING`, `APPROVED`, `REJECTED`
   - `DonationStatus`: `PENDING`, `CONFIRMED`, `FAILED`
   - `CryptoCurrency`: `BTC`, `ETH`, `USDT`, `DOGE`

   **User** — `users`
   - `id` UUID @id @default(uuid())
   - `email` String @unique
   - `passwordHash` String @map("password_hash")
   - `role` UserRole @default(USER)
   - `createdAt`, `updatedAt`

   **Dog** — `dogs`
   - `id` UUID, `slug` String @unique
   - `status` DogStatus @default(IN_CARE)
   - `descriptions` Json — `{ en?, th?, ru? }` (description + rescue_story — структура в комментарии schema)
   - `seo` Json — `{ title?: {en,th,ru}, description?: {en,th,ru} }`
   - `createdAt`, `updatedAt`

   **FoundReport** — `found_reports`
   - `id` UUID, `reporterName`, `reporterPhone`, `reporterEmail?`
   - `description` String (язык автора)
   - `latitude` Decimal?, `longitude` Decimal?
   - `status` ReportStatus @default(PENDING)
   - `createdAt`, `updatedAt`

   **LostReport** — `lost_reports` — те же поля, что FoundReport

   **Donation** — `donations`
   - `id` UUID, `amount` Decimal, `currency` String
   - `status` DonationStatus @default(PENDING)
   - `donorName?`, `donorEmail?`
   - `createdAt`, `updatedAt`

   **CryptoAddress** — `crypto_addresses`
   - `id` UUID, `currency` CryptoCurrency, `address` String
   - `isActive` Boolean @default(true) @map("is_active")
   - `createdAt`, `updatedAt`
   - @@index([currency, isActive])

   **Media** — `media`
   - `id` UUID, `s3Key` @map("s3_key"), `mimeType`, `sizeBytes` Int
   - `entityType?`, `entityId?` String (polymorphic link, без FK на MVP)
   - `createdAt`

   **ContentTranslation** — `content_translations`
   - `id` UUID, `entityType`, `entityId`, `locale` String (en|th|ru)
   - `field` String, `value` String @db.Text
   - @@unique([entityType, entityId, locale, field])

   **AuditLog** — `audit_logs`
   - `id` UUID, `userId?` UUID → User?, `action` String
   - `entityType?`, `entityId?`, `payload` Json?
   - `createdAt`

4. **Миграция** — `npx prisma migrate dev --name init_mvp` (из `backend/`, Postgres up).

5. **NestJS PrismaModule** — `backend/src/prisma/`:
   - `prisma.service.ts` — PrismaClient, `onModuleInit` `$connect`, `onModuleDestroy` `$disconnect`
   - `prisma.module.ts` — `@Global()` export PrismaService
   - Импорт в `AppModule`

6. **Health + DB** — обновить `HealthModule`:
   - Inject `PrismaService`
   - `$queryRaw\`SELECT 1\`` — при успехе: `{ status: "ok", database: "ok", timestamp, version }`
   - При ошибке: `{ status: "degraded", database: "error", timestamp, version }`, **HTTP 503**
   - Обновить `HealthResponseDto`, Swagger, e2e-тест

7. **Scripts** — `backend/package.json`:
   - `"db:generate": "prisma generate"`
   - `"db:migrate": "prisma migrate dev"`
   - `"db:migrate:deploy": "prisma migrate deploy"`

8. **`backend/README.md`** — секция Database

9. **OpenAPI** — `npm run openapi:export`

10. **Проверка**:
    - `npm run build` из `c:\dogrsc`
    - `GET /api/v1/health` → `database: "ok"`
    - `\dt` в psql — 9 таблиц

11. **`tasks/2026-08-01-database-schema/REPORT.md`**

12. **DECISIONS** — черновик: ORM Prisma, MVP schema init_mvp, JSONB i18n на Dog.

## Альтернативы

- **TypeORM + migrations:** отвергнута, потому что заказчик выбрал Prisma; TypeORM больше Nest-boilerplate при том же результате.
- **Полная схема PDF §20:** отвергнута, потому что widens scope; таблицы этапа 2 — отдельными миграциями.
- **Отдельные колонки `description_en/th/ru` на Dog:** отвергнута, потому что `I18N.md` рекомендует JSONB; меньше ALTER при новых локалях/полях.
- **`@nestjs/prisma` пакет:** отвергнута на MVP, потому что достаточно тонкого `PrismaService` (~20 строк); лишняя зависимость.
- **Health 200 с `database: error`:** отвергнута, потому что load balancer должен видеть 503; `status: degraded` в теле сохраняет детали.
- **Ручная папка `tasks/05-database-schema/`:** отвергнута, потому что `harness/RULES.md` требует `new_task.py`; выровнено на `2026-08-01-database-schema`.

## Риски

- 🔴 **Postgres не запущен** → ДО шага 4: `docker compose ps`
- 🔴 **Нет `backend/.env`** → шаг 1
- 🟡 **Prisma generate в monorepo** → запускать из `backend/`
- 🟡 **e2e health без DB** → обновить e2e под running compose
- 🟢 **Postgres 15-alpine** → совместим с Prisma

## Бюджет

- Файлов: ~18–25
- Время: ~2–4 часа
- Правило: превысил → стоп и пересмотр

## Чек-лист выхода

- [x] шаги конкретны (сделан/не сделан)
- [x] есть отвергнутая альтернатива с содержательной причиной
- [x] красных рисков сняты процедурой (compose + .env до migrate)
- [x] бюджет назначен

## Критерии BRIEF (для REPORT)

- [ ] Prisma + migration `init_mvp`
- [ ] 9 таблиц MVP в Postgres
- [ ] PrismaModule в NestJS
- [ ] Health: `database: ok` / 503 при ошибке
- [ ] Scripts db:migrate, db:generate
- [ ] README backend
- [ ] `npm run build` OK
