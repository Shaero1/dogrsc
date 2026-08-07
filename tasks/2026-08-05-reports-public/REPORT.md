# REPORT: reports-public

Дата: 2026-08-05

## Сделано

### Backend
- `ReportStatus`: `ACTIVE`, `HIDDEN`, `VERIFIED` (migration `20260805120000_report_status_public`)
- Public `GET /found-reports`, `/lost-reports`, `/:id` — с контактами, без admin-gate
- `POST` — Cloudflare Turnstile captcha (`CaptchaService`); `CAPTCHA_SKIP=true` для e2e
- Create → `ACTIVE` сразу; map — `ACTIVE|VERIFIED` + coords
- Admin `PATCH` — hide / verify / restore (без approve-gate)
- Dashboard: `reportsActive` вместо `reportsPending`

### Frontend
- `/found-dog`, `/lost-dog` — публичные списки + кнопка «Добавить»
- `/found-dog/new`, `/lost-dog/new` — форма + Turnstile
- `/found-dog/[id]`, `/lost-dog/[id]` — detail с телефоном/email
- i18n en/th/ru; home — кнопки found + lost

### Admin
- `/reports` — кликабельные строки, preview описания
- `/reports/found/[id]`, `/reports/lost/[id]` — полные данные, hide/verify/restore
- Убраны Approve/Reject как gate публикации

## Проверки

```powershell
cd c:\dogrsc\backend
$env:CAPTCHA_SKIP='true'
npm run test:e2e

cd c:\dogrsc
npm run build -w dogrsc-frontend
npm run build -w dogrsc-admin
```

- e2e: 53 passed
- frontend build: OK
- admin build: OK (после fix import)

## Env

**backend/.env**
```
CAPTCHA_SECRET_KEY=1x0000000000000000000000000000000AA
```

**frontend/.env.local**
```
NEXT_PUBLIC_TURNSTILE_SITE_KEY=1x00000000000000000000AA
```

Dev/test ключи Turnstile всегда проходят.

## Smoke

- http://localhost:3000/en/found-dog — список
- http://localhost:3000/en/found-dog/new — форма + captcha
- http://localhost:3001/reports — клик → detail
- После submit отчёт сразу в списке и на карте (если coords)
