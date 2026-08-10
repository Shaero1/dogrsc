# REPORT: Report location picker

Дата: 2026-08-11

Папка задачи: `tasks/2026-08-11-report-location-picker/`

## Сделано

- **`LocationPickerMap.tsx`** — карта с draggable pin; tap по карте ставит/перемещает точку; recenter после GPS.
- **`ReportForm.tsx`** — «Use my location» + «Place pin on map»; после GPS или manual показывается одна карта.
- **i18n** en/th/ru — подсказки adjust/manual/missing key.

## Проверка

| Шаг | Результат |
|-----|-----------|
| `npm run build -w dogrsc-frontend` | ✅ |
| Backend changes | none |

## Файлы

- `frontend/components/LocationPickerMap.tsx` (new)
- `frontend/components/ReportForm.tsx`
- `frontend/messages/{en,ru,th}.json`

## Критерии BRIEF

- [x] GPS → map + adjust
- [x] Manual pin
- [x] Submit coords
- [x] API key fallback
- [x] Build OK

## Дальше

- Commit + redeploy frontend на Railway.
- Manual smoke: `/en/found-dog/new`, `/en/lost-dog/new`.
