# REPORT: Bank donation details → Donations admin

Дата: 2026-08-10

Папка задачи: `tasks/2026-08-10-bank-details-admin/`

## Сделано

- Банковские реквизиты перенесены в admin **Donations** section.
- Content admin больше не основное место для bank details.
- Public frontend `/donate` — без breaking changes (тот же CMS entity).

## Проверка

| Шаг | Результат |
|-----|-----------|
| Commit `4a8de10` в main | ✅ |
| Donate page bank modal | ✅ |

## Не сделано / дальше

- Отдельная модель BankAccount вместо ContentTranslation — не нужно на MVP.

## Файлы (основные)

- `admin/app/(admin)/donations/` (bank section)
- `admin/app/(admin)/content/page.tsx` (убрано дублирование)

## Критерии BRIEF

- [x] Bank в Donations admin
- [x] Frontend donate OK
- [x] Content не дублирует
- [x] REPORT
