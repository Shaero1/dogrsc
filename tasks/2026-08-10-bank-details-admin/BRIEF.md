# BRIEF: Bank donation details → Donations admin

Дата: 2026-08-10

Папка задачи: `tasks/2026-08-10-bank-details-admin/`

## Формулировка своими словами

Перенести редактирование **банковских реквизитов для donate** из общего Content CMS в раздел **Donations** в admin — логически рядом с crypto addresses и donation records.

## Контекст

- Bank fields были в Content (`donate-bank` entity) — работало, но UX admin неудобен.
- Donations section уже содержит crypto + records.

## Scope

- Admin: bank details form на `/donations` (или подсекция).
- Backend: тот же ContentTranslation entity `donate-bank` или dedicated endpoint — без смены public API.
- Frontend `/donate` — без изменений контракта (still CMS fetch).

## Критерии успеха

- [x] Bank details редактируются в Donations admin, не в Content.
- [x] Frontend donate modal/page показывает актуальные реквизиты.
- [x] Content admin больше не дублирует bank block (или убран).
- [x] REPORT.

## Открытые вопросы

| Вопрос | Решение |
|--------|---------|
| Хранение | Оставить `ContentTranslation` entity `donate-bank` |
| Права | ADMIN + STAFF как donations |

## Чек-лист выхода

- [x] scope определён
- [x] PLAN утверждён (задним числом)
