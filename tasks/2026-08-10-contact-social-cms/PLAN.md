# PLAN: Social media links on contact (CMS)

Дата: 2026-08-10

> PLAN утверждён задним числом (commit `f696507`).

## Шаги

1. Добавить поля social в `content-pages.manifest.ts` для entity `contact`.
2. Seed значений в `content-seed-data.ts` (en/th/ru).
3. Admin `/content` — автоматически подхватит новые поля из manifest.
4. Frontend `contact/page.tsx` — рендер social block из CMS content.
5. Smoke: изменить URL в admin → reload contact page.

## Риски

- 🟢 Низкий — расширение существующего CMS паттерна.

## Проверка

- Admin save + frontend `/en/contact`, `/th/contact`.
