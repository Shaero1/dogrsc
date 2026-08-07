# BRIEF: infra-local

Дата: 2026-08-01

## Формулировка своими словами

Поднять **локальную dev-инфраструктуру** для Doge Rescue в каталоге `infra/` монорепо: Docker Compose с PostgreSQL, Redis и MinIO (S3-совместимое хранилище). Одна команда — сервисы доступны на localhost; backend в задаче 05 сможет подключиться к БД по уже заданному `DATABASE_URL` из `backend/.env.example`.

Задача **не** про production deploy, **не** про запуск backend/frontend в контейнерах и **не** про миграции или ORM — только инфра на машине разработчика.

## Контекст

- Монорепо `c:\dogrsc`: `backend/`, `frontend/`, `admin/`, `infra/` (`harness/DECISIONS.md`, `REPOS.md`).
- Scaffold завершён (tasks 01–03): backend health на `:4000`, frontend `:3000`, admin `:3001`.
- `backend/.env.example` уже содержит:
  - `DATABASE_URL=postgresql://dogrsc:dogrsc@localhost:5432/dogrsc`
  - `REDIS_URL=redis://localhost:6379`
  — но Postgres/Redis/MinIO **не запущены**, `infra/` — только README-заглушка.
- Следующая задача после infra — `tasks/2026-08-01-database-schema/` (ORM, миграции); без compose schema некуда применять.
- Стек зафиксирован: PostgreSQL, Redis, S3-совместимое хранилище; prod-рекомендация Cloudflare R2, для dev — MinIO (`DECISIONS.md`, `I18N.md` не затрагивает infra).
- Локальная разработка по `REPOS.md`: frontend/admin на хосте через `npm run dev:*`, backend — тоже на хосте; в контейнерах только Postgres, Redis, MinIO.
- REPORT задачи `03-admin-scaffold` явно указывает `04-infra-local` как следующий шаг.

## Критерии успеха

- [ ] Файл `infra/docker-compose.dev.yml` поднимает Postgres, Redis, MinIO без ручной настройки после `docker compose up -d`
- [ ] Postgres доступен на `localhost:5432`, БД/пользователь совместимы с `DATABASE_URL` из `backend/.env.example` (или документировано отличие)
- [ ] Redis отвечает на `localhost:6379` (`PING` → `PONG`)
- [ ] MinIO доступен (API + console), bucket для media описан или создаётся автоматически
- [ ] `infra/.env.example` — переменные compose (dev-only пароли, без секретов prod)
- [ ] `infra/README.md` — prerequisites (Docker), команды up/down, порты, как проверить каждый сервис
- [ ] `backend/.env.example` дополнен переменными S3/MinIO (`S3_ENDPOINT`, ключи, bucket) — для задач media позже
- [ ] `npm run build` из корня монорепо по-прежнему проходит (infra не ломает workspaces)
- [ ] PLAN задачи утверждён человеком до реализации

## Открытые вопросы

| Вопрос | Статус |
|--------|--------|
| Docker Desktop установлен на машине разработчика? | **Проверить ДО PLAN/реализации** (`docker --version`, `docker compose version`) |
| Порт 5432/6379 занят другим софтом? | **Решить в PLAN:** альтернативные host-порты + note в README и `.env.example` |
| Версии образов (Postgres 16, Redis 7)? | **Предложение:** Postgres 16-alpine, Redis 7-alpine, MinIO latest stable — зафиксировать в PLAN |
| Имена volume для персистентности данных? | **Предложение:** named volumes в compose; `docker compose down -v` — только по явному запросу (🔴 удаление данных) |
| Cloudflare R2 вместо MinIO локально? | **Отложено** до deploy; dev = MinIO |
| Backend/frontend в Docker на этом шаге? | **Нет** — widens scope; приложения на хосте |
| Commit после задачи? | **Только по явному запросу** |
| Добавить `infra` в npm workspaces? | **Нет** на этом шаге — infra без Node-пакета |

## Чек-лист выхода

- [x] формулировка своими словами есть
- [x] критерии успеха измеримы
- [x] открытые вопросы закрыты или отложены явно
