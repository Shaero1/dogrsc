# REPORT: map

Дата: 2026-08-02

Папка задачи: `tasks/2026-08-02-map/`

## Сделано

### Backend
- `src/map/` — `MapModule`, `GET /map/markers` `@Public()`
- Public DTO без PII; optional `thumbnailUrl` via batch media lookup
- `MediaService.findFirstThumbnailUrls()` — первое фото на entity
- Seed: 2× APPROVED markers (Bangkok area)
- `test/map.e2e-spec.ts` — approve filter, type filter, no coords, no phone in response

### Frontend
- `lib/map-api.ts` — server fetch, `revalidate: 60`
- `components/ReportsMap.tsx` — `@vis.gl/react-google-maps`, filters, info window
- `app/[locale]/map/page.tsx`
- i18n `map` (en/th/ru)
- `.env.example` — `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
- Fallback UI без API key

## Критерии BRIEF

| Критерий | Статус |
|----------|--------|
| GET /map/markers — APPROVED + coords only | ✅ |
| Без phone/email/name | ✅ |
| type filter | ✅ |
| /en/map + UI filters | ✅ (карта — при API key) |
| PENDING / no coords excluded | ✅ |
| e2e + build | ✅ |
| README + .env.example | ✅ |

## Проверки

```powershell
npm run db:seed -w dogrsc-backend
npm run test:e2e -w dogrsc-backend
npm run build -w dogrsc-frontend
npm run dev:backend
npm run dev:frontend
# http://localhost:3000/en/map
# optional: NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in frontend/.env.local
```

## Отклонения от PLAN

- Нет

## Следующие шаги

- `donate` — static crypto addresses
- Admin dashboard — pending reports count
- Map clustering при большом числе markers
