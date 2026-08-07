# BRIEF: dogs

Дата: 2026-08-02

Папка задачи: `tasks/2026-08-02-dogs/` (создана через `python harness/new_task.py "dogs"`).

## Формулировка своими словами

Первый **end-to-end** модуль каталога собак: admin/staff создают и редактируют профили (i18n en/th/ru), загружают фото через media API, публикуют записи. Публичный API отдаёт только **опубликованные** собаки со статусом `AVAILABLE` или `IN_CARE`. «Удаление» — только **архивация** (`ARCHIVED`), hard delete не делаем.

## Контекст

- **Schema** (`Dog`): `slug`, `status`, JSONB `descriptions`, `seo` — без `isPublished` (добавим миграцией).
- **Media** (`08-media`): upload + presigned; привязка `entityType=dog`, `entityId`.
- **Auth**: JWT, `@Roles(ADMIN, STAFF)`; archive — **ADMIN only**.
- **Admin** `/dogs`: заглушка; нужны list + create/edit + upload UI.
- **Frontend** публичный каталог — **не в этой задаче**; готовим public GET API.
- **I18N** (`I18N.md`): admin UI en; контент en/th/ru; JSONB descriptions/seo.

## Scope

### Schema

- Migration: `isPublished Boolean @default(false) @map("is_published")`
- Форма `descriptions` JSON (расширение MVP shape):
  ```json
  {
    "en": { "name": "Luna", "description": "...", "rescueStory": "..." },
    "th": { "name": "...", "description": "...", "rescueStory": "..." },
    "ru": { "name": "...", "description": "...", "rescueStory": "..." }
  }
  ```
- `seo` без изменений структуры: `{ title: { en, th, ru }, description: { en, th, ru } }`

### Backend — admin (`@Roles(ADMIN, STAFF)`)

| Method | Path | Назначение |
|--------|------|------------|
| GET | `/api/v1/admin/dogs` | список (pagination, filter status/isPublished) |
| POST | `/api/v1/admin/dogs` | создать; slug автоген из `descriptions.en.name`, можно override |
| GET | `/api/v1/admin/dogs/:id` | деталь + linked media (presigned urls) |
| PATCH | `/api/v1/admin/dogs/:id` | обновить поля, slug, isPublished, status (кроме ARCHIVED — см. archive) |
| POST | `/api/v1/admin/dogs/:id/archive` | `@Roles(ADMIN)` → `status: ARCHIVED` |

**Media:** расширить `POST /admin/media` — optional form fields `entityType`, `entityId`; upload с привязкой к dog. List media for dog — в GET dog или query helper в service.

### Backend — public (`@Public()`)

| Method | Path | Назначение |
|--------|------|------------|
| GET | `/api/v1/dogs` | `isPublished=true` AND `status IN (AVAILABLE, IN_CARE)`; pagination |
| GET | `/api/v1/dogs/:slug` | одна собака (те же фильтры); locale via `Accept-Language` → fallback `en` |

Public response — flattened locale fields (name, description, rescueStory, seo) + media urls (presigned или ids — в PLAN).

### Admin UI

- `/dogs` — таблица
- `/dogs/new`, `/dogs/[id]/edit` — форма en/th/ru, slug (auto + editable), status, isPublished, photos upload
- `admin/lib/api.ts` — dogs + uploadMedia with entity link

### Seed

- 1–2 demo dogs (en + короткие th/ru), `isPublished=true`, статус `AVAILABLE`/`IN_CARE`, опционально demo image

### Не включаем

- Public frontend pages `/en/dogs/...`
- Hard delete dog/media from S3
- Audit log
- Adoption workflow

## Правила бизнес-логики

| Правило | Решение |
|---------|---------|
| Slug | Авто из `slugify(descriptions.en.name)` при create; PATCH может задать slug вручную (unique) |
| Локали | **en.name** и **en.description** обязательны; th/ru опциональны |
| Публичный список | `isPublished=true` AND `status ∈ {AVAILABLE, IN_CARE}` |
| Архивация | `POST .../archive`, **ADMIN only**; hard delete нет |
| STAFF | CRUD + upload; не может archive |

## Критерии успеха

- [ ] Migration `isPublished` применена
- [ ] Admin CRUD + archive (ADMIN) работает
- [ ] Slug autogen + manual override; unique constraint → 409
- [ ] en required validation; th/ru optional
- [ ] Media привязка к dog; видна в admin GET/edit
- [ ] Public GET `/dogs`, `/dogs/:slug` — только published + AVAILABLE/IN_CARE; locale fallback en
- [ ] Seed 1–2 demo dogs
- [ ] Admin UI: создать/редактировать собаку с фото
- [ ] e2e + `npm run build` + openapi export

## Открытые вопросы

| Вопрос | Решение |
|--------|---------|
| Public API | **B** — admin + public GET |
| Удаление | **ARCHIVED only**, no hard delete |
| Slug | **Autogen from en name + manual edit** |
| Локали | **en required**, th/ru optional |
| Archive | **ADMIN only** |
| Public filter | **AVAILABLE + IN_CARE**, `isPublished=true` |
| Seed | **1–2 demo dogs in this task** |

## Чек-лист выхода

- [x] формулировка своими словами есть
- [x] критерии успеха измеримы
- [x] открытые вопросы закрыты
