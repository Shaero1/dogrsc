# PLAN: reports-public

Дата: 2026-08-05

## Backend

1. `ReportStatus` → `ACTIVE`, `HIDDEN`, `VERIFIED`; migration маппинг старых значений
2. `CaptchaService` (Turnstile); `CAPTCHA_SKIP` для e2e
3. Public `GET /found-reports`, `/found-reports/:id`, lost — без PII gate, с контактами
4. `POST` — captcha + create ACTIVE
5. Admin `PATCH` — HIDDEN | VERIFIED | ACTIVE
6. Map — ACTIVE|VERIFIED + coords
7. Dashboard — `reportsActive` вместо `reportsPending`

## Frontend

1. `/found-dog`, `/lost-dog` — списки
2. `/found-dog/new`, `/lost-dog/new` — форма + Turnstile
3. `/found-dog/[id]`, `/lost-dog/[id]` — detail с контактами
4. thank-you + nav/home

## Admin

1. `/reports/found/[id]`, `/reports/lost/[id]`
2. List: клик → detail; hide/verify
3. Убрать Approve/Reject gate

## Verify

`npm run test:e2e -w dogrsc-backend`, `npm run build`
