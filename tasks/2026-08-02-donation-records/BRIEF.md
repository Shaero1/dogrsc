# BRIEF: donation records

Дата: 2026-08-02

Папка задачи: `tasks/2026-08-02-donation-records/`

## Формулировка своими словами

Страница **`/[locale]/donate`**: краткое intro и **две кнопки** — «Сделать донат криптой» и «Сделать донат банковским переводом». Реквизиты и форма **не на странице целиком**, а в **модальном окне**, которое открывается по кнопке: внутри — способ оплаты (банк или crypto) + поля donor (сумма, имя, **email обязательно**). Submit → `PENDING` в БД → redirect **`/donate/thank-you`**. Admin Confirm → dashboard. Email donor **хранится** в БД (страховка/учёт); SMTP — не в этой задаче.

## UX (заказчик)

```text
/donate
  [ Сделать донат криптой ]  [ Сделать донат банковским переводом ]

  ── click bank ──► modal: bank requisites + form (amount, name, email) + Отправить
  ── click crypto ► modal: crypto addresses + copy + form + Отправить

  ── submit ──► thank-you page
```

## Контекст

- Текущий `/donate` — bank и crypto **на странице**; переделаем под две кнопки + modal.
- **Reports pattern:** Server Action, thank-you отдельной страницей.
- **Dashboard:** sum CONFIRMED UTC-month — без изменений логики.

## Scope

### Backend

**Migration:** optional `payment_method` на `donations` — enum/string `BANK` | `CRYPTO` (для admin и учёта).

**Public (`@Public()`):**

| Method | Path | Назначение |
|--------|------|------------|
| POST | `/api/v1/donate/donations` | `{ amount, donorName, donorEmail, paymentMethod: BANK\|CRYPTO }` → `PENDING` |

**Admin (`@Roles(ADMIN, STAFF)`):**

| Method | Path | Назначение |
|--------|------|------------|
| GET | `/api/v1/admin/donations` | list + filter status |
| POST | `/api/v1/admin/donations` | manual entry (+ paymentMethod, optional CONFIRMED) |
| PATCH | `/api/v1/admin/donations/:id` | `{ status: CONFIRMED \| FAILED }` from PENDING only |

### Frontend (public)

- **`donate/page.tsx`** — intro + **`DonatePageClient`** (две кнопки)
- **`DonationMethodModal.tsx`** — client modal: variant `bank` \| `crypto`; requisites inside; shared **`DonationReportForm`**
- **`donate/actions.ts`** — Server Action
- **`donate/thank-you/page.tsx`**
- i18n: кнопки, modal titles, form labels, thank-you

**Bank modal:** тексты requisites из i18n (как сейчас на странице).  
**Crypto modal:** `fetchCryptoAddresses` + `CryptoAddressList` + форма.

### Admin

- `/donations` — tabs Crypto addresses | **Donation records** (колонка payment method, Confirm/Reject, manual Add)

### Seed

- CONFIRMED 1000 THB BANK + PENDING 500 CRYPTO (marker emails)

### Не включаем

- SMTP thank-you email
- Captcha (🟡 риск)
- Auto-CONFIRMED from public
- Full-page requisites (убираем с main page)

## Критерии успеха

- [ ] Две кнопки; modal bank/crypto с requisites + form
- [ ] POST с paymentMethod → PENDING
- [ ] thank-you после submit
- [ ] Admin moderation + dashboard
- [ ] e2e + build

## Открытые вопросы

| Вопрос | Решение |
|--------|---------|
| UX две кнопки + modal | **Да** — по заказчику |
| email + name required | **Да** |
| paymentMethod в БД | **Да** — BANK \| CRYPTO |
| Thank-you | **Страница**, не email |
| Main page requisites | **Убрать** — только в modal |

## Чек-лист выхода

- [x] формулировка своими словами есть
- [x] критерии успеха измеримы
- [x] открытые вопросы закрыты
