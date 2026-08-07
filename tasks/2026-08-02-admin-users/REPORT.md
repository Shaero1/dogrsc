# REPORT — admin /users

## Что сделано

### Backend
- `UsersModule` — `GET/POST/PATCH /api/v1/admin/users` (**ADMIN only**)
- Список только ADMIN+STAFF; `system@dogerescue.org` исключён
- Create: email + password (min 8) + role; bcrypt hash
- Patch: role и/или password; защита последнего ADMIN
- Seed: `staff@dogerescue.org` (`STAFF_EMAIL` / `STAFF_PASSWORD`)
- E2E: `backend/test/users-admin.e2e-spec.ts` (5 тестов)

### Admin
- `/users` — таблица, фильтр по role, форма Add user, Save role / Save password на строке
- `admin/lib/users-types.ts`, расширен `admin/lib/api.ts`

## Проверки

```powershell
cd c:\dogrsc\backend; npx nest build
npm run test:e2e -w dogrsc-backend -- users-admin.e2e-spec.ts   # 5 passed
npm run build -w dogrsc-admin                                   # OK
npm run openapi:export -w dogrsc-backend
npm run db:seed -w dogrsc-backend                               # admin + staff
```

## Не в скоупе

- USER role / public `/account`
- Delete / deactivate users
- Audit log on user changes

## Следующий шаг по roadmap

`/stories` или CI/CD + staging.
