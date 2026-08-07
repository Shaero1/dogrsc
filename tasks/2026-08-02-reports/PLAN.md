# PLAN: reports

Дата: 2026-08-02

Папка задачи: `tasks/2026-08-02-reports/`

## Шаги

### Prerequisite

1. Infra + backend + auth; media module up.
2. Frontend `.env.local` с API URL (server actions читают env на сервере).

### Backend — Media extension

2. **`MediaService.validateEntityLink`** — добавить `found_report`, `lost_report` (проверка id в соответствующей таблице, report не deleted — N/A on MVP).
3. **`POST /api/v1/found-reports/:id/media`** `@Public()` — multipart `file`; report must exist; attach entity.
4. **`POST /api/v1/lost-reports/:id/media`** — аналогично.
   - Альтернатива отвергнута: только admin media upload — public не смог бы приложить фото.
   - **Spam note:** upload только если report id существует и создан недавно (optional TTL 15 min window — 🟡 в service).

### Backend — Reports module

5. **`src/reports/dto/`** — `CreateFoundReportDto`, `CreateLostReportDto`, `UpdateReportStatusDto`, response DTOs.
6. **`ReportsService`** — create found/lost; findAll admin; findById; updateStatus (only PENDING → APPROVED|REJECTED).
7. **`FoundReportsPublicController`** — `POST /found-reports` `@Public()`.
8. **`LostReportsPublicController`** — `POST /lost-reports` `@Public()`.
9. **`FoundReportsAdminController`** — prefix `admin/found-reports`.
10. **`LostReportsAdminController`** — prefix `admin/lost-reports`.
11. **`ReportsModule`** → `AppModule`.
12. List responses include media count or first thumbnail URL (via `MediaService.findByEntity`).

### Seed

13. **`prisma/seed.ts`** — upsert 1 found + 1 lost `PENDING` (фиксированные id или upsert by unique marker — e.g. reporter email `seed-found@dogerescue.org`).

### Frontend — Server Actions

14. **`frontend/lib/reports-types.ts`** — payload/response types.
15. **`frontend/app/[locale]/found-dog/actions.ts`** — `submitFoundReport(formData)` → POST API; optional second call upload media if file in FormData.
16. **`frontend/app/[locale]/lost-dog/actions.ts`** — аналогично.
17. Client component **`ReportForm.tsx`** — fields, geolocation button (`navigator.geolocation`), optional file input; hidden lat/lng; calls server action; `redirect` to thank-you on success.

### Frontend — Pages

18. **`app/[locale]/found-dog/page.tsx`** — form wrapper.
19. **`app/[locale]/found-dog/thank-you/page.tsx`**
20. **`app/[locale]/lost-dog/page.tsx`**
21. **`app/[locale]/lost-dog/thank-you/page.tsx`**
22. **`messages/*.json`** — `foundForm`, `lostForm`, `thankYou`, shared labels.

### Admin UI

23. **`admin/lib/reports-types.ts`** + **`admin/lib/api.ts`** — list, get, patch status.
24. **`admin/app/(admin)/reports/page.tsx`** — tabs Found/Lost, tables, Approve/Reject buttons, status filter.

### OpenAPI & tests

25. Swagger; `npm run openapi:export`.
26. **E2E** `test/reports.e2e-spec.ts`:
    - POST found → 201 PENDING
    - POST lost → 201
    - STAFF PATCH approve found
    - STAFF reject lost
    - POST media to found report id
    - GET admin list filters
27. **`npm run build`** монорепо.

### Docs & close

28. **`backend/README.md`**, **`frontend/README.md`**, **`admin/README.md`**
29. **`tasks/2026-08-02-reports/REPORT.md`**
30. **DECISIONS** — server actions, public media upload window, geolocation optional.

## Альтернативы

- **Client fetch + CORS :3000:** отвергнута — заказчик выбрал Server Actions.
- **Single multipart create (report+file):** отвергнута — два шага проще переиспользовать MediaModule; Server Action скрывает от UX.
- **Объединить found/lost в один controller:** отвергнута — две таблицы и разные URL в спеке.
- **Карта в этой задаче:** отвергнута — нужны approved + map UI.

## Риски

- 🔴 **Public media upload spam** → ДО merge: upload только для существующего report id; optional createdAt window 15 min; document in DECISIONS.
- 🔴 **Scope** → бюджет 40–50 файлов; стоп по RULES при превышении.
- 🟡 **Geolocation HTTPS** — localhost OK in dev; prod needs HTTPS.
- 🟡 **Server Action + file upload** — FormData with File through action (Next.js supported).
- 🟢 **Phone validation** — min length, no strict E.164 on MVP.

## Бюджет

- Файлов: ~40–50
- Время: ~5–7 часов
- Правило: превысил → стоп и пересмотр

## Чек-лист выхода

- [x] шаги конкретны
- [x] отвергнутая альтернатива с причиной
- [x] красных рисков сняты процедурой (upload window)
- [x] бюджет назначен

## Критерии BRIEF (для REPORT)

- [ ] public POST + optional media
- [ ] geolocation button
- [ ] admin moderation tabs
- [ ] server actions + thank-you
- [ ] seed 2 pending
- [ ] e2e + build
