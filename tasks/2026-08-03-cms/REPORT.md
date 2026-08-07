# REPORT: CMS (ContentTranslation)

Дата: 2026-08-03

Папка задачи: `tasks/2026-08-03-cms/`

## Сделано

### Backend

- Модуль **`backend/src/content/`** — manifest страниц, service (public + admin + upsert), public/admin controllers.
- **API:**
  - `GET /api/v1/content/pages/:entityId?locale=`
  - `GET /api/v1/admin/content/pages`
  - `GET /api/v1/admin/content/pages/:entityId`
  - `PUT /api/v1/admin/content/pages/:entityId`
- **Seed** `content-seed-data.ts` — 129 строк (4 страницы × 3 локали), idempotent upsert.
- **E2E** `test/content.e2e-spec.ts` — 5 тестов, все проходят.

### Admin

- Nav **Content** → `/content`.
- Редактор: выбор страницы, табы en/th/ru, textarea по полям, Save all locales.

### Frontend

- `content-api.ts`, `page-content.ts` (CMS + messages fallback).
- Обновлены `/about`, `/contact`, `/stories`, bank modal на `/donate`.
- `force-dynamic` на about/contact/stories (donate уже был).

## Проверка

| Шаг | Результат |
|-----|-----------|
| `npx nest build` (backend) | OK |
| `npm run build -w dogrsc-frontend` | OK |
| `npm run build -w dogrsc-admin` | OK |
| `npm run test:e2e -- content.e2e-spec.ts` | 5/5 pass |

## Не сделано / дальше

- FAQ, home hero, footer в CMS.
- Dogs i18n (JSONB) — без изменений.
- Удаление дублирующих ключей из `messages/*.json` (оставлены как fallback).
- Push GitHub / staging smoke после seed на `:5433`.

## Файлы (основные)

- `backend/src/content/*`
- `backend/prisma/content-seed-data.ts`
- `backend/test/content.e2e-spec.ts`
- `admin/app/(admin)/content/page.tsx`
- `frontend/lib/content-api.ts`, `frontend/lib/page-content.ts`
- `frontend/app/[locale]/{about,contact,stories,donate}/`
