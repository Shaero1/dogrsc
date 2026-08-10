# PLAN: Fix home stats locale

Дата: 2026-08-11

1. `frontend/lib/format-number.ts` — safe helper.
2. `page.tsx` — `formatNumber(stats.dogsTotal, locale)`.
3. `HomeStatsSection.tsx` — prop `formattedValue`, убрать Intl.
4. Build + REPORT.
