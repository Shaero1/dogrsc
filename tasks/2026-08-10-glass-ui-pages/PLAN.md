# PLAN: Glass UI — inner pages + cards

Дата: 2026-08-10

> PLAN утверждён задним числом. Локально реализовано, не закоммичено.

## Шаги

### 1. CSS + primitive

1. `globals.css` — glass tokens, backdrop-filter, borders, page-header.
2. `frontend/lib/cn.ts` — class merge helper.
3. `InnerMain.tsx` — header outside, panel inside, `solid` variant.

### 2. Page migration

4. Batch update inner pages: wrap content in `InnerMain`, move `<h1>` to `header` prop.
5. Home — без full glass panel (hero content on bg).
6. Donate + form pages — `solid={true}`.

### 3. Cards

7. `ReportListCard`, `StoryCard` — `.glass-card`, empty media class.

### 4. Cleanup

8. Удалить черновики `InnerPage.tsx`, `GlassPanel.tsx` (orphan, ломали build).

## Риски

- 🟡 `backdrop-filter` — Safari/old browsers fallback (semi-opaque bg).
- 🟡 Много файлов — единый паттерн InnerMain снижает drift.

## Проверка

1. Visual: inner page with hero — title white, panel glass.
2. Card without image — no white rectangle.
3. `npm run build -w dogrsc-frontend`
