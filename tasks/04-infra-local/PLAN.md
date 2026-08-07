# PLAN: infra-local

Дата: 2026-08-01

## Шаги

1. **`infra/docker-compose.dev.yml`** — три сервиса + init для MinIO bucket:
   - **postgres** — образ `postgres:16-alpine`, порт `5432:5432`, env: `POSTGRES_USER=dogrsc`, `POSTGRES_PASSWORD=dogrsc`, `POSTGRES_DB=dogrsc`, volume `dogrsc_pg_data`, healthcheck `pg_isready`
   - **redis** — образ `redis:7-alpine`, порт `6379:6379`, volume `dogrsc_redis_data`, healthcheck `redis-cli ping`
   - **minio** — образ `minio/minio`, command `server /data --console-address ":9001"`, порты `9000:9000`, `9001:9001`, env из `.env`, volume `dogrsc_minio_data`, healthcheck
   - **minio-init** — одноразовый `minio/mc`: создать bucket `dogrsc-media`, `depends_on` minio (healthy)
   - Сеть: default compose network; сервисы доступны с хоста как `localhost`

2. **`infra/.env.example`** — dev-only переменные для compose:
   - `MINIO_ROOT_USER`, `MINIO_ROOT_PASSWORD`
   - Комментарий: скопировать в `infra/.env` (файл в `.gitignore` корня или `infra/.gitignore`)

3. **`infra/.gitignore`** — игнорировать `infra/.env`

4. **Обновить `infra/README.md`** — заменить заглушку:
   - Prerequisites: Docker Desktop (проверено: Docker 29.6.2, Compose v5.3.1)
   - Команды:
     ```powershell
     cd c:\dogrsc\infra
     copy .env.example .env
     docker compose -f docker-compose.dev.yml up -d
     docker compose -f docker-compose.dev.yml ps
     docker compose -f docker-compose.dev.yml down
     ```
   - Таблица портов: Postgres 5432, Redis 6379, MinIO API 9000, Console 9001
   - Проверка: `psql`/Docker exec, `redis-cli ping`, MinIO console URL
   - 🔴 `docker compose down -v` — удаляет volumes; только по явному запросу

5. **Дополнить `backend/.env.example`** — блок S3/MinIO (значения согласованы с `infra/.env.example`):
   - `S3_ENDPOINT=http://localhost:9000`
   - `S3_ACCESS_KEY`, `S3_SECRET_KEY`
   - `S3_BUCKET=dogrsc-media`
   - `S3_REGION=us-east-1` (для SDK; MinIO dev)

6. **Проверка compose** — из `infra/`:
   - `docker compose -f docker-compose.dev.yml up -d` — exit 0, все сервисы healthy
   - Postgres: подключение строкой из `backend/.env.example` (через `docker compose exec postgres psql -U dogrsc -d dogrsc -c 'SELECT 1'`)
   - Redis: `docker compose exec redis redis-cli ping` → `PONG`
   - MinIO: bucket `dogrsc-media` существует (через mc или console)

7. **Регрессия монорепо** — из корня: `npm run build` — без ошибок

8. **`tasks/04-infra-local/REPORT.md`** — таблица шагов, команды проверки, критерии BRIEF ✅/❌

## Альтернативы

- **Native install Postgres/Redis на Windows:** отвергнута, потому что хуже воспроизводится между машинами и дальше от prod (Docker); добавляет ручную настройку вместо одной команды compose.
- **Podman Compose:** отвергнута, потому что Docker Desktop уже установлен и проверен; второй runtime добавляет документацию без выгоды сейчас.
- **Backend/frontend в compose на этом шаге:** отвергнута, потому что widens scope; hot-reload на хосте быстрее для dev (`REPOS.md`).
- **Cloudflare R2 вместо MinIO для dev:** отвергнута, потому что требует аккаунт/секреты и сеть; MinIO локально достаточен до задачи deploy.
- **Альтернативные host-порты (5433, 6380):** отвергнута по умолчанию, потому что `backend/.env.example` уже на 5432/6379; применять только если порты заняты (см. риски).

## Риски

- 🔴 **Docker не установлен** → **снят:** Docker 29.6.2, Compose v5.3.1 доступны на машине разработчика.
- 🟡 **Порт 5432 или 6379 занят** → ДО `up`: `netstat`/ошибка bind; при конфликте — сменить host-порт в compose, обновить `backend/.env.example` и README с явной пометкой.
- 🟡 **MinIO bucket не создаётся до старта backend** → `minio-init` с `depends_on: minio (healthy)`; проверить в шаге 6.
- 🟡 **WSL2 / firewall блокирует localhost** → следим: healthchecks в compose; при сбое — лог `docker compose logs`.
- 🟢 **Windows paths в compose volumes** → named volumes (не bind-mount исходников), проблем с путями нет.

## Бюджет

- Файлов: ~6–8 (`docker-compose.dev.yml`, `.env.example`, `.gitignore`, README, правка `backend/.env.example`, опционально init-скрипт, REPORT)
- Время: ~1–2 часа
- Правило: превысил → стоп и пересмотр, не молчаливое продолжение

## Чек-лист выхода

- [x] шаги конкретны (сделан/не сделан)
- [x] есть отвергнутая альтернатива с содержательной причиной
- [x] красных рисков нет (Docker проверен)
- [x] бюджет назначен

## Критерии BRIEF (для REPORT)

- [ ] `docker-compose.dev.yml` поднимает Postgres, Redis, MinIO
- [ ] Postgres совместим с `DATABASE_URL` из `backend/.env.example`
- [ ] Redis `PONG` на `:6379`
- [ ] MinIO API + console; bucket `dogrsc-media`
- [ ] `infra/.env.example` + README
- [ ] `backend/.env.example` — S3/MinIO
- [ ] `npm run build` OK
