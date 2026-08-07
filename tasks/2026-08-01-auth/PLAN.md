# PLAN: auth

Дата: 2026-08-01

Папка задачи: `tasks/2026-08-01-auth/`

## Шаги

### Backend

1. **Prerequisite** — Postgres up, `backend/.env` с `DATABASE_URL`; после seed (шаг 4) — admin user в БД.

2. **Зависимости** — в `dogrsc-backend`:
   - `@nestjs/jwt`, `@nestjs/passport`, `passport`, `passport-jwt`, `bcrypt`
   - dev: `@types/passport-jwt`, `@types/bcrypt`

3. **Env** — дополнить `backend/.env.example`:
   ```text
   JWT_SECRET=change-me-in-production
   JWT_EXPIRES_IN=8h
   ADMIN_EMAIL=admin@dogerescue.org
   ADMIN_PASSWORD=changeme-dev-only
   ```

4. **Seed admin** — `backend/prisma/seed.ts`:
   - upsert user `ADMIN_EMAIL`, role `ADMIN`, bcrypt hash `ADMIN_PASSWORD`
   - `package.json`: `"db:seed": "prisma db seed"` + секция `"prisma": { "seed": "ts-node ..." }` или `tsx prisma/seed.ts`
   - Запуск: `npm run db:seed -w dogrsc-backend` (идемпотентный upsert)

5. **Auth module** — `backend/src/auth/`:
   - `dto/login.dto.ts` — email, password (class-validator)
   - `dto/auth-user.dto.ts` — id, email, role (response)
   - `auth.service.ts` — `validateUser`, `login`, `getMe`
   - `auth.controller.ts`:
     - `POST /auth/login` → `@Public()`
     - `GET /auth/me` → `@Roles(ADMIN, STAFF)`
   - `auth.module.ts` — imports JwtModule.registerAsync, PassportModule

6. **JWT strategy + guards** — `backend/src/auth/`:
   - `jwt.strategy.ts` — extract Bearer, payload `{ sub, email, role }`
   - `jwt-auth.guard.ts` — extends AuthGuard('jwt')
   - `roles.guard.ts` — проверка `@Roles()` metadata
   - Декораторы: `public.decorator.ts`, `roles.decorator.ts`
   - **Global guard:** `APP_GUARD` → `JwtAuthGuard` + `RolesGuard` (или Roles внутри Jwt flow); `@Public()` на health + login

7. **CORS** — `main.ts`: `enableCors({ origin: ['http://localhost:3001'] })` для admin dev.

8. **AppModule** — import `AuthModule`; зарегистрировать global guards.

9. **OpenAPI** — Swagger decorators на auth DTO; `npm run openapi:export`.

10. **E2E** — `test/auth.e2e-spec.ts` (или расширить existing):
    - seed/admin credentials из env test defaults
    - POST login 200 + token
    - POST login wrong password 401
    - GET me with Bearer 200
    - GET me without token 401

### Admin

11. **Env** — `admin/.env.example`:
    ```text
    NEXT_PUBLIC_API_URL=http://localhost:4000
    ```

12. **Auth helpers** — `admin/lib/auth.ts`:
    - `TOKEN_KEY = 'dogrsc_admin_token'`
    - `getToken`, `setToken`, `clearToken`, `isAuthenticated` (localStorage; guard `typeof window`)

13. **API client** — `admin/lib/api.ts`:
    - `login(email, password)` → POST `${API_URL}/api/v1/auth/login`
    - `fetchMe(token)` → GET `/api/v1/auth/me` with Authorization header
    - Обработка ошибок (401 → throw)

14. **`/login` page** — `admin/app/(auth)/login/page.tsx`:
    - enabled submit, loading/error state
    - on success: `setToken`, `router.push('/dashboard')`
    - Dev bypass link — **только** если `process.env.NODE_ENV === 'development'`

15. **Auth gate** — `admin/components/admin/AuthGate.tsx` (client):
    - useEffect: нет token → `redirect('/login')`
    - optional: validate token via `fetchMe` on mount
    - Wrap children in `(admin)/layout.tsx`

16. **Logout (minimal)** — ссылка в `AdminSidebar` или header: `clearToken()` + redirect `/login` (опционально, ~5 строк — включить для UX).

17. **README** — `backend/README.md` (auth, seed, JWT env); `admin/README.md` (login flow, API_URL).

### Проверка

18. **Manual smoke:**
    ```powershell
    cd c:\dogrsc\infra && docker compose -f docker-compose.dev.yml up -d
    cd c:\dogrsc\backend && npm run db:seed
    npm run dev:backend   # :4000
    npm run dev:admin     # :3001
    ```
    - Login admin@dogerescue.org / changeme-dev-only → dashboard
    - `/dashboard` без token → redirect login

19. **`npm run build`** из корня монорепо.

20. **`npm run test:e2e -w dogrsc-backend`**

21. **`tasks/2026-08-01-auth/REPORT.md`**

22. **DECISIONS** — черновик: JWT access 8h, localStorage admin, bcrypt, seed via prisma.

## Альтернативы

- **Session + httpOnly cookie:** отвергнута — cross-origin admin:3001 ↔ api:4000; нужен proxy; JWT + localStorage проще на MVP (BRIEF).
- **Passport local strategy для login:** отвергнута — login можно сделать в AuthService без LocalAuthGuard; меньше wiring при одном endpoint.
- **Next.js middleware для auth:** отвергнута — middleware не видит localStorage; client AuthGate достаточен.
- **Регистрация admin через API:** отвергнута — widens scope; только seed на MVP.

## Риски

- 🔴 **Seed не выполнен** → ДО smoke: `npm run db:seed`; login 401.
- 🔴 **JWT_SECRET дефолтный** → `.env.example` с предупреждением; prod — отдельное решение.
- 🟡 **CORS** → включить до проверки admin login.
- 🟡 **USER role login** → AuthService отклоняет role USER с 403 на login (только ADMIN/STAFF).
- 🟡 **e2e без seed** → e2e beforeAll: seed или использовать фиксированного user из test env.
- 🟢 **bcrypt rounds** → 10 (default acceptable).

## Бюджет

- Файлов: ~25–35
- Время: ~3–5 часов
- Правило: превысил → стоп и пересмотр

## Чек-лист выхода

- [x] шаги конкретны (сделан/не сделан)
- [x] есть отвергнутая альтернатива с содержательной причиной
- [x] красных рисков сняты процедурой (seed + CORS)
- [x] бюджет назначен

## Критерии BRIEF (для REPORT)

- [ ] Admin user в БД (seed)
- [ ] POST login 200/401
- [ ] GET me 200/401
- [ ] Guards (@Roles на me)
- [ ] Admin login → dashboard; без token — redirect
- [ ] Dev bypass только development или убран
- [ ] env examples backend + admin
- [ ] build + e2e OK
