# PLAN: admin dashboard

Дата: 2026-08-02

Папка задачи: `tasks/2026-08-02-admin-dashboard/`

## Шаги

### Backend

1. **`src/dashboard/dto/dashboard-stats.dto.ts`** — response DTO.
2. **`DashboardService.getStats()`** — parallel Prisma counts/sum.
3. **`DashboardAdminController`** — `GET /admin/dashboard/stats`, `@Roles(ADMIN, STAFF)`.
4. **`DashboardModule`** → `AppModule`.

### Admin UI

5. **`admin/lib/dashboard-types.ts`**
6. **`admin/lib/api.ts`** — `fetchDashboardStats(token)`
7. **`admin/app/(admin)/dashboard/page.tsx`** — client component, cards, links to `/reports`, `/dogs`

### Tests & docs

8. **E2E** `test/dashboard.e2e-spec.ts` — auth required, counts match seeded data shape
9. **`npm run build`** backend + admin; **`openapi:export`**
10. **`backend/README.md`**, **`admin/README.md`**
11. **`tasks/2026-08-02-admin-dashboard/REPORT.md`**, **`harness/DECISIONS.md`**

## Альтернативы

- **Клиент дергает list endpoints и считает `total`:** отвергнута — лишние данные и 3–4 запроса; один aggregate endpoint проще и быстрее.
- **Оставить volunteers как «—»:** отвергнута — бессмысленная карточка навсегда.
- **C — Available & published:** отвергнута — заказчик выбрал **A** (весь pipeline AVAILABLE, включая unpublished).
- **Donation count вместо sum:** отвергнута — сумма THB информативнее для «Donations (month)» в заголовке stub.

## Риски

- 🟢 **Donations всегда 0** — ожидаемо до задачи donation records; README упомянет.
- 🟢 **UTC month boundary** — зафиксировать UTC в service; e2e не завязан на границу месяца.

## Бюджет

- Файлов: ~12
- Время: ~1–2 ч

## Чек-лист выхода

- [x] шаги конкретны
- [x] отвергнутая альтернатива с причиной
- [x] бюджет назначен
