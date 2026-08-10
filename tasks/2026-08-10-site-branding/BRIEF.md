# BRIEF: Site branding (logo + hero background)

Дата: 2026-08-10

Папка задачи: `tasks/2026-08-10-site-branding/`

## Формулировка своими словами

Добавить в CMS загрузку **логотипа сайта** и **фонового hero-изображения** (site background). Публичный API отдаёт presigned URL; frontend показывает logo в header и hero на home; admin — панели upload в Content.

## Контекст

- После базового CMS (`tasks/2026-08-03-cms*`) site name/tagline остаются в messages.
- Hero на home был placeholder; нужен управляемый фон без деплоя.
- Logo в header — SVG/text fallback до загрузки.

## Scope

### Backend

- `GET /api/v1/content/branding` — `{ logo, heroImage }` с presigned URL или null.
- Admin: `GET /admin/content/branding` — media refs для UI.
- Media entity types: `site_logo`, `site_hero` (или через существующий branding service).
- E2E: public GET empty; admin upload logo + hero → public URLs.

### Admin

- Content page: секции **Site logo** и **Site background** (BrandingImagePanel).
- Upload через существующий media API.

### Frontend

- `frontend/lib/branding-api.ts` — server fetch branding.
- Layout/page: logo в Header, hero на home (до site-shell — inline img).

### Post-MVP в этой же ветке (commits)

- Auto-trim logo (sharp) при upload.
- Dockerfile: копировать `backend/node_modules` для sharp в production.
- Увеличить размер logo в header (mobile/desktop).

## Критерии успеха

- [x] Admin загружает logo и hero; frontend показывает после reload.
- [x] `GET /content/branding` возвращает URL или null.
- [x] E2E branding проходит.
- [x] Logo trim/resize на upload (sharp).
- [x] Docker build backend с sharp OK.
- [x] REPORT + DECISIONS.

## Открытые вопросы

| Вопрос | Решение |
|--------|---------|
| Один hero на весь сайт или только home? | **На весь сайт** — site background (следующая задача site-shell) |
| Fallback без изображений | Текстовый site name + обычный white UI |

## Чек-лист выхода

- [x] формулировка своими словами есть
- [x] критерии успеха измеримы
- [x] PLAN утверждён (задним числом)
