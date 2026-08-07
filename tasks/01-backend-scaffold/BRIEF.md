# BRIEF: backend-scaffold

Дата: 2026-07-31

## Формулировка своими словами

Создать минимальный каркас API-сервера Doge Rescue в **локальном** репозитории `dogrsc-backend` (рядом с `dogrsc`, без GitHub): NestJS, префикс `/api/v1`, health-check, заготовка OpenAPI/Swagger, конфиг через env. Без БД-миграций, без бизнес-модулей — только основа для следующих задач.

## Контекст

- Решения фазы 0: NestJS, REST `/api/v1`, OpenAPI в backend (`harness/DECISIONS.md`, `REPOS.md`).
- Координация и tasks остаются в `c:\dogrsc`.
- Code-репо — отдельная папка `c:\dogrsc-backend` (локальный `git init`, без push).
- Node v22, Nest CLI 11 доступны.

## Критерии успеха

- [ ] Каталог `c:\dogrsc-backend` с NestJS-проектом, `npm run build` проходит
- [ ] `GET /api/v1/health` возвращает JSON `{ status: "ok", ... }`
- [ ] Swagger UI доступен (например `/api/docs`), в spec есть health и заглушка info
- [ ] Файл `openapi.yaml` генерируется или экспортируется скриптом в репо
- [ ] `.env.example` с PORT, DATABASE_URL, REDIS_URL (без секретов)
- [ ] README: установка, запуск dev, проверка health
- [ ] `git init` в `dogrsc-backend` (без commit, если не попросят)

## Открытые вопросы

| Вопрос | Статус |
|--------|--------|
| ORM (Prisma vs TypeORM)? | **Отложено** до задачи schema; scaffold без подключения к Postgres |
| Порт по умолчанию | **4000** (как в REPOS.md) |
| Commit в backend-репо? | **Нет** без явного запроса |

## Чек-лист выхода

- [x] формулировка своими словами есть
- [x] критерии успеха измеримы
- [x] открытые вопросы закрыты или отложены явно
