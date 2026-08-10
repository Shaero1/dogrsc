# REPORT: Social media links on contact (CMS)

Дата: 2026-08-10

Папка задачи: `tasks/2026-08-10-contact-social-cms/`

## Сделано

- Новые поля social links в CMS entity **`contact`** (manifest + seed).
- Admin Content → contact — редактирование ссылок en/th/ru.
- Frontend `/contact` — блок соцсетей из CMS с fallback на messages.

## Проверка

| Шаг | Результат |
|-----|-----------|
| Commit `f696507` в main | ✅ |
| Admin edit → frontend display | ✅ |

## Не сделано / дальше

- Иконки брендов — минимальный UI; кастом SVG pack — опционально.
- Footer social links — отдельная задача (footer CMS).

## Файлы (основные)

- `backend/src/content/content-pages.manifest.ts`
- `backend/prisma/content-seed-data.ts`
- `frontend/app/[locale]/contact/page.tsx`

## Критерии BRIEF

- [x] Admin редактирует social links
- [x] Frontend показывает на contact
- [x] Пустые поля скрыты
- [x] REPORT
