# BRIEF: admin /users

Дата: 2026-08-02

Папка задачи: `tasks/2026-08-02-admin-users/`

## Формулировка своими словами

Закрыть заглушку **`/users`** в admin: **ADMIN** управляет учётными записями, которые могут входить в админку — роли **ADMIN** и **STAFF**. Нужны backend CRUD-lite (список, создание, смена роли, сброс пароля) и client-страница по паттерну `/reports`, `/donations`.

Публичные пользователи (`USER`, этап 2 `/account`) — **не в скоупе**. Удаление пользователей — **нет** (FK на `media`, `audit_logs`).

## Контекст

- **Schema:** `User` — `email`, `passwordHash`, `role` (`ADMIN` | `STAFF` | `USER`); seed: `admin@dogerescue.org`, `system@dogerescue.org` (служебный, для media).
- **Auth:** login только для ADMIN/STAFF; guards уже есть (`JwtAuthGuard`, `RolesGuard`).
- **Admin:** `/users` — `PlaceholderSection`; nav уже ведёт на `/users`.
- **Паттерн:** client page + `admin/lib/api.ts` + types; sensitive ops — **ADMIN only** (как archive dog).

## Scope

### Backend

- `UsersModule` + `UsersAdminController` `@Roles(ADMIN)` на весь контроллер
- `GET /api/v1/admin/users` — paginated list; query `role?`, `page`, `limit`; по умолчанию **только ADMIN+STAFF** (не показывать `USER` и `system@`)
- `POST /api/v1/admin/users` — `{ email, password, role: ADMIN|STAFF }` → bcrypt hash
- `PATCH /api/v1/admin/users/:id` — `{ role?: ADMIN|STAFF, password?: string }`
- Защиты:
  - нельзя понизить/удалить **последнего ADMIN**
  - нельзя менять `system@dogerescue.org`
  - ADMIN не может понизить **сам себя**, если он последний ADMIN
- DTO validation: email, password min 8, role enum
- E2E: `users-admin.e2e-spec.ts`
- OpenAPI + `backend/README.md`

### Admin UI

- `/users` — таблица: email, role, createdAt
- Форма «Add user»: email, password, role (ADMIN/STAFF)
- Действия на строке: смена role (select + Save), reset password (поле + Save)
- Ошибки API — текст под формой
- UI на **en** (как остальная admin)

### Не включаем

- CRUD для `USER` / регистрация публики
- Hard delete / deactivate flag
- Audit log записи
- Email invite / forgot password
- STAFF доступ к `/users` (только ADMIN)

## Критерии успеха

- [ ] `GET/POST/PATCH /admin/users` работают; STAFF получает **403**
- [ ] Созданный STAFF может залогиниться в admin
- [ ] Последний ADMIN защищён от понижения роли
- [ ] `system@dogerescue.org` не редактируется через API
- [ ] Admin `/users` — список + create + patch role/password
- [ ] E2e проходит; `npm run build` backend + admin OK
- [ ] PLAN утверждён человеком до реализации

## Открытые вопросы

| Вопрос | Статус |
|--------|--------|
| Кто видит `/users`? | **Только ADMIN** — управление ролями чувствительно |
| Показывать `USER` в списке? | **Нет** на MVP — фильтр `role IN (ADMIN, STAFF)` |
| Удаление? | **Нет** — только create + patch |
| Seed STAFF? | **Опционально** один demo STAFF в seed; e2e создаёт staff в `beforeAll` |
| Commit? | **Только по явному запросу** |

## Чек-лист выхода

- [x] формулировка своими словами есть
- [x] критерии успеха измеримы
- [x] открытые вопросы закрыты или отложены явно
