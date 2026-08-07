# BRIEF: reports

Дата: 2026-08-02

Папка задачи: `tasks/2026-08-02-reports/` (создана через `python harness/new_task.py "reports"`).

## Формулировка своими словами

Публичные формы **«нашёл собаку»** и **«потерял собаку»** без регистрации: пользователь заполняет контакт и описание, опционально — геолокация и фото; report попадает в очередь `PENDING`. Staff/admin в `/reports` одобряет или отклоняет. Карта, matching и уведомления — **не в этой задаче**.

## Контекст

- **Schema:** `FoundReport`, `LostReport` — поля готовы (`found_reports`, `lost_reports`).
- **Media** (`08-media`): upload + entity link; расширим `entityType`: `found_report`, `lost_report`.
- **Auth:** JWT; moderation `@Roles(ADMIN, STAFF)`.
- **Frontend:** nav/home → `/found-dog`, `/lost-dog` — страниц нет.
- **Admin** `/reports` — заглушка.
- **I18N:** UI формы en/th/ru (`next-intl`); `description` — **один язык автора** (язык UI страницы), без автоперевода.

## Scope

### Backend

**Public (`@Public()`):**

| Method | Path | Назначение |
|--------|------|------------|
| POST | `/api/v1/found-reports` | создать found report → `201`, `PENDING` |
| POST | `/api/v1/lost-reports` | создать lost report → `201`, `PENDING` |

**Admin (`@Roles(ADMIN, STAFF)`):**

| Method | Path | Назначение |
|--------|------|------------|
| GET | `/api/v1/admin/found-reports` | список (pagination, filter `status`) |
| GET | `/api/v1/admin/lost-reports` | список |
| GET | `/api/v1/admin/found-reports/:id` | деталь + media |
| GET | `/api/v1/admin/lost-reports/:id` | деталь + media |
| PATCH | `/api/v1/admin/found-reports/:id` | `{ status: APPROVED \| REJECTED }` |
| PATCH | `/api/v1/admin/lost-reports/:id` | то же |

**Media extension:**

- `entityType`: `found_report`, `lost_report` (валидация в `MediaService`)
- Upload **после** создания report (как dogs): `POST /admin/media` для staff **не нужен** на public — public upload через отдельный `@Public()` endpoint **или** multipart на create — **см. PLAN**: public `@Public() POST /found-reports` + optional follow-up `POST /found-reports/:id/media` **или** single multipart create.

**Решение для MVP (PLAN):**  
1) `POST` report (JSON) → `{ id }`  
2) optional `POST /found-reports/:id/media` `@Public()` multipart (лимиты как media) — привязка к только что созданному report без auth (риск spam — см. риски).  
**Альтернатива в PLAN:** multipart на create с file field — проще UX одной формы.

**Уточнение BRIEF:** одна форма → **Server Action** создаёт report, затем если файл выбран — Server Action upload через internal fetch к public media endpoint или combined flow в action (create + upload server-side).

**Координаты:** кнопка «Use my location»; при отказе браузера — `latitude`/`longitude` = `null`.

**Validation:** `reporterName`, `reporterPhone`, `description` required; `reporterEmail` optional; lat ∈ [-90,90], lng ∈ [-180,180] if present.

### Frontend (public)

- `/[locale]/found-dog` — форма + geolocation button + optional photo
- `/[locale]/lost-dog` — аналогично
- **Server Actions** для submit (без CORS)
- Redirect после успеха → `/[locale]/found-dog/thank-you` (и lost аналог)
- i18n namespace `reports` + `foundForm` / `lostForm`

### Admin

- `/reports` — табы **Found** | **Lost**, таблица, filter status, Approve / Reject
- Детальный просмотр (modal или `/reports/found/[id]` — в PLAN минимально inline expand или link)

### Seed

- 1× `FoundReport` `PENDING`
- 1× `LostReport` `PENDING`

### Не включаем

- `/map`, approved pins
- Email/notifications
- Rate limit / captcha
- Публичный список reports
- Matching found ↔ lost

## Критерии успеха

- [ ] POST found/lost → `PENDING` в БД
- [ ] Optional photo linked via media (`found_report` / `lost_report`)
- [ ] Geolocation: заполнено или null
- [ ] Admin list + PATCH APPROVED/REJECTED (ADMIN + STAFF)
- [ ] Frontend forms + thank-you pages
- [ ] Admin `/reports` tabs работают
- [ ] Seed 2 demo pending reports
- [ ] e2e backend + `npm run build`

## Открытые вопросы

| Вопрос | Решение |
|--------|---------|
| Координаты | **C** — Use my location; null при отказе |
| Фото | **B** — optional media; entityType `found_report` / `lost_report` |
| Moderation | **ADMIN + STAFF** |
| Frontend submit | **B** — Server Actions |
| Admin UI | **Одна `/reports`, табы Found/Lost** |
| После submit | **Отдельная thank-you страница** |
| Seed | **1 pending found + 1 pending lost** |

## Чек-лист выхода

- [x] формулировка своими словами есть
- [x] критерии успеха измеримы
- [x] открытые вопросы закрыты
