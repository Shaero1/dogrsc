# REPORT: Dev perf — webpack, API timeout, dev:lite

Дата: 2026-08-10

Папка задачи: `tasks/2026-08-10-dev-perf-local/`

## Сделано

### Next.js dev

- Убран `turbopack.root` из frontend config (источник hoisting/OOM).
- Dev scripts: **`next dev --webpack`** для frontend и admin.
- `outputFileTracingRoot` сохранён для monorepo production build.

### Server fetch

- `server-fetch.ts` — timeout 8s via AbortController.
- Подключено в `content-api`, `branding-api`, `donate-api`, `donations-api`, `map-api`, `reports-api`, `stats-api`, `stories-api`, `api.ts`.

### Dev ergonomics

- Root **`dev:lite`** — backend + frontend only.
- **`dev-prepare.mjs`** — skip infra if Postgres already up; verify before migrate.

## Проверка

| Шаг | Результат |
|-----|-----------|
| next-intl MODULE_NOT_FOUND fixed | ✅ |
| Webpack dev стартует | ✅ |
| API timeout при dead DB | ✅ |
| `dev:lite` script added | ✅ |
| Commit в main | ❌ не закоммичено |

## Не сделано / дальше

- Вернуть turbopack когда Next/monorepo решит hoisting (или per-package node_modules).
- Admin OOM на слабых машинах — использовать `dev:lite`.

## Файлы (основные)

- `frontend/next.config.ts`, `admin/next.config.ts`
- `frontend/package.json`, `admin/package.json`
- `frontend/lib/server-fetch.ts`, `frontend/lib/*-api.ts`
- `package.json`, `scripts/dev-prepare.mjs`

## Критерии BRIEF

- [x] dev без next-intl error
- [x] compile не 40s+ из‑за turbopack root
- [x] fail fast на dead API
- [x] dev:lite
- [x] REPORT + LESSONS
