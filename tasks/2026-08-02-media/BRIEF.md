# BRIEF: media

Дата: 2026-08-02

Папка задачи: `tasks/2026-08-02-media/` (создана через `python harness/new_task.py "media"`).

## Формулировка своими словами

Сделать **backend-модуль загрузки и управления media**: admin/staff загружает изображение → файл попадает в MinIO (bucket `dogrsc-media`), метаданные — в таблицу `media`. Клиент получает **presigned URL** для просмотра. Ошибочные загрузки можно **мягко удалить** (`deletedAt`), без немедленного физического удаления из S3.

**Admin UI в этой задаче не делаем** — только API; формы upload появятся в `10-dogs`.

## Контекст

- **Infra готова** (`04-infra-local`): MinIO `:9000`, bucket `dogrsc-media`, `S3_*` в `backend/.env.example`.
- **Schema** (`2026-08-01-database-schema`): модель `Media` есть, но без `deletedAt` и `uploadedById` — потребуется миграция.
- **Auth готов** (`2026-08-01-auth`): JWT, `@Roles(ADMIN, STAFF)`, guards глобальные.
- **Следующая задача** `10-dogs` будет привязывать media к собаке через `entityType` / `entityId`.

## Scope

### Backend (`backend/`)

- Prisma migration: `deletedAt`, `uploadedById` (FK → `users`)
- `MediaModule`: S3 client (AWS SDK v3, path-style для MinIO)
- `POST /api/v1/admin/media` — multipart upload, `@Roles(ADMIN, STAFF)`
- `GET /api/v1/admin/media/:id` — метаданные + presigned GET URL (не отдаём удалённые)
- `DELETE /api/v1/admin/media/:id` — soft delete по правилам ниже
- Валидация: max **5 MB**; MIME **image/jpeg**, **image/png**, **image/webp**
- OpenAPI + e2e

### Admin (`admin/`)

- **Не включаем** — UI upload откладывается на `10-dogs`

### Не включаем

- Admin UI upload
- EXIF, resize, thumbnails
- Публичный upload с frontend
- Физическое удаление из S3 (фоновая задача — позже)
- Привязка к Dog CRUD (только nullable `entityType`/`entityId` в API, если передадут)

## Правила доступа

| Действие | ADMIN | STAFF |
|----------|-------|-------|
| Upload | ✅ | ✅ |
| GET (presigned) | ✅ любой не удалённый | ✅ любой не удалённый |
| DELETE (soft) | ✅ любой | ✅ свой upload **или** media с `entityType`/`entityId`, если entity в scope редактирования STAFF |

**STAFF + entity:** на этапе `08-media` без dogs CRUD проверка «редактируемая сущность» сводится к: media с заполненными `entityType`/`entityId` — STAFF может удалить (подготовка к `10-dogs`); без entity — только свой `uploadedById`. Уточнение entity-level ACL ужесточим в `10-dogs` при необходимости.

## Soft delete

- `DELETE` выставляет `deletedAt = now()`
- Удалённые записи **не** возвращаются в GET/list
- Presigned URL для удалённых — 404
- Объект в S3 **остаётся** до фоновой очистки (отдельная задача)

## Критерии успеха

- [ ] Миграция применена: `deletedAt`, `uploadedById` на `media`
- [ ] `POST /admin/media` — 201 + `{ id, mimeType, sizeBytes, url }` (presigned); 413/400 при превышении лимита или неверном MIME
- [ ] `GET /admin/media/:id` — 200 + presigned URL; 404 если нет или soft-deleted
- [ ] `DELETE /admin/media/:id` — soft delete; ADMIN любой; STAFF по правилам; 403 при нарушении
- [ ] Файл физически в MinIO bucket после upload
- [ ] Guards: только ADMIN/STAFF; без token — 401
- [ ] `npm run build`, `npm run test:e2e -w dogrsc-backend`, openapi export
- [ ] Admin UI **не** меняется (scope A)

## Открытые вопросы

| Вопрос | Решение |
|--------|---------|
| Admin UI в задаче? | **A** — только backend API |
| Кто грузит? | **ADMIN + STAFF** |
| Как отдавать файл? | **Presigned URL** (GET, TTL в PLAN) |
| Лимиты | **5 MB**; `image/jpeg`, `image/png`, `image/webp` |
| Удаление | **Soft delete** (`deletedAt`); S3 cleanup позже |
| ADMIN delete | Любой media |
| STAFF delete | Свой upload или media привязанной entity |

## Чек-лист выхода

- [x] формулировка своими словами есть
- [x] критерии успеха измеримы
- [x] открытые вопросы закрыты или отложены явно
