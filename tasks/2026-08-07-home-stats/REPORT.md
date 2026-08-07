# Home stats — implementation report

**Date:** 2026-08-07  
**Status:** Done

## Approved decisions

- **1 slot** — крупное число + подпись снизу
- Число = **все собаки программы**: `AVAILABLE` + `IN_CARE` + `ADOPTED` (без `ARCHIVED`)
- Пожертвования на публике **не показываем**
- Подпись редактируется в CMS (`statLabel`), en/th/ru

## Backend

- `GET /stats/home` → `{ dogsTotal }`
- `DogsService.countRescued()` — все non-archived
- E2E: публичный endpoint + сверка с Prisma count

## CMS

- Entity `home`: `statsSectionEnabled`, `statLabel`
- Seed: секция включена, локализованные подписи

## Frontend

- `HomeStatsSection` — одно число + caption
- Home: блок только при `statsSectionEnabled=true` и успешном API

## Verification

```powershell
npm run db:seed -w dogrsc-backend
npm run test:e2e -- stats.e2e-spec.ts
npm run build -w dogrsc-backend
npm run build -w dogrsc-frontend
```

## Admin

`/content` → **Home hero & stats** → `statsSectionEnabled`, `statLabel`
