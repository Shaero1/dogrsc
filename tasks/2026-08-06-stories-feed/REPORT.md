# Stories feed — implementation report

**Date:** 2026-08-06  
**Status:** Done

## Summary

Replaced the fixed 3-slot CMS stories page with a full Story entity, public API, admin CRUD, and frontend feed + detail pages.

## Backend

- `Story` model + migration `20260806220000_stories_feed`
- Module: `backend/src/stories/` — public `GET /stories`, `GET /stories/:slug`; admin CRUD; DELETE ADMIN-only
- Media entity type `story` for cover images
- Seed: 3 demo stories (`luna-temple`, `mango-siblings`, `timely-report`) from former CMS content
- E2E: `backend/test/stories.e2e-spec.ts` (4 tests, passing)

## CMS

- `stories` page entity reduced to `title`, `subtitle`, `ctaDonate`, `ctaDogs`
- Removed `story1–3` fields from manifest and content seed

## Admin

- Nav item **Stories**
- List with publish filter + pagination
- New / edit forms with en/th/ru tabs, optional dog link, cover upload
- Delete: ADMIN only

## Frontend

- `/stories` — feed from API (revalidate 60s)
- `/stories/[slug]` — detail page with cover, body, optional dog link
- i18n: `readMore`, `backToList`, `empty`, `noPhoto`; removed story1–3 keys

## Verification

- `npm run db:migrate:deploy -w dogrsc-backend` — applied
- `npm run db:seed -w dogrsc-backend` — stories seeded
- `npm run build:backend` — OK
- `npm run build:frontend` — OK
- `npm run build:admin` — OK
- `npm run test:e2e -- stories.e2e-spec.ts` — 4/4 passed

## Manual smoke (optional)

1. Open `/en/stories` — 3 cards from seed
2. Open `/en/stories/luna-temple` — full text + link to Luna
3. Admin `/stories` — list, create draft, publish, upload cover
