# BRIEF: database schema

Дата: 2026-08-01

Папка задачи: `tasks/2026-08-01-database-schema/` (создана через `python harness/new_task.py "database schema"`).

## Формулировка своими словами

Подключить **backend** к Postgres через **Prisma**: описать **минимальную** схему MVP (таблицы под будущие модули auth, собак, reports, donate, media), применить первую миграцию и расширить health-check проверкой БД. Без CRUD, без auth, без seed — только schema + интеграция NestJS с Prisma.

Заказчик зафиксировал: **ORM = Prisma**, **scope таблиц = минимум MVP** (не полная спека §20, не этап 2–3).

## Контекст

- Монорепо `c:\dogrsc`; backend — NestJS 11, префикс `/api/v1`, сейчас только `HealthModule`.
- **04-infra-local** закрыта: Postgres `localhost:5432`, `DATABASE_URL` в `backend/.env.example` совместим; compose проверен (Postgres 15-alpine, Redis, MinIO).
- ORM отложен с задачи 01 — **закрываем здесь: Prisma**.
- i18n контента (`I18N.md`): для Dogs — **JSONB** `{ en, th, ru }`; CMS — таблица **ContentTranslation**.
- Следующие задачи ждут schema: `07-auth` (users), `08-media`, `10-dogs`, `11-reports`, `12-donations-crypto`.
- Harness: PLAN утверждается человеком до реализации; commit — только по запросу.

## Scope таблиц (минимум MVP)

| Модель | Назначение | Заметки |
|--------|------------|---------|
| **User** | Auth (07), admin | email, password_hash, role enum, timestamps |
| **Dog** | Каталог (10) | slug unique, status, JSONB descriptions/seo, timestamps |
| **FoundReport** | Форма found (11) | контакт, описание (1 язык), coords, moderation status |
| **LostReport** | Форма lost (11) | аналогично |
| **Donation** | Donate (12) | упрощённо: amount, currency, status, timestamps |
| **CryptoAddress** | Статические адреса (12) | currency (BTC/ETH/USDT/DOGE), address, is_active |
| **Media** | Upload (08) | s3_key, mime, size, optional entity link |
| **ContentTranslation** | CMS about/FAQ (14) | entity_type, entity_id, locale, field, value |
| **AuditLog** | Admin audit (09) | user_id, action, entity, payload JSON, timestamp |

**Не включаем в эту задачу:**

- adoption, volunteers, notifications, crypto_transactions, matching
- `preferred_language` у User (этап 2, ЛК)
- Redis-модуль, бизнес-сервисы, REST endpoints кроме health
- Seed-данные (задача 26)

## Критерии успеха

- [ ] Prisma в `backend/`: `schema.prisma`, client, первая миграция `init_mvp` (или аналог)
- [ ] Все таблицы из scope созданы в Postgres; `prisma migrate` воспроизводим на чистой БД при running compose
- [ ] `PrismaModule` + `PrismaService` в NestJS; `AppModule` импортирует
- [ ] `GET /api/v1/health` возвращает `database: "ok"` при живом Postgres; при недоступности — HTTP 503, `database: "error"` (см. PLAN)
- [ ] Scripts в `backend/package.json`: migrate, generate (и при необходимости studio)
- [ ] `backend/README.md` — prerequisite: infra up, `.env`, команды migrate
- [ ] `npm run build` из корня монорепо проходит
- [x] PLAN задачи утверждён человеком до реализации

## Открытые вопросы

| Вопрос | Статус |
|--------|--------|
| ORM | **Prisma** — решение заказчика |
| Scope таблиц | **Минимум MVP** — решение заказчика |
| i18n Dogs: JSONB vs колонки | **JSONB** — по `I18N.md`, зафиксировано в PLAN |
| Health при недоступной БД | **503** + `status: degraded`, `database: error` — зафиксировано в PLAN |
| TypeORM | **Отвергнуто** — выбран Prisma |
| Полная схема §20 PDF | **Отложено** — отдельные миграции по мере задач |
| Commit после задачи? | **Только по явному запросу** |
| Postgres 15 vs 16 | **15-alpine** в dev (LESSONS.md); Prisma совместим |

## Чек-лист выхода

- [x] формулировка своими словами есть
- [x] критерии успеха измеримы
- [x] открытые вопросы закрыты или отложены явно
