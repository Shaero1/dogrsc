# BRIEF: public dogs

Дата: 2026-08-02

Папка задачи: `tasks/2026-08-02-public-dogs/` (создана через `python harness/new_task.py "public dogs"`).

## Формулировка своими словами

Подключить **публичный frontend** к уже готовому API собак: страница каталога `/[locale]/dogs` и профиль `/[locale]/dogs/[slug]`. Тексты собак — с backend по `Accept-Language` (en/th/ru, fallback en). UI-строки — из `next-intl`. Backend и admin **не меняем** (кроме CORS, если понадобится — см. PLAN: fetch с сервера Next.js).

## Контекст

- **Backend** (`10-dogs`): `GET /api/v1/dogs`, `GET /api/v1/dogs/:slug` — `isPublished=true`, status `AVAILABLE`|`IN_CARE`; locale через header.
- **Seed:** `luna`, `mango` после `npm run db:seed`.
- **Frontend:** Next.js 16 + next-intl; home уже ссылается на `/dogs`; страниц dogs **нет**.
- **Env:** `frontend/.env.example` — `NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1`.
- Nav/header/footer уже содержат пункт «Our Dogs».

## Scope

### Frontend (`frontend/`)

- `lib/api.ts` — server-side fetch к public dogs API; передача `Accept-Language` из locale.
- `app/[locale]/dogs/page.tsx` — список карточек (name, status badge, preview image если есть).
- `app/[locale]/dogs/[slug]/page.tsx` — профиль: name, description, rescueStory, gallery media.
- `generateMetadata` на detail — из `seoTitle` / `seoDescription` API (fallback name/description).
- i18n: namespace `dogs` в `messages/en.json`, `th.json`, `ru.json` (заголовки, empty state, status labels, back link).
- Empty state если API вернул 0 собак.
- `notFound()` если slug не найден (404 от API).

### Backend

- **Не меняем** endpoints.
- Fetch через **RSC (server)** — CORS для `:3000` не требуется.

### Не включаем

- Client-side infinite scroll / pagination UI (первая страница, limit 20).
- Фильтры, поиск, сортировка.
- `next/image` remote config (MVP: `<img>` для presigned MinIO URLs).
- SSR revalidate/cache tuning beyond default (можно `revalidate: 60` — в PLAN).
- Изменения admin/backend dogs CRUD.

## Критерии успеха

- [ ] `npm run dev:frontend` + backend up + seed → `/en/dogs` показывает `luna`, `mango`
- [ ] `/en/dogs/luna` — профиль на английском; `/th/dogs/luna` — th тексты (или fallback en)
- [ ] Несуществующий slug → Next.js 404
- [ ] Empty list — понятное сообщение (можно временно с unpublished dogs)
- [ ] Home link «Find a dog» ведёт на работающий каталог
- [ ] `npm run build` монорепо (frontend) проходит
- [ ] `frontend/README.md` обновлён (API URL, smoke)

## Открытые вопросы

| Вопрос | Решение |
|--------|---------|
| Server vs client fetch | **Server Components (RSC)** — без CORS |
| Pagination UI | **Нет** — первая страница, limit 20 |
| SEO metadata | **Да** — из API seo fields |
| Backend changes | **Нет** |

## Чек-лист выхода

- [x] формулировка своими словами есть
- [x] критерии успеха измеримы
- [x] открытые вопросы закрыты
