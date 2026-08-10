# REPORT: Site branding (logo + hero background)

Дата: 2026-08-10

Папка задачи: `tasks/2026-08-10-site-branding/`

## Сделано

### Backend

- Модуль branding: public + admin controllers, service с presigned URLs.
- Media upload для site logo и hero image.
- **Logo processor** (sharp): auto-trim borders, resize для header.
- E2E: empty branding + admin upload flow.

### Admin

- Content → **Site logo**, **Site background** (`BrandingImagePanel`).
- Подсказки по форматам и auto-trim.

### Frontend

- `branding-api.ts`, logo в Header, hero на home (до site-shell refactor).
- Увеличен размер logo mobile/desktop.

### Infra

- Dockerfile fix: `backend/node_modules` для sharp в production image.

## Проверка

| Шаг | Результат |
|-----|-----------|
| Commits `a516c24` … `86b6aaa` в main | ✅ |
| E2E branding | ✅ |
| Admin upload → public URL | ✅ |

## Не сделано / дальше

- Hero как **site-wide background** — задача `2026-08-10-site-shell-background`.
- Favicon из logo — не в scope.

## Файлы (основные)

- `backend/src/content/branding-*.ts`
- `backend/src/media/logo-image.processor.ts`
- `admin/components/admin/BrandingImagePanel.tsx`
- `frontend/lib/branding-api.ts`
- `frontend/components/Header.tsx`

## Критерии BRIEF

- [x] Admin загружает logo и hero
- [x] Public API branding
- [x] E2E
- [x] Logo trim/resize
- [x] Docker sharp
- [x] REPORT + DECISIONS
