# PLAN: donate

Дата: 2026-08-02

Папка задачи: `tasks/2026-08-02-donate/`

## Шаги

### Prerequisite

1. Infra + backend + auth; admin login работает.

### Backend — Donations module

2. **`src/donations/dto/`** — create/update DTOs, public + admin response DTOs.
3. **`CryptoAddressesService`** — list public active; admin list/create/update; enforce one active per `CryptoCurrency`.
4. **`DonatePublicController`** — `GET /donate/crypto-addresses` `@Public()`.
5. **`CryptoAddressesAdminController`** — prefix `admin/crypto-addresses`.
6. **`DonationsModule`** → `AppModule`.

### Seed

7. **`prisma/seed.ts`** — upsert 4 demo crypto addresses (BTC, ETH, USDT, DOGE).

### Frontend (public)

8. **`lib/donate-api.ts`** — `fetchCryptoAddresses()`, RSC, `revalidate: 300`
9. **`components/CryptoAddressList.tsx`** — client copy-to-clipboard
10. **`app/[locale]/donate/page.tsx`**
11. **`messages/{en,th,ru}.json`** — namespace `donate`

### Admin

12. **`admin/lib/crypto-types.ts`** + расширение **`admin/lib/api.ts`**
13. **`admin/app/(admin)/donations/page.tsx`** — crypto table + add/edit/active toggle

### Tests & docs

14. **E2E** `test/donate.e2e-spec.ts`:
    - GET public — only active
    - POST admin create
    - PATCH deactivate
    - second active same currency → 409
15. **`npm run build`** backend + frontend + admin; **`openapi:export`**
16. READMEs, **`tasks/2026-08-02-donate/REPORT.md`**, **`harness/DECISIONS.md`**

## Альтернативы

- **Хранить crypto в env/config, без БД:** отвергнута — admin не сможет менять адреса без деплоя; в schema уже есть `crypto_addresses`.
- **Публичная форма «я пожертвовал» → `donations`:** отвергнута — шире скоуп, нужна модерация/верификация; MVP — только показ реквизитов.
- **QR-коды на странице:** отвергнуты — добавляет зависимость/UI без блокера MVP; copy достаточно.
- **ContentTranslation для bank text:** отвергнута — CMS позже; static i18n быстрее для MVP.
- **Hard DELETE адресов:** отвергнут — deactivate безопаснее для истории.

## Риски

- 🟡 **Copy clipboard в HTTP (не localhost)** → `navigator.clipboard` с fallback `execCommand`; тестировать в Chrome.
- 🟡 **Duplicate active currency** → service-level check + unique partial index не добавляем (MVP app logic + e2e).
- 🟢 **Fake seed addresses** → явно dev-only в README.

## Бюджет

- Файлов: ~20
- Время: ~2–3 ч
- Правило: превысил → стоп и пересмотр

## Чек-лист выхода

- [x] шаги конкретны (сделан/не сделан)
- [x] есть отвергнутые альтернативы с содержательной причиной
- [x] красных рисков нет
- [x] бюджет назначен
