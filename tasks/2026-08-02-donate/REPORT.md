# REPORT: donate

Дата: 2026-08-02

Папка задачи: `tasks/2026-08-02-donate/`

## Сделано

### Backend
- `src/donations/` — `DonationsModule`
- `GET /donate/crypto-addresses` — active only, public DTO
- Admin `GET/POST/PATCH /admin/crypto-addresses` (ADMIN + STAFF)
- One active address per currency → 409 on conflict
- Seed: BTC, ETH, USDT, DOGE demo addresses
- `test/donate.e2e-spec.ts`

### Frontend
- `lib/donate-api.ts`, `components/CryptoAddressList.tsx` (copy + fallback)
- `app/[locale]/donate/page.tsx` — bank i18n + crypto list
- i18n namespace `donate` (en/th/ru)

### Admin
- `lib/crypto-types.ts`, `lib/api.ts` extensions
- `/donations` — add address, activate/deactivate table

## Критерии BRIEF

| Критерий | Статус |
|----------|--------|
| Public GET — active only | ✅ |
| Admin CRUD + one active per currency | ✅ |
| `/en/donate` bank + crypto copy | ✅ |
| Admin `/donations` | ✅ |
| Seed 4 addresses | ✅ |
| e2e + build | ✅ |
| README | ✅ |

## Проверки

```powershell
npm run db:seed -w dogrsc-backend
npm run test:e2e -w dogrsc-backend
npm run build -w dogrsc-frontend
npm run build -w dogrsc-admin
npm run dev:backend
npm run dev:frontend
# http://localhost:3000/en/donate
npm run dev:admin
# http://localhost:3001/donations
```

## Отклонения от PLAN

- Нет

## Следующие шаги

- Content pages `/about`, `/contact`
- Admin dashboard stats
- Donation records + blockchain watch (этап 2)
