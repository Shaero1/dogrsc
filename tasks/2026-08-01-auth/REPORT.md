# REPORT: auth

Дата: 2026-08-01

Папка задачи: `tasks/2026-08-01-auth/`

## Сделано

### Backend
- Зависимости: `@nestjs/jwt`, `@nestjs/passport`, `passport-jwt`, `bcrypt`, `class-validator`
- Env: `JWT_SECRET`, `JWT_EXPIRES_IN`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` в `.env.example`
- `prisma/seed.ts` — upsert admin (идемпотентный)
- `AuthModule`: login, me, JWT strategy, global guards
- `@Public()` на health + login; `@Roles(ADMIN, STAFF)` на `/auth/me`
- CORS для `http://localhost:3001`
- E2E: `test/auth.e2e-spec.ts`
- OpenAPI export обновлён

### Admin
- `lib/auth.ts`, `lib/api.ts`
- `/login` — реальный submit
- `AuthGate` в `(admin)/layout.tsx`
- Dev bypass только при `NODE_ENV === 'development'`
- Sign out в sidebar

## Критерии BRIEF

| Критерий | Статус |
|----------|--------|
| Admin user в БД (seed) | ✅ `npm run db:seed` |
| POST login 200/401 | ✅ e2e |
| GET me 200/401 | ✅ e2e |
| Guards (@Roles на me) | ✅ |
| Admin login → dashboard; без token — redirect | ✅ AuthGate |
| Dev bypass только development | ✅ |
| env examples backend + admin | ✅ |
| build + e2e OK | ✅ |

## Проверки

```powershell
cd c:\dogrsc\infra && docker compose -f docker-compose.dev.yml up -d
cd c:\dogrsc && npm run db:seed -w dogrsc-backend
npm run build
npm run test:e2e -w dogrsc-backend
npm run openapi:export -w dogrsc-backend
```

Результаты (2026-08-01):
- seed: OK (`admin@dogerescue.org`)
- build (backend + frontend + admin): OK
- test:e2e: 5 passed (health + auth)
- openapi:export: OK

## Smoke (ручной)

1. `npm run dev:backend` + `npm run dev:admin`
2. `/login` → `admin@dogerescue.org` / `changeme-dev-only` → `/dashboard`
3. Очистить localStorage → `/dashboard` редирект на `/login`

## Отклонения от PLAN

- Нет

## Следующие шаги

- `08-media` — upload + S3
- `10-dogs` — первый CRUD с `@Roles(ADMIN)`
