# PLAN: CI/CD + staging

Дата: 2026-08-02

Папка задачи: `tasks/2026-08-02-cicd-staging/`

## Шаги

### CI

1. **Корневой `package.json`** — `"test:e2e": "npm run test:e2e -w dogrsc-backend"`.
2. **`.github/workflows/ci.yml`**:
   - job `build`: checkout, Node 22, `npm ci`, `npm run build`
   - job `lint`: `npm ci`, `npm run lint`
   - job `e2e`: `npm ci`, `docker compose -f infra/docker-compose.dev.yml up -d --wait`, env для backend из example, `npm run db:migrate:deploy -w dogrsc-backend`, `npm run test:e2e -w dogrsc-backend`, compose down
3. **`infra/docker-compose.dev.yml`** — добавить `profiles` не нужно; проверить `--wait` совместим с healthchecks (Compose v2.29+).

### Docker images

4. **`backend/Dockerfile`** — deps from monorepo root, `prisma generate`, `nest build`, prod stage `node dist/main`; `CMD` через shell: migrate deploy && start.
5. **`frontend/next.config.ts`**, **`admin/next.config.ts`** — `output: 'standalone'`.
6. **`frontend/Dockerfile`**, **`admin/Dockerfile`** — build args `NEXT_PUBLIC_API_URL`, standalone copy, port 3000.

### Staging compose

7. **`infra/docker-compose.staging.yml`** — services: postgres, redis, minio, minio-init (reuse patterns from dev), backend (build), frontend (build), admin (build); network; published ports 4000, 3000, 3001.
8. **`infra/.env.staging.example`** — staging env template; backend `DATABASE_URL` host `postgres`, S3 `http://minio:9000`; public API URL for Next builds.
9. **`infra/README.md`** — CI overview + Staging quickstart + smoke checklist.

### Verify & close

10. Локально: dev compose up → `npm run test:e2e`; staging compose up --build → health + pages.
11. **`tasks/2026-08-02-cicd-staging/REPORT.md`**, **`harness/DECISIONS.md`**.

## Альтернативы

- **Только CI без staging compose:** отвергнута — roadmap явно «CI/CD + staging»; compose даёт проверяемое окружение до выбора облака.
- **Staging только документация (npm на VPS):** отвергнута — drift с prod; Docker повторяемее.
- **GitLab CI / Jenkins:** отвергнута — GitHub Actions стандарт для gh CLI и будущего remote; меньше конфигурации.

## Риски

- 🔴 **E2e в CI без MinIO** → e2e job поднимает полный `docker-compose.dev.yml` (включая minio-init).
- 🟡 **Next standalone + next-intl** → проверить build в Dockerfile; при ошибке — fix в frontend Dockerfile.
- 🟡 **Prisma generate EPERM на Windows dev** → CI на Linux; локально README напоминает остановить dev backend.
- 🟢 **Нет remote** → workflow лежит в репо до push.

## Бюджет

- Файлов: ~12
- Время: ~3–4 ч
- Правило: превысил → стоп и пересмотр

## Чек-лист выхода

- [x] шаги конкретны (сделан/не сделан)
- [x] есть отвергнутая альтернатива с содержательной причиной
- [x] красных рисков сняты (compose + minio в e2e)
- [x] бюджет назначен
