# BRIEF: admin dashboard

Дата: 2026-08-02

Папка задачи: `tasks/2026-08-02-admin-dashboard/`

## Формулировка своими словами

Страница **`/dashboard`** в admin показывает **реальные цифры** из backend вместо «—»: собаки на попечении, очередь модерации reports, пожертвования за месяц, собаки в поиске дома. Один API-запрос при загрузке. Volunteers / графики / audit — **не в этой задаче**.

## Контекст

- **Dashboard stub** — 4 карточки с placeholder и комментарием `GET /admin/dashboard`.
- **Данные уже в БД:** dogs, found/lost reports, donations (таблица есть, записей может не быть).
- **Volunteers** — нет модели в MVP (этап 2).
- Admin UI — English only; API `@Roles(ADMIN, STAFF)`.

## Scope

### Backend

**`GET /api/v1/admin/dashboard/stats`** (`ADMIN` + `STAFF`):

| Поле | Источник |
|------|----------|
| `dogsUnderCare` | `dogs` where `status = IN_CARE` |
| `reportsPending` | `found_reports` PENDING + `lost_reports` PENDING |
| `donationsThisMonth` | `donations` where `createdAt` in current UTC month, `status = CONFIRMED`; **sum `amount`** (THB) |
| `dogsAvailable` | `dogs` where `status = AVAILABLE` (**без** фильтра `isPublished`) |

Response example:
```json
{
  "dogsUnderCare": 1,
  "reportsPending": 4,
  "donationsThisMonth": 0,
  "dogsAvailable": 1
}
```

`donationsThisMonth` — число (сумма THB), `0` если записей нет.

### Admin frontend

- **`/dashboard`** — client fetch stats, 4 cards с реальными значениями
- Обновить labels: 4-я карточка **«Dogs available»** вместо «Active volunteers»
- Loading / error states
- **`admin/lib/api.ts`** — `fetchDashboardStats(token)`
- Quick links под карточками (optional minimal): Reports → `/reports`, Dogs → `/dogs`

### Не включаем

- Volunteer count
- Charts, trends, date range picker
- Donation CRUD / manual entry
- Audit log widget
- Public frontend changes

## Критерии успеха

- [ ] `GET /admin/dashboard/stats` возвращает корректные counts после seed
- [ ] `/dashboard` показывает числа (не «—») при залогиненном admin
- [ ] Loading/error обработаны
- [ ] e2e backend + `npm run build` admin + backend
- [ ] `admin/README.md` обновлён

## Открытые вопросы

| Вопрос | Решение (MVP) |
|--------|----------------|
| Active volunteers | **A — Dogs available:** `status = AVAILABLE`, без `isPublished`; label «Dogs available»; pipeline усыновления, не только витрина |
| Donations metric | **Sum CONFIRMED за текущий UTC month**; 0 если пусто |
| Pending reports | **Found + Lost** PENDING в одной цифре |
| Dogs under care | **`status = IN_CARE`** (не все non-archived) |
| Quick links | **Да** — Reports, Dogs под grid |

## Чек-лист выхода

- [x] формулировка своими словами есть
- [x] критерии успеха измеримы
- [x] открытые вопросы закрыты
