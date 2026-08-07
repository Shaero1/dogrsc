# REPORT — Donation records

## Что сделано

### Backend
- Миграция `20260802120000_donation_payment_method` — поле `Donation.paymentMethod` (`BANK` | `CRYPTO`)
- `POST /api/v1/donate/donations` — публичный отчёт о пожертвовании → `PENDING`
- `GET/POST/PATCH /api/v1/admin/donations` — список, ручное добавление, модерация (`CONFIRMED` | `FAILED` только из `PENDING`)
- Seed: CONFIRMED 1000 THB (BANK) + PENDING 500 THB (CRYPTO)
- E2E: `backend/test/donation-records.e2e-spec.ts` (4 теста)

### Frontend
- `/[locale]/donate` — intro + две кнопки (crypto / bank), реквизиты в модалке
- Форма: amount, donorName, donorEmail → Server Action → API → redirect `/donate/thank-you`
- i18n en/th/ru

### Admin
- `/donations` — вкладки **Crypto addresses** | **Donation records**
- Records: фильтр по status, Confirm/Reject для PENDING, ручное добавление с payment method

## Проверки

```powershell
cd c:\dogrsc\backend; npx prisma migrate deploy; npm run db:seed
npm run test:e2e -w dogrsc-backend -- donation-records.e2e-spec.ts   # 4 passed
npx nest build   # OK (если EPERM на prisma generate — остановить dev-сервер backend)
npm run build -w dogrsc-frontend   # OK
npm run build -w dogrsc-admin      # OK
npm run openapi:export -w dogrsc-backend
```

## Не в скоупе

- SMTP / email уведомления донору
- Bank requisites в CMS (остаются static i18n)
- Blockchain watch

## Следующий шаг по roadmap

Admin `/users` или `/stories`.
