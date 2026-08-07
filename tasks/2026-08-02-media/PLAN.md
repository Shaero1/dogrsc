# PLAN: media

Дата: 2026-08-02

Папка задачи: `tasks/2026-08-02-media/`

## Шаги

### Prerequisite

1. **Infra** — `docker compose -f docker-compose.dev.yml up -d`; MinIO healthy, bucket `dogrsc-media`.
2. **Backend env** — `backend/.env` с `S3_*` (из `.env.example`); backend dev на `:4000` с auth routes.
3. **Auth seed** — admin/staff user в БД для e2e (seed admin; при необходимости seed STAFF в e2e `beforeAll`).

### Schema

4. **Prisma migration** — расширить `Media`:
   - `deletedAt DateTime? @map("deleted_at")`
   - `uploadedById String @map("uploaded_by_id") @db.Uuid` → FK `User`
   - `uploadedBy User @relation(...)`
   - Индекс на `deletedAt` (nullable filter) — опционально
5. **`npm run db:migrate -w dogrsc-backend`**

### Backend — dependencies

6. **Packages** — `@aws-sdk/client-s3`, `@aws-sdk/s3-request-presigner`; dev: `@types/multer` (если нужно).

### Backend — S3 layer

7. **`src/media/s3.service.ts`** — `S3Client` из env:
   - `endpoint: S3_ENDPOINT`, `forcePathStyle: true`, credentials, `region`
   - `putObject(key, buffer, mimeType)`
   - `getPresignedGetUrl(key, expiresInSeconds)` — default **900** (15 min)
8. **Env** — дополнить `.env.example` при необходимости:
   - `MEDIA_MAX_BYTES=5242880` (5 MB)
   - `MEDIA_PRESIGNED_TTL_SECONDS=900`

### Backend — Media module

9. **`src/media/dto/`** — `MediaResponseDto` (id, mimeType, sizeBytes, url, createdAt, deletedAt nullable omit), upload validation errors
10. **`src/media/media.service.ts`**:
    - `create(file, userId)` — validate size/MIME, generate key `media/{uuid}/{sanitizedFilename}`, S3 put, prisma create with `uploadedById`
    - `findById(id)` — exclude `deletedAt != null` → null/NotFound
    - `softDelete(id, user)` — permission check, set `deletedAt`
11. **Permission helper** — `canDeleteMedia(user, media)`:
    - ADMIN → true
    - STAFF → `media.uploadedById === user.id` **OR** (`media.entityType && media.entityId`)
12. **`src/media/media.controller.ts`** — prefix `admin/media`, все `@Roles(ADMIN, STAFF)`:
    - `POST /` — `FileInterceptor('file')`, `@UploadedFile()`, `@Req()` user
    - `GET /:id` — presigned url in response
    - `DELETE /:id` — 204 or 200 empty
13. **`src/media/media.module.ts`** — imports ConfigModule; register in `AppModule`
14. **MIME validation** — whitelist + проверка `file.mimetype`; при mismatch — 400
15. **Size validation** — multer limits + service check → 413 Payload Too Large

### OpenAPI & tests

16. **Swagger** — `@ApiConsumes('multipart/form-data')`, `@ApiBody` file field, response DTOs
17. **`npm run openapi:export`**
18. **E2E** `test/media.e2e-spec.ts`:
    - login ADMIN → upload small png/jpeg fixture → 201 + url
    - GET by id → 200
    - DELETE as ADMIN → GET 404
    - upload as STAFF (upsert in beforeAll) → DELETE own OK
    - STAFF DELETE чужой upload without entity → 403
    - invalid mime → 400
    - oversize → 413 (или 400 — зафиксировать в тесте фактический код)

### Docs & close

19. **`backend/README.md`** — media endpoints, env, limits, soft delete note
20. **`tasks/2026-08-02-media/REPORT.md`**
21. **DECISIONS** — черновик: presigned URL, soft delete, server-side upload, no admin UI

### Проверка (manual smoke)

22. ```powershell
    cd c:\dogrsc\infra && docker compose -f docker-compose.dev.yml up -d
    cd c:\dogrsc && npm run db:migrate -w dogrsc-backend
    npm run dev:backend
    ```
    - curl/Postman: `POST /api/v1/admin/media` multipart + Bearer → presigned url открывается в браузере
    - MinIO console: объект в `dogrsc-media`
23. `npm run build` из корня
24. `npm run test:e2e -w dogrsc-backend`

## Альтернативы

- **Presigned PUT с клиента напрямую в MinIO:** отвергнута — нужны bucket policy + CORS на MinIO и отдельный flow регистрации metadata; server-side upload проще для MVP и единой валидации.
- **Hard delete из S3 сразу:** отвергнута по решению заказчика — soft delete + отложенная очистка; безопаснее при ошибках и проще audit позже.
- **Admin upload UI здесь:** отвергнута — UI в `10-dogs`, меньше scope и один end-to-end с CRUD.
- **Proxy file через backend (`GET /file`):** отвергнута — presigned URL снимает нагрузку с API и ближе к prod (R2/S3).

## Риски

- 🔴 **MinIO down** → ДО smoke: compose up; health не проверяет S3 — явный smoke upload.
- 🔴 **Старый backend на :4000** → проверить `/api/v1/auth/login` и health с `"database":"ok"` перед тестами.
- 🟡 **Path-style MinIO** → `forcePathStyle: true` в S3Client.
- 🟡 **STAFF delete entity rule без dogs** → правило «entityType+entityId set» — документировать; полный ACL в `10-dogs`.
- 🟡 **Multer memory vs disk** → memory buffer до 5 MB приемлемо; лимит в multer options.
- 🟢 **Presigned TTL** → 900s default; env override.

## Бюджет

- Файлов: ~18–25
- Время: ~3–4 часа
- Правило: превысил → стоп и пересмотр

## Чек-лист выхода

- [x] шаги конкретны (сделан/не сделан)
- [x] есть отвергнутая альтернатива с содержательной причиной
- [x] красных рисков сняты процедурой (compose + smoke)
- [x] бюджет назначен

## Критерии BRIEF (для REPORT)

- [ ] migration media fields
- [ ] POST upload + GET presigned
- [ ] DELETE soft + permissions
- [ ] limits 5MB / 3 MIME types
- [ ] e2e + build + openapi
- [ ] admin UI unchanged
