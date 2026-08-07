# REPORT: media

Дата: 2026-08-02

Папка задачи: `tasks/2026-08-02-media/`

## Сделано

### Schema
- Migration `20260801195817_media_soft_delete`: `uploadedById` (FK → users), `deletedAt`
- Relation `User.mediaUploads`

### Backend
- `@aws-sdk/client-s3`, `@aws-sdk/s3-request-presigner`
- `MediaModule`: `S3Service`, `MediaService`, `MediaController`
- `POST /api/v1/admin/media` — multipart upload
- `GET /api/v1/admin/media/:id` — presigned URL
- `DELETE /api/v1/admin/media/:id` — soft delete + permission rules
- MIME whitelist: jpeg/png/webp; max 5 MB
- E2E: `test/media.e2e-spec.ts` (7 cases)
- OpenAPI export обновлён
- `backend/README.md` — media section

### Admin
- **Не менялся** (по scope A)

## Критерии BRIEF

| Критерий | Статус |
|----------|--------|
| Migration `deletedAt`, `uploadedById` | ✅ |
| POST upload + GET presigned | ✅ e2e |
| DELETE soft + permissions | ✅ e2e |
| Limits 5MB / 3 MIME | ✅ e2e |
| build + e2e + openapi | ✅ e2e 12 passed; nest build OK; openapi OK |
| Admin UI unchanged | ✅ |

## Проверки

```powershell
cd c:\dogrsc\infra && docker compose -f docker-compose.dev.yml up -d
cd c:\dogrsc && npm run db:migrate -w dogrsc-backend
npm run test:e2e -w dogrsc-backend
npm run openapi:export -w dogrsc-backend
```

Результаты (2026-08-02):
- migration: OK
- test:e2e: **12 passed** (health + auth + media)
- nest build: OK
- openapi:export: OK

## Smoke (ручной)

```powershell
npm run dev:backend
# login → POST /api/v1/admin/media with Bearer + file field
# GET /api/v1/admin/media/:id → open url in browser
```

## Отклонения от PLAN

- `npm run build` (root) может падать на `prisma generate` с EPERM, если backend dev-процесс держит query engine DLL (Windows). Обход: остановить dev-сервер, затем build. `nest build` и e2e проходят отдельно.

## Следующие шаги

- `10-dogs` — CRUD собак + admin upload UI + привязка `entityType=dog`
