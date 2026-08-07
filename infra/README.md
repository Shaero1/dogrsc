# infra — локальная dev-инфраструктура

Docker Compose для PostgreSQL, Redis и MinIO (S3-совместимое хранилище).

Приложения (`backend/`, `frontend/`, `admin/`) запускаются **на хосте** через `npm run dev` из корня монорепо (или по отдельности через `npm run dev:*`).

## One-command dev (рекомендуется)

Из корня `c:\dogrsc`:

```powershell
npm install
npm run dev
```

Скрипт `scripts/dev-prepare.mjs`:

1. Копирует `.env.example` → `.env` / `.env.local`, если файлов ещё нет
2. `docker compose -f infra/docker-compose.dev.yml up -d` + wait postgres/redis/minio
3. `npm run db:migrate:deploy -w dogrsc-backend`
4. Seed — только если таблица `users` пуста
5. Запускает backend (:4000), frontend (:3000), admin (:3001) через `concurrently`

Логин после seed: `admin@dogerescue.org` / `changeme-dev-only`.

Остановка приложений — `Ctrl+C`. Инфра:

```powershell
npm run dev:infra:down
```

Повторный запуск без пересоздания infra: `npm run dev:apps` (compose и migrate уже применены).

## Prerequisites

- Docker Desktop (проверено: Docker 29+, Compose v2+)
- Порты **5432**, **6379**, **9000**, **9001** свободны на localhost

## Быстрый старт

```powershell
cd c:\dogrsc\infra
copy .env.example .env
docker compose -f docker-compose.dev.yml up -d
docker compose -f docker-compose.dev.yml ps
```

Остановка (данные в volumes сохраняются):

```powershell
docker compose -f docker-compose.dev.yml down
```

**Внимание:** `docker compose down -v` удаляет volumes и все данные БД/MinIO. Использовать только по явному решению.

## Сервисы

| Сервис | Образ | Host port | Назначение |
|--------|-------|-----------|------------|
| postgres | postgres:15-alpine | 5432 | БД `dogrsc`, user/password `dogrsc` |
| redis | redis:7-alpine | 6379 | Кэш, очереди |
| minio | quay.io/minio/minio | 9000 (API), 9001 (console) | Файлы / media |
| minio-init | quay.io/minio/mc | — | Создаёт bucket `dogrsc-media` |

> **Примечание:** образы MinIO тянутся с `quay.io` (Docker Hub может отдавать EOF). Postgres — `15-alpine` (локально доступен; совместим с `DATABASE_URL`).

## Проверка

```powershell
# Postgres
docker compose -f docker-compose.dev.yml exec postgres psql -U dogrsc -d dogrsc -c "SELECT 1"

# Redis
docker compose -f docker-compose.dev.yml exec redis redis-cli ping

# MinIO — открыть в браузере
# http://localhost:9001  (login из infra/.env)
```

Строка подключения backend (см. `../backend/.env.example`):

```text
DATABASE_URL=postgresql://dogrsc:dogrsc@localhost:5432/dogrsc
REDIS_URL=redis://localhost:6379
S3_ENDPOINT=http://localhost:9000
```

## Конфликт портов

Если 5432 или 6379 заняты — измените mapping в `docker-compose.dev.yml` (например `5433:5432`) и обновите `../backend/.env` / `.env.example` соответственно.

## Связанные задачи

- `tasks/04-infra-local/` — dev compose (Postgres, Redis, MinIO)
- `tasks/2026-08-02-cicd-staging/` — CI workflow + staging compose

## CI (GitHub Actions)

Workflow: `.github/workflows/ci.yml` (on push/PR to `main`):

| Job | Steps |
|-----|--------|
| **build** | `npm ci`, `npm run build` (backend + frontend + admin) |
| **lint** | `npm run lint` |
| **e2e** | compose up + wait postgres/redis/minio, `db:migrate:deploy`, `npm run test:e2e` |

Локальное воспроизведение e2e:

```powershell
cd c:\dogrsc\infra
docker compose -f docker-compose.dev.yml up -d
docker compose -f docker-compose.dev.yml up -d --wait postgres redis minio
cd ..
npm run db:migrate:deploy -w dogrsc-backend
npm run test:e2e
```

Переменные окружения для e2e — см. `.github/workflows/ci.yml` или `backend/.env.example`.

## Staging (full stack in Docker)

Infra + backend + frontend + admin в контейнерах. Облачный deploy не входит в scope — compose можно запустить на любой машине с Docker.

### Prerequisites

- Docker Compose v2+
- Порты **4001**, **3002**, **3003** (и **5433** для optional seed с хоста) свободны
- `infra/.env.staging` из `.env.staging.example` (не коммитить)

### Quick start

```powershell
cd c:\dogrsc\infra
copy .env.staging.example .env.staging
docker compose -f docker-compose.staging.yml up --build -d
docker compose -f docker-compose.staging.yml ps
```

Backend при старте выполняет `prisma migrate deploy`.

Frontend использует **`API_URL`** для SSR внутри Docker (`http://backend:4000/api/v1`) и **`NEXT_PUBLIC_API_URL`** для браузера (`http://localhost:4001/api/v1`). После изменения `frontend/lib/*` пересоберите образ: `docker compose ... up --build -d frontend`.

### Smoke

| URL | Expected |
|-----|----------|
| http://localhost:4001/api/v1/health | `{ status: 'ok', database: 'ok' }` |
| http://localhost:3002/en | Public frontend |
| http://localhost:3003/login | Admin login |

### Demo data (optional)

Postgres staging доступен на хосте как **localhost:5433**:

```powershell
cd c:\dogrsc
$env:DATABASE_URL = "postgresql://dogrsc:dogrsc@localhost:5433/dogrsc"
npm run db:seed -w dogrsc-backend
```

### Stop

```powershell
cd c:\dogrsc\infra
docker compose -f docker-compose.staging.yml down
```

`down -v` удаляет staging volumes — только по явному решению.
