# REPORT: Glass UI — inner pages + cards

Дата: 2026-08-10

Папка задачи: `tasks/2026-08-10-glass-ui-pages/`

## Сделано

### CSS

- Glass tokens: `.glass-panel-page`, `.glass-panel-form`, `.glass-card`, `.glass-card-media-empty`, `.page-header`.
- Стили активны при `[data-site-bg]`; без фона — стандартный light layout.

### InnerMain

- Заголовок (`header` prop) **вне** panel; контент в glass panel.
- `solid` для donate/forms.

### Pages

- ~18 inner routes переведены на `InnerMain` (about, contact, faq, stories, dogs, map, donate, found/lost, thank-you, detail pages).

### Cards

- `ReportListCard`, `StoryCard` — glass cards; empty media без bg-slice.

### Cleanup

- Удалены битые черновики `InnerPage.tsx`, `GlassPanel.tsx`.

## Проверка

| Шаг | Результат |
|-----|-----------|
| Локальная реализация | ✅ |
| `npm run build -w dogrsc-frontend` | ✅ |
| Commit в main | ❌ не закоммичено |

## Не сделано / дальше

- FAQ items как отдельные glass cards.
- Automated a11y contrast tests на светлых hero.
- Commit + deploy.

## Файлы (основные)

- `frontend/app/globals.css`
- `frontend/components/site-shell/InnerMain.tsx`
- `frontend/lib/cn.ts`
- `frontend/app/[locale]/**/page.tsx` (inner pages)
- `frontend/components/ReportListCard.tsx`, `StoryCard.tsx`

## Критерии BRIEF

- [x] Title outside, body in glass
- [x] Glass cards, empty media OK
- [x] Forms use glass-panel-form
- [x] Fallback без bg
- [x] Build OK
- [x] REPORT
