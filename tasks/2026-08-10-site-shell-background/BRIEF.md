# BRIEF: Site shell — fixed background + header/footer

Дата: 2026-08-10

Папка задачи: `tasks/2026-08-10-site-shell-background/`

## Формулировка своими словами

Один **CMS heroImage** используется как **фон всего сайта** (fixed layer под контентом). Home: Ken Burns + scroll parallax; inner pages: тот же фон с overlay. Header/footer — glass/dark variant поверх фото; без фото — обычный light UI.

## Контекст

- Branding API уже отдаёт `heroImage` (`tasks/2026-08-10-site-branding`).
- Дизайн: гибрид A (full-bleed bg) + лёгкий D на home; inner — светлые «листы» (glass panels в след. задаче).

## Scope

### Компоненты

- `SiteBackground.tsx` — fixed bg, overlay **55%**, Ken Burns на home, parallax (desktop, no reduced-motion).
- `SiteShellProvider.tsx` — context `hasBackgroundImage`.
- `layout.tsx` — fetch branding, `data-site-bg` на body, SiteBackground + provider.

### Header / Footer

- `Header.tsx` — client, glass + scroll-solid; logo из branding.
- `Footer.tsx`, `LocaleSwitcher.tsx` — dark variant при `data-site-bg`.

### Home

- Убрать дублирующий inline hero img; контент поверх SiteBackground.

### Admin

- Переименовать label «Home hero» → **Site background** в Content.

## Критерии успеха

- [x] С hero в CMS — fixed bg на всех страницах.
- [x] Home: Ken Burns + parallax (where supported).
- [x] Без hero — нет `data-site-bg`, обычный zinc/white UI.
- [x] Header/footer читаемы на фото.
- [x] `npm run build -w dogrsc-frontend` OK.
- [x] REPORT + DECISIONS.

## Открытые вопросы

| Вопрос | Решение |
|--------|---------|
| Overlay opacity | **55%** (читаемость заголовков) |
| Mobile parallax | Off / reduced |

## Чек-лист выхода

- [x] scope и критерии
- [x] PLAN утверждён (задним числом)
