# REPORT: dogs

Дата: 2026-08-02

Папка задачи: `tasks/2026-08-02-dogs/`

## Сделано

### Schema
- Migration `20260801214350_dog_is_published`: `isPublished` + index `(isPublished, status)`

### Backend
- `DogsModule`: admin CRUD, archive (ADMIN), public GET list/slug
- Slug autogen from `descriptions.en.name` + manual override; 409 on duplicate slug
- i18n JSONB validation (en.name + en.description required)
- Public filter: `isPublished=true`, status `AVAILABLE` | `IN_CARE`; `Accept-Language` fallback en
- Media: `POST /admin/media` accepts `entityType` + `entityId` form fields; dogs include linked media
- Seed: demo dogs `luna`, `mango`
- E2E: `test/dogs.e2e-spec.ts`

### Admin
- `/dogs` list + archive (ADMIN)
- `/dogs/new`, `/dogs/[id]/edit` — multilingual form, slug, publish, photo upload/delete
- `lib/api.ts`, `lib/dogs-types.ts`, `DogForm` component

## Критерии BRIEF

| Критерий | Статус |
|----------|--------|
| isPublished migration | ✅ |
| Admin CRUD + archive ADMIN | ✅ e2e |
| Slug autogen + manual | ✅ e2e |
| en required / th ru optional | ✅ e2e |
| Public GET filters | ✅ e2e |
| Media link + admin UI upload | ✅ e2e + UI |
| Seed 1–2 dogs | ✅ luna, mango |
| e2e + build + openapi | ✅ |

## Проверки

```powershell
cd c:\dogrsc\infra && docker compose -f docker-compose.dev.yml up -d
npm run db:migrate -w dogrsc-backend
npm run db:seed -w dogrsc-backend
npm run test:e2e -w dogrsc-backend
npm run build -w dogrsc-backend
npm run dev:backend & npm run dev:admin
```

Public smoke: `GET http://localhost:4000/api/v1/dogs` → seed dogs when published.

## Отклонения от PLAN

- Multipart `entityType`/`entityId`: binding через `@Body('entityType')` вместо DTO class (fix NestJS multipart).

## Следующие шаги

- Public frontend `/en/dogs` consuming public API
- `11-reports` — found/lost forms
