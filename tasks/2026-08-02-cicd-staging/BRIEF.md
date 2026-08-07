# BRIEF: CI/CD + staging

Дата: 2026-08-02

Папка задачи: `tasks/2026-08-02-cicd-staging/`

## Формулировка своими словами

Добавить **автоматическую проверку** при push/PR (сборка монорепо + backend e2e с Postgres/MinIO) и **staging-окружение** как Docker Compose со всем стеком (infra + backend + frontend + admin), которое можно поднять на любой машине с Docker — без привязки к конкретному облачному хостингу (он ещё не выбран в DECISIONS).

Remote GitHub сейчас **может отсутствовать** — workflow всё равно кладём в репо, чтобы заработал после `git push`.

## Контекст

- **Монорепо:** `backend/`, `frontend/`, `admin/`, `infra/`; корневой `npm run build`, lint только frontend+admin.
- **Infra dev:** `infra/docker-compose.dev.yml` — Postgres, Redis, MinIO + bucket init (`tasks/04-infra-local/`).
- **E2e:** 10 spec-файлов в `backend/test/`; нужны `DATABASE_URL`, MinIO (`S3_*`), `JWT_SECRET`.
- **Dockerfile'ов нет** — приложения только на хосте через `npm run dev:*`.
- **PROJECT.md:** CI/CD, staging/production — TODO; домен/хостинг отложены.

## Scope

### CI (GitHub Actions)

- **`.github/workflows/ci.yml`** — триггер: `push` / `pull_request` на `main`
- Job **build:** `npm ci`, `npm run build` (все workspaces)
- Job **lint:** `npm run lint` (frontend + admin)
- Job **e2e:** поднять `infra/docker-compose.dev.yml`, `prisma migrate deploy`, `npm run test:e2e -w dogrsc-backend`
- Env для CI: dev-значения из `.env.example` (не prod secrets)
- Корневой **`package.json`**: скрипт `test:e2e` → backend

### Staging (Docker Compose)

- **`backend/Dockerfile`**, **`frontend/Dockerfile`**, **`admin/Dockerfile`** — multi-stage, build из **корня монорепо** (npm workspaces)
- Next.js: `output: 'standalone'` в `next.config.ts` (frontend, admin)
- **`infra/docker-compose.staging.yml`** — postgres, redis, minio, minio-init, backend, frontend, admin; healthcheck / depends_on
- **`infra/.env.staging.example`** — JWT, URLs, `NEXT_PUBLIC_API_URL` для browser (`http://localhost:4000/api/v1`)
- **`infra/README.md`** — секция Staging: `docker compose -f docker-compose.staging.yml up --build`, smoke URLs
- Backend entry: `migrate deploy` + `node dist/main` (или shell wrapper в Dockerfile)

### Не включаем

- Deploy в AWS/GCP/Railway/Vercel (хостинг не выбран)
- Push образов в GHCR/ECR (можно добавить позже)
- Kubernetes, Terraform
- Production secrets management
- Redis в backend runtime (ещё не используется приложением — только в compose для parity)
- Автодеплой staging по webhook

## Критерии успеха

- [ ] `ci.yml` валиден; локально воспроизводимые шаги описаны в README
- [ ] `npm run build` + `npm run test:e2e` проходят с поднятым `docker-compose.dev.yml`
- [ ] `docker compose -f infra/docker-compose.staging.yml up --build` поднимает stack; `GET /api/v1/health` → ok; frontend/admin открываются в браузере
- [ ] `infra/README.md` + `tasks/.../REPORT.md` + DECISIONS
- [ ] PLAN утверждён человеком до реализации

## Открытые вопросы

| Вопрос | Решение (MVP) |
|--------|----------------|
| CI платформа | **GitHub Actions** |
| Staging где живёт | **Любой Docker host** (локально или VPS позже) |
| Seed на staging | **`db:seed` один раз вручную** после первого up (не в CI каждый раз) |
| E2e в CI все 10 файлов | **Да** — полный прогон |
| Remote git | **Не блокер** — workflow в репо |
| Commit | **Только по явному запросу** |

## Чек-лист выхода

- [x] формулировка своими словами есть
- [x] критерии успеха измеримы
- [x] открытые вопросы закрыты
