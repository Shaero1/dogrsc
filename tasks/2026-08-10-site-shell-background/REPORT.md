# REPORT: Site shell — fixed background + header/footer

Дата: 2026-08-10

Папка задачи: `tasks/2026-08-10-site-shell-background/`

## Сделано

- **`SiteBackground`** — fixed full-viewport bg из CMS heroImage, overlay 55%.
- **Home:** Ken Burns animation; scroll parallax (отключено на mobile / `prefers-reduced-motion`).
- **`SiteShellProvider`** + `data-site-bg` на body при наличии hero.
- **Layout** — единый fetch branding, SiteBackground под Header/main/Footer.
- **Header** — glass + transition to solid on scroll; logo из branding.
- **Footer / LocaleSwitcher** — тёмный вариант на фото.
- **Home page** — убран дублирующий hero image.
- **Admin** — «Site background» вместо «Home hero background».

## Проверка

| Шаг | Результат |
|-----|-----------|
| Локальная реализация | ✅ |
| `npm run build -w dogrsc-frontend` | ✅ (после glass refactor) |
| Commit в main | ❌ не закоммичено |

## Не сделано / дальше

- Commit + deploy Railway.
- E2E visual regression для bg — нет.

## Файлы (основные)

- `frontend/components/site-shell/SiteBackground.tsx`
- `frontend/components/site-shell/SiteShellProvider.tsx`
- `frontend/app/[locale]/layout.tsx`
- `frontend/app/[locale]/page.tsx`
- `frontend/components/Header.tsx`, `Footer.tsx`, `LocaleSwitcher.tsx`
- `frontend/app/globals.css` (base `[data-site-bg]`)
- `admin/app/(admin)/content/page.tsx`

## Критерии BRIEF

- [x] Fixed bg на всех страницах с hero
- [x] Home Ken Burns + parallax
- [x] Fallback без hero
- [x] Header/footer на фото
- [x] Frontend build OK
- [x] REPORT
