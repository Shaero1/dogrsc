# REPORT: Header typography

Дата: 2026-08-10

Папка задачи: `tasks/2026-08-10-header-typography/`

## Сделано

- Название сайта: `text-xl` → `sm:text-2xl` (20px / 24px).
- Nav: `text-sm` → `text-base` (16px).
- Padding шапки: `py-3 sm:py-3.5` вместо `py-4`.
- Gap logo–name: `gap-2.5`.

## Проверка

| Шаг | Результат |
|-----|-----------|
| Изменения только в `Header.tsx` | ✅ |
| Tagline не добавлен | ✅ |

## Файлы

- `frontend/components/Header.tsx`

## Критерии BRIEF

- [x] Название пропорционально logo
- [x] Nav 16px
- [x] Без tagline
- [x] REPORT
