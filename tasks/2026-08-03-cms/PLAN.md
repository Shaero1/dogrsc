# PLAN: CMS (ContentTranslation)

Дата: 2026-08-03

## Шаги

### 1. Backend — manifest и module

1. **`backend/src/content/content-pages.manifest.ts`** — константы `PAGE_ENTITIES`: id, label, fields[].
2. **`content.service.ts`** — `getPublicPage(entityId, locale)`, `getAdminPage(entityId)`, `upsertPage(entityId, items)`; Prisma upsert по unique key; locale fallback chain: requested → en.
3. **DTOs** — `PageContentPublicDto`, `PageContentAdminDto`, `UpsertPageContentDto`.
4. **`content-public.controller.ts`** — `GET content/pages/:entityId` + `@Query('locale')`.
5. **`content-admin.controller.ts`** — `GET content/pages`, `GET content/pages/:entityId`, `PUT content/pages/:entityId`; `@Roles(ADMIN)`.
6. **`content.module.ts`** → register in `AppModule`.
7. **Seed** — функция `seedContentTranslations()` читает/дублирует значения из inline map (скопировано из messages) для en/th/ru; idempotent upsert.
8. **E2E** `test/content.e2e-spec.ts` — public GET th; PUT admin; STAFF 403; fallback en.

### 2. Admin UI

9. **`admin/lib/content-types.ts`** + **`admin/lib/api.ts`**: `listContentPages`, `getContentPage`, `updateContentPage`.
10. **`admin/app/(admin)/content/page.tsx`** — select page, locale tabs, form, save.
11. **`admin/lib/nav-items.ts`** — пункт Content.

### 3. Frontend integration

12. **`frontend/lib/content-api.ts`** — server fetch public endpoint.
13. **`frontend/lib/page-content.ts`** — `resolvePageContent(namespace, entityId, locale, t)` → Record<string, string>.
14. Обновить **`about/page.tsx`**, **`contact/page.tsx`**, **`stories/page.tsx`** — CMS + fallback; `export const dynamic = 'force-dynamic'`.
15. **`donate/page.tsx`** — fetch `donate-bank`; передать bank props в **`DonatePageClient`** → **`DonationMethodModal`**.

### 4. Docs & verify

16. **`backend/README.md`** — секция Content API.
17. **`npm run build`**, **`npm run test:e2e -w dogrsc-backend`** (с docker dev).
18. Smoke: dev `:3000` + seed; опционально staging `:3002`.
19. **`tasks/2026-08-03-cms/REPORT.md`**, **`harness/DECISIONS.md`**.

## Альтернативы

- **Один endpoint `GET /content?entityId=&locale=`:** отвергнута — REST path `/pages/:id` понятнее и совпадает с admin.
- **Убрать messages fallback сразу:** отвергнута — риск пустых страниц без seed; hybrid безопаснее.
- **STAFF может редактировать контент:** отвергнута — marketing copy = ADMIN only, как users.
- **Markdown WYSIWYG:** отвергнута — plain text достаточен для MVP; меньше зависимостей.

## Риски

- 🔴 **Пустая БД без seed** → страницы из messages fallback; seed обязателен в README/staging docs.
- 🟡 **Donate bank в client modal** → props с server page, не client fetch (избежать hydration mismatch).
- 🟡 **Много полей в одном PUT** → одна транзакция Prisma `$transaction` upsert batch.
- 🟢 **Staging SSR** → уже есть `getApiBase()` / `API_URL`.

## Бюджет

- Файлов: ~22
- Время: ~3–4 ч
- E2E: +1 spec (~6 cases)

## Порядок проверки

1. `npm run db:seed -w dogrsc-backend`
2. `curl GET /api/v1/content/pages/about?locale=ru`
3. Admin `/content` → изменить title → frontend `/ru/about`
4. `npm run test:e2e -w dogrsc-backend`
