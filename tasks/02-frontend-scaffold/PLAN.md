# PLAN: frontend-scaffold

Дата: 2026-07-31

## Шаги

1. **create-next-app** в `c:\dogrsc-frontend` (TS, App Router, ESLint, Tailwind, npm, без git).
2. **next-intl** — routing (`en|th|ru`), middleware, `i18n/request.ts`.
3. **Структура `app/[locale]/`** — layout + page (главная-заглушка).
4. **messages/** — en, th, ru (nav, hero, footer).
5. **Компоненты** — Header, Footer, LocaleSwitcher.
6. **Редirect** `/` → `/en` в middleware.
7. **`.env.example`**, README.
8. **`git init`**, `npm run build`, проверка маршрутов.
9. **REPORT.md** в `tasks/02-frontend-scaffold/`.

## Альтернатива

- **next-i18next (Pages Router):** отвергнута — App Router + next-intl — рекомендация I18N.md и текущий стандарт Next.js 14+.

## Риски

- 🟡 create-next-app интерактив → флаги `--yes` / non-interactive.
- 🟢 next-intl breaking changes → следуем docs app router setup.

## Бюджет

- Файлов: ~30–40
- Время: ~45 мин

## Чек-лист выхода

- [x] шаги конкретны
- [x] отвергнутая альтернатива есть
- [x] бюджет назначен
