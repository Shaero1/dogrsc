# BRIEF: Dev perf — webpack, API timeout, dev:lite

Дата: 2026-08-10

Папка задачи: `tasks/2026-08-10-dev-perf-local/`

## Формулировка своими словами

Починить локальный dev после site shell work: **`next-intl` MODULE_NOT_FOUND**, OOM и 40–58s compile из‑за `turbopack.root` на monorepo; зависания RSC при мёртвой Postgres; облегчённый режим dev без admin.

## Контекст

- Symptom: `Cannot find module 'next-intl'`, admin/frontend OOM, Postgres P1001 блокирует SSR 30+ сек.

## Scope

### Next config

- Убрать `turbopack.root` (hoisting conflict).
- Dev scripts: **`next dev --webpack`** (frontend + admin).
- Оставить `outputFileTracingRoot` для monorepo build.

### API fetch

- `frontend/lib/server-fetch.ts` — timeout 8s.
- Подключить во все `frontend/lib/*-api.ts`.

### Dev scripts

- `dev:lite` — backend + frontend без admin.
- `dev-prepare.mjs` — skip infra if postgres up, verify postgres before migrate.

## Критерии успеха

- [x] `npm run dev` стартует frontend без next-intl error.
- [x] Compile time разумный (не 40s+ на каждый HMR из‑за turbopack root).
- [x] Dead API → fail fast (~8s), не hang.
- [x] `dev:lite` работает.
- [x] REPORT + LESSONS.

## Открытые вопросы

| Вопрос | Решение |
|--------|---------|
| Turbopack forever? | Webpack для dev пока monorepo hoisting не решён |
| Admin в dev | Опционально через полный `npm run dev` |

## Чек-лист выхода

- [x] scope и критерии
- [x] PLAN утверждён (задним числом)
