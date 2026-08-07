# BRIEF: donate

Дата: 2026-08-02

Папка задачи: `tasks/2026-08-02-donate/`

## Формулировка своими словами

Публичная страница **`/[locale]/donate`**: посетитель видит, как поддержать организацию — **банковский перевод** (статический текст в i18n) и **криптовалютные адреса** (BTC, ETH, USDT, DOGE) из backend. Адреса редактирует staff/admin в **`/donations`**. Автоматический приём платежей, Electrum, форма «я перевёл» — **не в этой задаче**.

## Контекст

- **Schema:** `CryptoAddress` (currency, address, isActive), `Donation` — таблица есть, CRUD пожертвований отложен.
- **DECISIONS:** MVP crypto — **статические адреса**; мониторинг блокчейна — этап 2.
- **Nav/home** уже ведут на `/donate` — страницы нет (404).
- **Admin** `/donations` — заглушка.
- Stripe/PayPal — не планируются в MVP.

## Scope

### Backend

**Public (`@Public()`):**

| Method | Path | Назначение |
|--------|------|------------|
| GET | `/api/v1/donate/crypto-addresses` | Активные адреса для страницы donate |

Response: `{ items: [{ id, currency, address }] }` — только `isActive=true`.

**Admin (`@Roles(ADMIN, STAFF)`):**

| Method | Path | Назначение |
|--------|------|------------|
| GET | `/api/v1/admin/crypto-addresses` | Все адреса |
| POST | `/api/v1/admin/crypto-addresses` | Создать `{ currency, address }` |
| PATCH | `/api/v1/admin/crypto-addresses/:id` | `{ address?, isActive? }` |

Правило MVP: **не более одного активного адреса на валюту** (409 при попытке второго active).

### Frontend (public)

- `/[locale]/donate` — секции Bank transfer + Crypto
- Crypto: список из API, кнопка **Copy address**
- Bank: тексты в `messages` (en/th/ru), без backend CMS
- i18n namespace `donate`

### Admin

- `/donations` — таблица crypto addresses, Add form, toggle Active / edit address
- Блок «Donation records» — короткая заглушка «coming in a later task» (таблица `donations` не трогаем)

### Seed

- По одному demo-адресу на BTC, ETH, USDT, DOGE (`isActive=true`, obviously fake/test strings)

### Не включаем

- Запись в `donations` с публичной формы
- Blockchain watch / Electrum
- QR-коды (можно позже)
- ContentTranslation CMS для bank details
- Audit log записей

## Критерии успеха

- [ ] GET public crypto — только active addresses
- [ ] Admin CRUD + deactivate; один active на currency
- [ ] `/en/donate` показывает bank text + crypto с copy
- [ ] Admin `/donations` управляет адресами
- [ ] Seed 4 demo addresses
- [ ] e2e backend + `npm run build` (backend, frontend, admin)
- [ ] README smoke

## Открытые вопросы

| Вопрос | Решение (MVP) |
|--------|----------------|
| Кто редактирует адреса? | **ADMIN + STAFF** |
| Несколько active на валюту? | **Нет** — один active per currency |
| Bank details | **Static i18n** на frontend |
| Donation table | **Не используем** в этой задаче |
| Удаление адреса | **Deactivate** (`isActive=false`), без hard delete |
| Seed addresses | **Fake dev strings**, не реальные кошельки |

## Чек-лист выхода

- [x] формулировка своими словами есть
- [x] критерии успеха измеримы
- [x] открытые вопросы закрыты
