# Схема репозиториев

Дата: 2026-07-31 (обновлено: монорепо)

## Текущая структура — монорепо `dogrsc`

```
dogrsc/
├── harness/          # PROJECT.md, RULES, DECISIONS, LESSONS
├── tasks/            # BRIEF / PLAN / REPORT
├── backend/          # NestJS API, OpenAPI, миграции
├── frontend/         # Next.js: публичный сайт, i18n en/th/ru
├── admin/            # Next.js: админ-панель, UI en
├── infra/            # Docker Compose, CI/CD, deploy
├── package.json      # npm workspaces
└── .gitignore
```

Один git-репозиторий в корне. Remote на GitHub **не создаём** до отдельного решения.

## Роли каталогов

| Каталог | Назначение | Что не хранить |
|---------|------------|----------------|
| **harness/, tasks/** | Координация, спека, задачи | Прикладной код |
| **backend/** | NestJS, PostgreSQL migrations, OpenAPI | UI, статика сайта |
| **frontend/** | Next.js: публичный сайт, i18n en/th/ru | Admin-экраны, секреты backend |
| **admin/** | Next.js: админ-панель, UI en | Публичные страницы |
| **infra/** | docker-compose, Dockerfile, CI, deploy | Исходники приложений |

## Связи

```
dogrsc (monorepo)
    │
    ├── backend/ ── OpenAPI ──► frontend/
    │                  └──────► admin/
    │
    └── infra/ ── compose/deploy ──► backend, frontend, admin
```

## Контракт API

1. Backend экспортирует `openapi.yaml` (файл в `backend/` + артефакт CI).
2. Frontend и admin генерируют типы/клиент при сборке (openapi-typescript, orval и т.п.).
3. **Breaking change:** bump версии API в OpenAPI → обновить оба клиента в одном релизе.

Отдельный каталог `contracts/` **не используем** на старте.

## Локальная разработка

Из корня монорепо:

```powershell
npm install                  # все workspaces
npm run dev                  # infra + migrate + seed-if-empty + все три приложения
npm run build                # все три приложения
```

По отдельности: `npm run dev:backend` (:4000), `dev:frontend` (:3000), `dev:admin` (:3001).

Staging (full stack в Docker): `npm run staging:up` из корня.

- Postgres, Redis, MinIO — в контейнерах (`infra/docker-compose.dev.yml`)
- Backend, frontend, admin — на хосте с hot-reload (`npm run dev`)

## История

2026-07-31 (утро): отдельные репо `dogrsc-*` на `c:\` — отменено в пользу монорепо в тот же день.
