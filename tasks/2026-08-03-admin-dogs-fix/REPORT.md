# REPORT: admin dogs fixes

Дата: 2026-08-03

## Исправлено

### Backend
- `GET /admin/dogs` — query `excludeArchived`, `search` (slug substring)
- `create`/`update` — `normalizeDescriptions` / `mergeDescriptions`; пустой `th`/`ru` удаляется из JSONB
- E2E: +2 теста (excludeArchived, clear th)

### Admin
- `/dogs` — pagination, slug search, status filter (default **Active**), archive confirm + errors
- `DogForm` — убран stale `setMedia(initial.media)` после upload
- `AdminSidebar` — nav по роли (Content/Users только ADMIN)
- `sanitizeDescriptions` — всегда шлёт `th`/`ru` (пустой `{}` = очистка)

## Проверка

- `dogs.e2e-spec.ts` — 10/10
- `npm run build -w dogrsc-admin` — OK

## Не в scope

- Presigned URL TTL 15 min (перезагрузка edit page)
- Очистка 100+ test dogs в dev БД (используй search `luna` / filter Active)
