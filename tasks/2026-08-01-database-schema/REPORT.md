# REPORT: database schema

Дата: 2026-08-01

Папка: `tasks/2026-08-01-database-schema/`

## Что сделано

| Шаг PLAN | Статус | Результат |
|----------|--------|-----------|
| 1. Prerequisite compose + .env | ✅ | Postgres healthy, `.env` есть |
| 2. Prisma install | ✅ | Prisma **6.19.3** (см. отклонение) |
| 3. schema.prisma | ✅ | 9 моделей MVP + enums |
| 4. migrate init_mvp | ✅ | `20260731191020_init_mvp` |
| 5. PrismaModule | ✅ | `src/prisma/` global |
| 6. Health + DB | ✅ | `database: ok`, 503 при ошибке |
| 7. Scripts | ✅ | db:migrate, db:generate, db:migrate:deploy |
| 8. README | ✅ | секция Database |
| 9. OpenAPI | ✅ | health с полем `database` |
| 10. Проверка | ✅ | build, e2e, `\dt` |
| 11. REPORT | ✅ | этот файл |

## Отклонение от PLAN

| PLAN | Факт | Причина |
|------|------|---------|
| Prisma (latest via npm) | **Prisma 6.19.3** | Prisma 7.9 требует `prisma.config.ts`, `url` в schema не поддерживается (P1012) |

## Проверки

```text
npm run build (root)     — OK
npm run test:e2e         — 1 passed, database: ok
npm run openapi:export   — OK

psql \dt:
  users, dogs, found_reports, lost_reports, donations,
  crypto_addresses, media, content_translations, audit_logs
  (+ _prisma_migrations)
```

## Критерии BRIEF

- [x] Prisma + migration `init_mvp`
- [x] 9 таблиц MVP в Postgres
- [x] PrismaModule в NestJS
- [x] Health: `database: ok` / 503 при ошибке (логика в controller)
- [x] Scripts db:migrate, db:generate
- [x] README backend
- [x] `npm run build` OK

## Бюджет

- Файлов: ~20 (schema, migration, prisma module, health, package.json, README, openapi) — в пределах 18–25
- Время: ~1.5 ч

## Следующая задача

`07-auth` (или `06-openapi-codegen` когда появятся endpoints beyond health) — users table готова.

## Уроки

**Черновик для `harness/LESSONS.md`:**

- `npm install prisma` без pin может поставить Prisma 7 с breaking config; для Nest scaffold фиксировать Prisma 6 до миграции на prisma.config.ts.

## DECISIONS

**Черновик:**

- ORM: Prisma 6; MVP schema `init_mvp`; Dog i18n — JSONB `descriptions` + `seo`.
