# PLAN: public dogs

Дата: 2026-08-02

Папка задачи: `tasks/2026-08-02-public-dogs/`

## Шаги

### Prerequisite

1. Infra + backend up; `npm run db:seed -w dogrsc-backend` (demo dogs published).
2. `frontend/.env.local` с `NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1`.

### API client

3. **`frontend/lib/api.ts`**:
   - `getApiBase()` из `NEXT_PUBLIC_API_URL` (fallback `http://localhost:4000/api/v1`)
   - Types: `PublicDog`, `PublicDogList` mirroring backend DTO
   - `fetchPublicDogs(locale, page?, limit?)` → `GET /dogs` + `Accept-Language: locale`
   - `fetchPublicDogBySlug(locale, slug)` → `GET /dogs/:slug`; on 404 return null
   - `fetch` option: `next: { revalidate: 60 }` for ISR-lite

### i18n

4. **`messages/en.json`, `th.json`, `ru.json`** — namespace `dogs`:
   - `title`, `subtitle`, `empty`, `backToList`, `rescueStory`, `statusAvailable`, `statusInCare`, `viewProfile`, `notFound` (optional UI)

### List page

5. **`app/[locale]/dogs/page.tsx`**:
   - `setRequestLocale(locale)`
   - fetch list server-side
   - Grid карточек: thumbnail (first media url or placeholder), name, status badge, link to `/dogs/[slug]`
   - Empty state

### Detail page

6. **`app/[locale]/dogs/[slug]/page.tsx`**:
   - fetch by slug; `notFound()` if null
   - `generateMetadata` from seoTitle/seoDescription
   - Layout: title, status, description, rescueStory (if present), image gallery
   - Link back to list

### Polish

7. Verify home `Link href="/dogs"` works (next-intl navigation — already `/dogs`).
8. **`frontend/README.md`** — dogs pages, env, smoke commands.

### Verify

9. ```powershell
   npm run dev:backend
   npm run dev:frontend
   ```
   - http://localhost:3000/en/dogs
   - http://localhost:3000/th/dogs/luna
10. `npm run build -w dogrsc-frontend`
11. **`tasks/2026-08-02-public-dogs/REPORT.md`**
12. **DECISIONS** — RSC fetch, no backend change

## Альтернативы

- **Client fetch + CORS :3000 на backend:** отвергнута — лишняя настройка; RSC проще и SEO-friendly.
- **OpenAPI codegen client:** отвергнута — один модуль, ручные types достаточны на MVP.
- **Static mock data:** отвергнута — цель задачи — реальный API.

## Риски

- 🔴 **Backend down / no seed** → smoke: health + `/api/v1/dogs` перед UI.
- 🟡 **Presigned URL expiry** → list/detail refetch on navigation; revalidate 60s acceptable.
- 🟡 **Mixed API URL in .env** → normalize base URL как в admin.
- 🟢 **Missing photos** → placeholder block in card/detail.

## Бюджет

- Файлов: ~10–15
- Время: ~2–3 часа
- Правило: превысил → стоп и пересмотр

## Чек-лист выхода

- [x] шаги конкретны
- [x] отвергнутая альтернатива с причиной
- [x] красных рисков сняты процедурой
- [x] бюджет назначен

## Критерии BRIEF (для REPORT)

- [ ] list + detail pages
- [ ] locale via Accept-Language
- [ ] empty + 404
- [ ] build OK
- [ ] README smoke
