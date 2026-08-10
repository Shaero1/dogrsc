# PLAN: Dev perf — webpack, API timeout, dev:lite

Дата: 2026-08-10

> PLAN утверждён задним числом. Локально реализовано, не закоммичено.

## Шаги

1. `frontend/next.config.ts` — remove `turbopack.root`; keep `outputFileTracingRoot`.
2. `admin/next.config.ts` — `outputFileTracingRoot`.
3. `frontend/package.json`, `admin/package.json` — `dev` with `--webpack`.
4. `frontend/lib/server-fetch.ts` — 8s AbortController timeout.
5. Wire `serverFetch` in all frontend API libs.
6. Root `package.json` — script `dev:lite`.
7. `scripts/dev-prepare.mjs` — detect running postgres, skip redundant infra up.

## Риски

- 🟡 Webpack медленнее cold start чем turbopack — приемлемо vs OOM.
- 🟢 Timeout может маскировать медленный API — логировать ошибку.

## Проверка

1. `npm run dev` — frontend :3000 loads `/en`.
2. Stop postgres — pages fail in ~8s not 30s+.
3. `npm run dev:lite` — no admin on :3001.
