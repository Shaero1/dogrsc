# PLAN: admin-scaffold

Дата: 2026-07-31

## Шаги

1. create-next-app в `c:\dogrsc-admin` (TS, App Router, Tailwind, port 3001 в dev script).
2. Layout `(admin)` — sidebar + main; `(auth)/login` без sidebar.
3. Dashboard page — заглушка со статистикой «—».
4. Nav items — dashboard, dogs, reports, donations, users (href `#` или `/dashboard` only working).
5. Login page — email/password UI, submit disabled / «Coming soon».
6. `.env.example`, README, `git init`, build.

## Альтернатива

- **Admin в том же frontend `/admin`:** отвергнута в фазе 0 — отдельный репо для изоляции и деплоя.

## Бюджет

- Файлов: ~25–35
- Время: ~30–40 мин

## Чек-лист выхода

- [x] шаги конкретны
- [x] альтернатива отвергнута
- [x] бюджет назначен
