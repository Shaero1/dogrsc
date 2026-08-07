# PLAN: backend-scaffold

Дата: 2026-07-31

## Шаги

1. **Создать NestJS-проект** в `c:\dogrsc-backend` через `@nestjs/cli` (strict, npm, без git в CLI).
2. **Глобальный префикс** `api/v1`; порт из `PORT` (default 4000).
3. **Модуль `HealthModule`** — `GET /api/v1/health` → `{ status, timestamp, version }`.
4. **Swagger** — `@nestjs/swagger`, UI на `/api/docs`, title «Doge Rescue API», version 1.0.
5. **Скрипт `npm run openapi:export`** — выгрузка `openapi.yaml` в корень репо.
6. **Config** — `@nestjs/config`, `.env.example`, `.gitignore` для `.env`.
7. **README.md** — prerequisites, install, dev, health URL, openapi export.
8. **`git init`** в `dogrsc-backend`.
9. **Проверка** — `npm run build`, запуск, curl health.
10. **REPORT.md** в `tasks/01-backend-scaffold/`.

## Альтернативы

- **Scaffold внутри `dogrsc/backend/`:** отвергнута, потому что фаза 0 зафиксировала отдельный репо `dogrsc-backend`.
- **Fastify вместо Express:** отвергнута, потому что default Nest + Express проще для команды и документации; переключение не даёт выгоды на этапе health-only.
- **Подключить Postgres/Prisma сразу:** отвергнута, потому что widens scope; infra и schema — отдельные задачи (`04-infra-local`, `02-database-schema`).

## Риски

- 🔴 **Путь вне workspace Cursor** (`c:\dogrsc-backend`) → создаём явно; координация через tasks в `dogrsc`.
- 🟡 **Nest CLI интерактив** → флаги `--skip-git`, package-manager npm.
- 🟢 **Версии зависимостей** → lockfile в репо backend.

## Бюджет

- Файлов: ~25–35 (генерация Nest + правки)
- Время: ~30–45 мин
- Правило: превысил → стоп и пересмотр

## Чек-лист выхода

- [x] шаги конкретны (сделан/не сделан)
- [x] есть отвергнутая альтернатива с содержательной причиной
- [x] красных рисков нет (или решены)
- [x] бюджет назначен
