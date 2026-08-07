# REPORT — CI/CD + staging

## Что сделано

### CI
- **`.github/workflows/ci.yml`** — jobs: `build`, `lint`, `e2e` (compose dev + migrate + all e2e)
- Корневой **`package.json`**: `"test:e2e"`

### Docker / staging
- **`backend/Dockerfile`**, **`frontend/Dockerfile`**, **`admin/Dockerfile`**
- **`frontend/next.config.ts`**, **`admin/next.config.ts`**: `output: 'standalone'`
- **`infra/docker-compose.staging.yml`** — project `dogrsc-staging`; порты **4001 / 3002 / 3003 / 5433** (не конфликтуют с dev)
- **`infra/.env.staging.example`**, обновлён **`infra/README.md`**
- **`.dockerignore`**

### Сопутствующие правки
- Страницы с fetch к API: **`dynamic = 'force-dynamic'`** (`dogs`, `dogs/[slug]`, `map`, `donate`) — сборка Docker/CI без running backend
- **`backend/src/main.ts`**: CORS для admin staging (`localhost:3003`)

## Проверки

```powershell
# CI (локально)
cd c:\dogrsc\infra
docker compose -f docker-compose.dev.yml up -d --wait
cd ..
npm run db:migrate:deploy -w dogrsc-backend
npm run test:e2e          # 44 passed

# Staging
cd c:\dogrsc\infra
copy .env.staging.example .env.staging
docker compose -f docker-compose.staging.yml up -d --build
# http://localhost:4001/api/v1/health → ok
# http://localhost:3002/en
# http://localhost:3003/login
```

## Не в скоупе

- Push образов в registry, deploy в облако
- GitHub remote (workflow готов после push)
- Автoseed staging (вручную через `DATABASE_URL=...@localhost:5433`)

## Следующий шаг по roadmap

CMS (`ContentTranslation`) или Stage 2.
