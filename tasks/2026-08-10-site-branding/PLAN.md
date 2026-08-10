# PLAN: Site branding (logo + hero background)

Дата: 2026-08-10

> PLAN утверждён задним числом после реализации (commits `a516c24` … `86b6aaa`).

## Шаги

### 1. Backend branding API

1. `branding.service.ts` — resolve latest media для logo/hero, presigned URLs.
2. `branding-public.controller.ts` — `GET content/branding`.
3. `branding-admin.controller.ts` — `GET admin/content/branding`.
4. Media upload hooks для `site_logo` / `site_hero`.
5. E2E в `content.e2e-spec.ts`.

### 2. Admin UI

6. `BrandingImagePanel.tsx` — upload, preview, hint.
7. `admin/app/(admin)/content/page.tsx` — секции logo + hero.

### 3. Frontend

8. `branding-api.ts` — server fetch.
9. `Header.tsx` — prop `logoUrl`.
10. `page.tsx` (home) — hero image из branding.

### 4. Logo processing + Docker

11. `logo-image.processor.ts` — sharp trim + resize on upload.
12. Dockerfile backend — COPY node_modules для native deps.

## Риски

- 🟡 sharp в Docker — нужен полный node_modules layer.
- 🟢 Без hero — null, UI fallback.

## Проверка

1. Admin upload logo + hero.
2. `curl GET /api/v1/content/branding`
3. Frontend `/en` — logo + hero visible.
4. `npm run test:e2e -- content.e2e-spec.ts`
