# REPORT: reports

Дата: 2026-08-02

Папка задачи: `tasks/2026-08-02-reports/`

## Сделано

### Backend
- `src/reports/` — ReportsModule, public POST found/lost, public media upload, admin list/get/PATCH
- `MediaService.createForPublicReport()` — upload window 15 min, entity types `found_report` / `lost_report`
- `SystemUserService` — lazy lookup `system@dogerescue.org` for anonymous uploads
- `prisma/seed.ts` — system user + 1× PENDING found + 1× PENDING lost
- `test/reports.e2e-spec.ts` — create, moderate, media, filter, double-moderate 400
- `backend/README.md` — reports API section

### Frontend
- `lib/reports-api.ts` — server-side create + media upload
- `components/ReportForm.tsx` — geolocation button, optional photo
- `app/[locale]/found-dog/`, `lost-dog/` — pages, Server Actions, thank-you
- i18n: `reportForm`, `foundForm`, `lostForm`, `thankYou` (en/th/ru)

### Admin
- `lib/reports-types.ts`, расширение `lib/api.ts`
- `/reports` — табы Found/Lost, фильтр статуса, Approve/Reject (ADMIN + STAFF)

## Критерии BRIEF

| Критерий | Статус |
|----------|--------|
| Public POST found/lost → PENDING | ✅ |
| Optional photo via media API | ✅ |
| Geolocation optional (null on deny) | ✅ |
| Admin moderation ADMIN + STAFF | ✅ |
| Server Actions (no CORS) | ✅ |
| Thank-you pages after submit | ✅ |
| Seed pending reports | ✅ |
| e2e + build | ✅ |

## Проверки

```powershell
cd c:\dogrsc\infra
docker compose -f docker-compose.dev.yml up -d
npm run db:seed -w dogrsc-backend
npm run test:e2e -w dogrsc-backend
npm run build -w dogrsc-frontend
npm run build -w dogrsc-admin
npm run dev:backend
npm run dev:frontend
# http://localhost:3000/en/found-dog
npm run dev:admin
# http://localhost:3001/reports
```

## Отклонения от PLAN

- `SystemUserService` без eager `onModuleInit` — иначе падали все e2e без seed system user
- `frontend/lib/reports-types.ts` не создан — типы inline в `reports-api.ts` (достаточно для MVP)

## Следующие шаги

- Map UI для approved reports
- Email notifications on new report
- Admin detail view с фото и координатами
