# BRIEF: Report location picker (GPS + manual pin)

Дата: 2026-08-11

Папка задачи: `tasks/2026-08-11-report-location-picker/`

## Формулировка

В формах found/lost dog: **Use my location** (GPS) и **Place pin on map** (вручную). Одна карта, два входа. После GPS — карта с пином и возможность подвинуть (drag/tap).

## Scope

- `LocationPickerMap.tsx` — draggable marker, tap to place/move.
- `ReportForm.tsx` — две кнопки, `mapVisible` после GPS или manual.
- i18n en/th/ru.
- Backend / server actions — без изменений.

## Критерии успеха

- [x] GPS → карта + adjustable pin.
- [x] Manual → карта, tap ставит пин.
- [x] Drag и tap обновляют lat/lng в submit.
- [x] Без API key — fallback текст, GPS всё ещё работает.
- [x] Build OK.

## PLAN утверждён

2026-08-11 — пользователь «давай делаем с учетом этого».
