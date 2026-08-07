# PLAN: admin /users

Дата: 2026-08-02

## Шаги

### Backend

1. **`users/` module** — `UsersService`, `UsersAdminController`, DTOs:
   - `UserAdminResponseDto` (id, email, role, createdAt, updatedAt — **без passwordHash**)
   - `CreateUserAdminDto`, `UpdateUserAdminDto`, `UserListQueryDto`
   - `PaginatedUsersAdminResponseDto`
2. **`GET /admin/users`** — `where: { role: { in: [ADMIN, STAFF] }, email: { not: SYSTEM_EMAIL } }`, pagination
3. **`POST /admin/users`** — bcrypt hash, role ADMIN|STAFF; 409 duplicate email
4. **`PATCH /admin/users/:id`** — role and/or password; guards:
   - `system@` → 400
   - last ADMIN demotion → 400
   - self-demotion when last ADMIN → 400
5. **Register** `UsersModule` in `AppModule`
6. **Seed** — optional `staff@dogerescue.org` (STAFF) из env или фиксированный dev email
7. **E2E** `test/users-admin.e2e-spec.ts` — STAFF 403 on list; ADMIN create STAFF; PATCH role; last ADMIN protection
8. **`npm run build`**, **`openapi:export`**, README section

### Admin

9. **`admin/lib/users-types.ts`** + extend **`admin/lib/api.ts`**: `listUsers`, `createUser`, `updateUser`
10. **`admin/app/(admin)/users/page.tsx`** — replace placeholder: list table, add form, inline role/password update
11. **`npm run build -w dogrsc-admin`**

### Close

12. **`REPORT.md`**, запись в **`harness/DECISIONS.md`**

## Альтернативы

- **STAFF может просматривать список, но не менять:** отвергнута — лишний UI/API split без запроса; проще один уровень доступа ADMIN-only.
- **Отдельный `POST /admin/users/:id/reset-password`:** отвергнута — PATCH с optional `password` достаточен для MVP, меньше endpoints.
- **Показывать всех USER в admin:** отвергнута — этап 2 `/account`; смешивает staff management с публикой.

## Риски

- 🔴 **Lockout (0 admins)** → ДО начала: `assertNotLastAdmin` в service перед demotion
- 🟡 **system user случайно отредактирован** → блок по email constant в service
- 🟡 **STAFF открывает `/users` в UI** → backend 403; UI без отдельного guard (acceptable MVP)
- 🟢 **Password в plain в admin form** → только HTTPS prod; dev localhost OK

## Бюджет

- Файлов: ~18
- Время: ~2–3 ч
- Правило: превысил → стоп и пересмотр

## Чек-лист выхода

- [x] шаги конкретны (сделан/не сделан)
- [x] есть отвергнутая альтернатива с содержательной причиной
- [x] красных рисков сняты (assert last admin)
- [x] бюджет назначен
