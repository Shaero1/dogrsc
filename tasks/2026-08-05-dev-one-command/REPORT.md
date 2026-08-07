# REPORT: dev one-command

Дата: 2026-08-05

## Сделано

- Корневой `npm run dev`: `dev:prepare` → `dev:apps` (concurrently).
- `scripts/dev-prepare.mjs` (уже был): env copy, compose `--wait`, migrate deploy, seed-if-empty.
- Скрипты: `dev:prepare`, `dev:apps`, `dev:infra:up`, `dev:infra:down`, `staging:up`, `staging:down`.
- Dev-зависимость `concurrently` в корневом `package.json`.
- Fix: `docker compose --wait` только для postgres/redis/minio (minio-init one-shot ломал `--wait` на все сервисы).
- Документация: `infra/README.md`, `harness/PROJECT.md`, `tasks/00-bootstrap-decisions/REPOS.md`, CI workflow.

## Команды

```powershell
cd c:\dogrsc
npm install
npm run dev              # полный dev-стек
npm run dev:apps         # только приложения (infra уже up)
npm run dev:infra:down   # остановить postgres/redis/minio
npm run staging:up       # full stack в Docker (порты 4001/3002/3003)
```

## Критерии

| Критерий | Статус |
|----------|--------|
| Одна команда поднимает infra + migrate + apps | ✅ |
| Seed только на пустой БД | ✅ |
| `.env` не перезаписывается | ✅ |
| PowerShell-friendly (Node + npm scripts) | ✅ |
| Staging отдельно от dev | ✅ |
