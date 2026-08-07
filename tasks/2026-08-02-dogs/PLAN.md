# PLAN: dogs

Дата: 2026-08-02

Папка задачи: `tasks/2026-08-02-dogs/`

## Шаги

### Prerequisite

1. Infra up (Postgres, MinIO); `npm run db:seed` (admin user).
2. Backend dev с auth + media routes; admin dev на `:3001`.

### Schema

3. **Migration** — `Dog.isPublished Boolean @default(false)`.
4. **`npm run db:migrate -w dogrsc-backend`**
5. Document JSON shape: `descriptions.{locale}.name|description|rescueStory`.

### Backend — shared types & utils

6. **`src/dogs/dog-descriptions.types.ts`** — TypeScript types + helpers `getLocalizedDogContent(dog, locale)`.
7. **`src/dogs/slug.util.ts`** — `slugify(name: string): string` (lowercase, hyphen, ascii-safe).

### Backend — Dogs module (admin)

8. **DTOs** — `CreateDogDto`, `UpdateDogDto`, `DogAdminResponseDto`, `DogListQueryDto` (page, limit, status, isPublished).
9. **`DogsService`**:
   - create: validate en.name + en.description; autogen slug if omitted; unique slug check
   - update: partial fields; slug change with uniqueness
   - findAll admin (paginated)
   - findById admin (+ media for entityType=`dog`)
   - archive (ADMIN): set status ARCHIVED
10. **`DogsAdminController`** — prefix `admin/dogs`, `@Roles(ADMIN, STAFF)`; archive endpoint `@Roles(ADMIN)`.
11. **`DogsModule`** — register in `AppModule`.

### Backend — Dogs public

12. **`DogsPublicController`** — prefix `dogs`, `@Public()`:
    - GET `/` — filter `isPublished=true`, status IN (AVAILABLE, IN_CARE)
    - GET `/:slug` — same filters; parse `Accept-Language` (en/th/ru → fallback en)
13. **`DogPublicResponseDto`** — localized fields + slug + status + media thumbnails/urls.

### Backend — Media extension

14. **`POST /admin/media`** — accept optional `entityType`, `entityId` as form fields (validate dog exists if entityType=dog).
15. **`MediaService.findByEntity(entityType, entityId)`** — non-deleted media list.

### Seed

16. **`prisma/seed.ts`** — extend: upsert 1–2 dogs with en/th/ru snippets, `isPublished=true`; link seed media optional (upload in seed via S3 or skip photo if heavy — prefer 1 dog with placeholder text only, 1 with media if e2e allows).
17. Or **`prisma/seed-dogs.ts`** imported from seed — keep idempotent upsert by slug.

### Admin UI

18. **`admin/lib/api.ts`** — `listDogs`, `getDog`, `createDog`, `updateDog`, `archiveDog`, `uploadDogMedia(dogId, file)`.
19. **`admin/lib/dogs-types.ts`** — shared types mirroring API.
20. **`/dogs/page.tsx`** — table: name (en), slug, status, published, actions (edit, archive for admin).
21. **`/dogs/new/page.tsx`** — create form.
22. **`/dogs/[id]/edit/page.tsx`** — edit form + photo upload/list/delete media.
23. **Form component** — tabs En/Th/Ru; slug field with «Regenerate from EN name»; toggles status, isPublished.
24. Archive button — visible only if user role ADMIN (from fetchMe or JWT decode — prefer fetchMe).

### OpenAPI & tests

25. Swagger on all endpoints; export openapi.
26. **E2E** `test/dogs.e2e-spec.ts`:
    - ADMIN create dog → autogen slug
    - duplicate slug → 409
    - missing en.name → 400
    - STAFF create OK; STAFF archive → 403; ADMIN archive → 200
    - public GET list excludes unpublished / ARCHIVED
    - public GET by slug with Accept-Language: th
    - upload media linked to dog; appears in admin GET
27. **`npm run build`**, **`npm run test:e2e`**

### Docs & close

28. **`backend/README.md`** — dogs endpoints, isPublished, public filters.
29. **`admin/README.md`** — dogs management routes.
30. **`tasks/2026-08-02-dogs/REPORT.md`**
31. **DECISIONS** — isPublished, ARCHIVED not delete, slug autogen, public filter.

## Альтернативы

- **Hard delete dog:** отвергнута — риск потери связанных media и истории; ARCHIVED достаточно для MVP.
- **Public API в отдельной задаче:** отвергнута — заказчик выбрал B; frontend сможет подключиться сразу после.
- **Отдельная таблица DogTranslation:** отвергнута — JSONB уже в schema и DECISIONS.
- **Показывать все статусы на public:** отвергнута — только AVAILABLE+IN_CARE и isPublished по решению заказчика.
- **Slug только ручной:** отвергнута — autogen + override удобнее для staff.

## Риски

- 🔴 **Scope (backend + admin UI + public + seed)** → бюджет 40–50 файлов; при росте — остановка по RULES.
- 🔴 **isPublished отсутствует в schema** → migration шаг 3 до кода.
- 🟡 **JSONB validation** → явные DTO nested objects + class-validator.
- 🟡 **Slug collision on autogen** → append `-2`, `-3` suffix.
- 🟡 **Presigned URLs in list** → генерировать on read; не кешировать в DB.
- 🟡 **Archive vs PATCH status** → archive только через dedicated endpoint (ADMIN).
- 🟢 **Accept-Language parsing** → простой map en|th|ru, default en.

## Бюджет

- Файлов: ~40–50
- Время: ~6–8 часов
- Правило: превысил → стоп и пересмотр

## Чек-лист выхода

- [x] шаги конкретны (сделан/не сделан)
- [x] есть отвергнутая альтернатива с содержательной причиной
- [x] красных рисков сняты процедурой (migration first)
- [x] бюджет назначен

## Критерии BRIEF (для REPORT)

- [ ] isPublished migration
- [ ] admin CRUD + archive ADMIN
- [ ] slug autogen + manual
- [ ] en required / th ru optional
- [ ] public GET filters
- [ ] media link + admin UI upload
- [ ] seed 1–2 dogs
- [ ] e2e + build
