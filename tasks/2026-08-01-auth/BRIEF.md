# BRIEF: auth

Дата: 2026-08-01

Папка задачи: `tasks/2026-08-01-auth/` (создана через `python harness/new_task.py "auth"`).

## Формулировка своими словами

Сделать **реальную аутентификацию** для admin: backend принимает email/password, выдаёт JWT; admin `/login` вызывает API и пускает на `/dashboard` только с валидным токеном. Таблица `users` и роли (`ADMIN`, `STAFF`, `USER`) уже есть — нужны модуль auth, guards и связка admin ↔ API.

Без регистрации публики, без 2FA, без refresh tokens — только login + `me` + защита admin API на backend.

## Контекст

- **Schema готова** (`tasks/2026-08-01-database-schema/`): `User` с `email`, `passwordHash`, `role`.
- **Admin** (`admin/`): `/login` — форма-заглушка, submit disabled, dev-link «Continue to dashboard».
- **Backend** (`backend/`): NestJS, Prisma, health; auth-модуля нет.
- **Infra:** Postgres up, `DATABASE_URL` в `.env`.
- **Спека:** роли раздел 19.12; admin UI на en (фаза 0).
- Следующие задачи (dogs CRUD, media) потребуют `@Roles(ADMIN)` на admin endpoints.

## Scope

### Backend (`backend/`)

- `AuthModule`: login, JWT, guards
- `POST /api/v1/auth/login` — `{ email, password }` → `{ accessToken, user: { id, email, role } }`
- `GET /api/v1/auth/me` — Bearer token → текущий user
- Хеш паролей: **bcrypt**
- JWT: **access token** (срок — зафиксировать в PLAN, предложение 8h dev / 1d prod)
- `JwtAuthGuard`, `RolesGuard`; декораторы `@Public()`, `@Roles(...)`
- Env: `JWT_SECRET`, `JWT_EXPIRES_IN` в `.env.example`
- **Seed одного admin** для dev (см. открытые вопросы)
- OpenAPI: новые endpoints + export

### Admin (`admin/`)

- `/login`: submit → `POST` на backend, сохранить token, redirect `/dashboard`
- Убрать или **скрыть за `NODE_ENV=development`** ссылку «Continue to dashboard (dev only)»
- Минимальная client-side проверка: нет token → redirect на `/login` (layout или middleware — в PLAN)
- `.env.local`: `NEXT_PUBLIC_API_URL=http://localhost:4000`

### Не включаем

- Регистрация, forgot password, email verify
- Refresh tokens, 2FA
- Auth на публичном frontend (`/account` — этап 2)
- OAuth / social login
- Audit log при login (можно добавить позже в audit task)
- Rate limiting / brute-force (отложено)

## Критерии успеха

- [ ] Admin user существует в БД (seed/script), пароль захеширован bcrypt
- [ ] `POST /api/v1/auth/login` — 200 + token при верных credentials; 401 при неверных
- [ ] `GET /api/v1/auth/me` — 200 с user при valid Bearer; 401 без/с invalid token
- [ ] Хотя бы один **защищённый** admin-only endpoint (может быть `GET /api/v1/auth/me` с `@Roles(ADMIN, STAFF)`) — guards работают
- [ ] Admin `/login` — успешный вход ведёт на `/dashboard`; без token dashboard недоступен
- [ ] Dev bypass на login убран или только в development
- [ ] `JWT_SECRET` и др. в `backend/.env.example`; `NEXT_PUBLIC_API_URL` в `admin/.env.example`
- [ ] `npm run build` монорепо проходит
- [ ] `npm run test:e2e` backend — login/me (или новый e2e)
- [ ] PLAN утверждён человеком до реализации

## Открытые вопросы

| Вопрос | Статус |
|--------|--------|
| JWT vs session | **JWT** — stateless API, проще для admin SPA и mobile позже |
| Где хранить token в admin | **localStorage** на MVP (предложение); httpOnly cookie — этап 2 (нужен proxy/CORS credentials) |
| Seed admin | **Prisma seed script** или `npm run db:seed` — один `ADMIN` из env `ADMIN_EMAIL` / `ADMIN_PASSWORD` (dev defaults в `.env.example`, не секрет prod) |
| Кто может в admin | **ADMIN и STAFF** — login; `USER` role — только API user endpoints позже |
| JWT expiry | **Предложение:** `8h` dev (`JWT_EXPIRES_IN=8h`) |
| Commit после задачи? | **Только по явному запросу** |

## Чек-лист выхода

- [x] формулировка своими словами есть
- [x] критерии успеха измеримы
- [x] открытые вопросы закрыты или отложены явно
