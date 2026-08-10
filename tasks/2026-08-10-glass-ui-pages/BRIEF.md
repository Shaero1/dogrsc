# BRIEF: Glass UI — inner pages + cards

Дата: 2026-08-10

Папка задачи: `tasks/2026-08-10-glass-ui-pages/`

## Формулировка своими словами

Убрать «белые квадраты» на фоне фото: **заголовок страницы вне glass panel** (белый текст на overlay), **контент внутри glass panel**. Карточки (reports, stories) — `.glass-card`; пустое media — glass без bg-slice. Формы/donate — плотнее (`glass-panel-form`).

## Контекст

- Site shell с fixed bg (`tasks/2026-08-10-site-shell-background`).
- Проблема: inner pages с opaque white boxes выглядели как «наклеенные плашки».

## Scope

### CSS tokens (`globals.css`)

- `.glass-panel-page`, `.glass-panel-form`
- `.glass-card`, `.glass-card-media-empty`
- `.page-header` — typography on photo

### Layout primitive

- `InnerMain.tsx` — prop `header` (outside panel), `solid` for forms.

### Pages (~18 inner routes)

- about, contact, faq, stories, dogs, map, donate, found/lost flows, thank-you pages — migrate to `InnerMain`.

### Components

- `ReportListCard`, `StoryCard` — glass-card; empty photo = glass only.

### Inputs

- Form inputs, modals — opaque (не glass) для читаемости.

## Критерии успеха

- [x] Inner pages: title on photo, body in glass panel.
- [x] Cards glass; no photo → no white slice.
- [x] Donate/forms — `glass-panel-form`.
- [x] Fallback без bg — обычный light UI.
- [x] `npm run build -w dogrsc-frontend` OK.
- [x] REPORT.

## Открытые вопросы

| Вопрос | Решение |
|--------|---------|
| FAQ per-item cards | Один panel на страницу (MVP); per-item — позже |
| WCAG на светлых фото | Overlay 55%; ручная проверка |

## Чек-лист выхода

- [x] scope и критерии
- [x] PLAN утверждён (задним числом)
