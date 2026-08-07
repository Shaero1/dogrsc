# REPORT: public dogs

Дата: 2026-08-02

Папка задачи: `tasks/2026-08-02-public-dogs/`

## Сделано

### Frontend
- `lib/api.ts` — `fetchPublicDogs`, `fetchPublicDogBySlug` (RSC, `Accept-Language`, `revalidate: 60`)
- `app/[locale]/dogs/page.tsx` — grid catalog, empty state
- `app/[locale]/dogs/[slug]/page.tsx` — profile, gallery, `generateMetadata`
- i18n namespace `dogs` в en/th/ru messages
- `frontend/README.md` — smoke instructions

### Backend
- **Не менялся** (RSC server fetch, CORS не нужен)

## Критерии BRIEF

| Критерий | Статус |
|----------|--------|
| `/en/dogs` shows seed dogs | ✅ (при backend + seed) |
| Locale via Accept-Language | ✅ |
| 404 unknown slug | ✅ `notFound()` |
| Empty list message | ✅ |
| Home link works | ✅ existing `/dogs` link |
| build OK | ✅ |
| README smoke | ✅ |

## Проверки

```powershell
npm run db:seed -w dogrsc-backend
npm run dev:backend
npm run dev:frontend
# /en/dogs, /th/dogs/luna
npm run build -w dogrsc-frontend
```

## Отклонения от PLAN

- Нет

## Следующие шаги

- `11-reports` — found/lost forms
- Optional: pagination, `next/image` remote patterns for MinIO
