# REPORT: Fix home stats locale RangeError

Дата: 2026-08-11

Папка задачи: `tasks/2026-08-11-fix-home-stats-locale/`

## Сделано

- **`frontend/lib/format-number.ts`** — `formatNumber(value, locale)` с map `en→en-US`, `th→th-TH`, `ru→ru-RU`, проверкой `Intl.NumberFormat.supportedLocalesOf`, try/catch и fallback.
- **`page.tsx`** — форматирование на server до рендера.
- **`HomeStatsSection.tsx`** — принимает `formattedValue: string`, без `toLocaleString`.

## Проверка

| Шаг | Результат |
|-----|-----------|
| `npm run build -w dogrsc-frontend` | ✅ |
| Lint | ✅ |

## Файлы

- `frontend/lib/format-number.ts`
- `frontend/app/[locale]/page.tsx`
- `frontend/components/HomeStatsSection.tsx`

## Критерии BRIEF

- [x] Safe formatting для всех locales
- [x] Build OK
- [x] REPORT

## Дальше

- Commit + redeploy frontend на Railway для prod fix.
