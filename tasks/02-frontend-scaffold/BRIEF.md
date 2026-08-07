# BRIEF: frontend-scaffold

Дата: 2026-07-31

## Формулировка своими словами

Создать каркас публичного сайта в локальном репо `c:\dogrsc-frontend`: Next.js (App Router), три локали en/th/ru через next-intl, базовый layout (header, footer, переключатель языка), заглушка главной. Без интеграции с API и без страниц каталога — только основа по `REPOS.md` и `I18N.md`.

## Контекст

- Порядок из `REPOS.md`: после `01-backend-scaffold` → `02-frontend-scaffold`.
- Backend: `http://localhost:4000/api/v1` (health готов); env `NEXT_PUBLIC_API_URL` — заготовка.
- Решения фазы 0: path-locales `/en/`, `/th/`, `/ru/`; next-intl.

## Критерии успеха

- [ ] `c:\dogrsc-frontend` — Next.js, `npm run build` проходит
- [ ] `/` редиректит на `/en`
- [ ] `/en`, `/th`, `/ru` — главная с переведённым UI
- [ ] Header + Footer + LocaleSwitcher (меняет префix, сохраняет path)
- [ ] `messages/en.json`, `th.json`, `ru.json`
- [ ] `.env.example` с `NEXT_PUBLIC_API_URL`
- [ ] README: install, dev, структура локалей
- [ ] `git init` (без commit)

## Открытые вопросы

| Вопрос | Статус |
|--------|--------|
| Redirect `/` → `/en` vs Accept-Language | **Решение:** `/` → `/en` (I18N.md) |
| Tailwind | **Да** — default Next.js stack |

## Чек-лист выхода

- [x] формулировка своими словами есть
- [x] критерии успеха измеримы
- [x] открытые вопросы закрыты или отложены явно
