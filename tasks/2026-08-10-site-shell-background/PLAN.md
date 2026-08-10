# PLAN: Site shell — fixed background + header/footer

Дата: 2026-08-10

> PLAN утверждён задним числом. Код реализован локально, **не закоммичен** на момент REPORT.

## Шаги

### 1. Site shell components

1. `SiteBackground.tsx` — fixed layer, overlay, Ken Burns (home only), parallax hook.
2. `SiteShellProvider.tsx` — `hasBackgroundImage` для дочерних client components.
3. `globals.css` — `[data-site-bg]` tokens, base overlay.

### 2. Layout integration

4. `layout.tsx` — branding fetch, conditional `data-site-bg`, mount SiteBackground.
5. `page.tsx` (home) — remove duplicate hero `<img>`.

### 3. Chrome

6. `Header.tsx` — glass bar, scroll → solid; logoUrl prop.
7. `Footer.tsx` + `LocaleSwitcher.tsx` — light text / glass when bg active.

### 4. Admin copy

8. Content page label: Site background.

## Риски

- 🟡 Parallax + fixed bg — проверить iOS scroll/jank.
- 🟡 CLS — bg через CSS background-image, не layout-shifting img.

## Проверка

1. Upload hero in admin → all routes show bg.
2. Remove hero → fallback UI.
3. `npm run build -w dogrsc-frontend`
