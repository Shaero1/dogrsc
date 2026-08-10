# BRIEF: Fix home stats locale RangeError

Дата: 2026-08-11

Папка задачи: `tasks/2026-08-11-fix-home-stats-locale/`

## Проблема

`HomeStatsSection` вызывал `value.toLocaleString(locale)` с коротким тегом (`en`/`th`/`ru`). На Railway (node:22-alpine, ограниченный ICU) это давало `RangeError: Incorrect locale information provided` и падение home при включённых stats.

## Решение

- `formatNumber()` — map в BCP-47, проверка `supportedLocalesOf`, try/catch, fallback `en-US` → `String(n)`.
- Форматирование на server page; `HomeStatsSection` получает готовую строку.

## Критерии успеха

- [x] Home не падает на `/en`, `/th`, `/ru` со stats.
- [x] `npm run build -w dogrsc-frontend` OK.
- [x] REPORT.

## PLAN утверждён

2026-08-11 — пользователь «делай».
