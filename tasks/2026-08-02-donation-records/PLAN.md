# PLAN: donation records

Дата: 2026-08-02

Папка задачи: `tasks/2026-08-02-donation-records/`

## User flow

```text
/donate → [Crypto] [Bank transfer]
       → modal (requisites + form)
       → POST PENDING + paymentMethod
       → /donate/thank-you

admin → Confirm → CONFIRMED → dashboard
```

## Шаги

### Backend

1. **Migration** — `donations.payment_method` (`BANK` | `CRYPTO`, nullable for legacy; required on new creates)
2. DTOs + **`DonationsRecordsService`**
3. **`POST /donate/donations`** `@Public()`
4. **`GET/POST/PATCH /admin/donations`**
5. **`DonationsModule`** wiring

### Seed

6. Demo records with paymentMethod

### Frontend

7. Refactor **`donate/page.tsx`** — intro only + client wrapper; fetch crypto for modal
8. **`DonatePageClient.tsx`** — two buttons, modal state
9. **`DonationMethodModal.tsx`** — bank i18n block OR CryptoAddressList + form
10. **`DonationReportForm.tsx`** + **`actions.ts`**
11. **`donate/thank-you/page.tsx`**
12. i18n en/th/ru (button labels, modal titles)

### Admin

13. types + api + **`donations/page.tsx`** tabs + records table

### Tests & docs

14. E2E + build + openapi + READMEs + REPORT + DECISIONS

## Альтернативы

- **Форма на странице без modal:** отвергнута — заказчик выбрал две кнопки + окно.
- **Одна кнопка «Я перевёл»:** отвергнута — нужно разделение bank/crypto до открытия формы.
- **Inline thank-you в modal:** отвергнута — redirect на thank-you как found/lost.

## Риски

- 🟡 Modal a11y (focus trap, Esc) — базовый dialog без shadcn; native `<dialog>` или простой overlay.
- 🟡 Spam — без captcha на MVP.

## Бюджет

- Файлов: ~25 (включая migration)
- Время: ~3–4 ч

## Чек-лист выхода

- [x] шаги конкретны
- [x] отвергнутые альтернативы с причиной
- [x] бюджет назначен
