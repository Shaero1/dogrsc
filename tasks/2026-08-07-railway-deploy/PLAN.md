# PLAN: Deploy dogrsc на Railway Hobby ($5)

Дата: 2026-08-07  
Обновлено под: **Railway Hobby** (оплачен)  
Утверждено: 2026-08-07 — GitHub вместе, Turnstile test keys, Maps нужна, Railway domains

---

## Утверждённые решения (2026-08-07)

| Вопрос | Решение |
|--------|---------|
| GitHub | Private repo, **создаём вместе** с первым push |
| Turnstile | Cloudflare аккаунта **нет** → **test keys** на deploy (см. ниже) |
| Google Maps | **Нужна** — ключ Google Cloud, build-time env |
| Domain | Пока **`*.up.railway.app`** |

---

## 0. Обзор

### Стек на Railway

| # | Ресурс | Тип | RAM (рекомендация) |
|---|--------|-----|---------------------|
| 1 | **postgres** | PostgreSQL plugin | managed |
| 2 | **bucket** | Railway Bucket | pay per GB |
| 3 | **backend** | Docker `backend/Dockerfile` | 512 MB – 1 GB |
| 4 | **frontend** | Docker `frontend/Dockerfile` | 512 MB – 1 GB |
| 5 | **admin** | Docker `admin/Dockerfile` | 512 MB |

Hobby даёт **$5 usage credits/мес** — для 3 Node-сервисов + Postgres этого обычно хватает при умеренном трафике. Bucket: ~$0.015/GB-мес.

### Схема

```
GitHub (private) ──push──► Railway Project
                              │
         ┌────────────────────┼────────────────────┐
         ▼                    ▼                    ▼
    frontend              admin               backend
    :3000                 :3000               :4000
         │                    │                    │
         └────────────────────┴──────────► PostgreSQL
                                           Railway Bucket
```

### Публичные URL (после деплоя)

```
https://<backend>.up.railway.app/api/v1/health
https://<frontend>.up.railway.app/en
https://<admin>.up.railway.app/login
```

---

## Фаза 0 — Подготовка (до Railway)

### 0.1 GitHub private repo (делаем вместе)

1. Вы: GitHub → **New repository**
   - Name: `dogrsc` (или ваше)
   - Visibility: **Private**
   - **Без** README / .gitignore (код уже локально)
2. Агент/вы: первый commit + push:
   ```powershell
   cd c:\dogrsc
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/<username>/dogrsc.git
   git push -u origin main
   ```
3. **Не коммитить:** `.env`, `.env.local`, `.env.staging`, `tmp-*`, PDF в корне
4. Проверить `git status` перед push — секретов быть не должно

### 0.2 Кодовые патчи (обязательны перед prod)

| # | Файл | Что сделать |
|---|------|-------------|
| A | `backend/src/main.ts` | CORS из env `CORS_ORIGINS` (comma-separated URLs) + localhost для dev |
| B | `backend/src/media/s3.service.ts` | `S3_FORCE_PATH_STYLE` env: `true` MinIO, `false` Railway Bucket |
| C | `backend/.env.example` | документировать новые vars |
| D | (optional) `railway.toml` | 3 service definitions для monorepo |

**Без A** — admin login упадёт на CORS.  
**Без B** — upload фото не заработает на Railway Bucket.

### 0.3 Секреты (сгенерировать заранее, хранить в password manager)

```
JWT_SECRET=<random 48+ chars>
ADMIN_EMAIL=admin@dogerescue.org
ADMIN_PASSWORD=<strong, not changeme-dev-only>
STAFF_EMAIL=staff@dogerescue.org
STAFF_PASSWORD=<strong>
```

### 0.4 Turnstile (Cloudflare аккаунта нет — утверждено)

На первый deploy — **test keys** (регистрация не нужна):

```
NEXT_PUBLIC_TURNSTILE_SITE_KEY=1x00000000000000000000AA
CAPTCHA_SECRET_KEY=1x0000000000000000000000000000000AA
```

Формы found/lost/donate **работают**, виджет отображается, но **реальной защиты от ботов нет**.

**Позже:** бесплатный Cloudflare → Turnstile production keys → заменить в Railway Variables + redeploy frontend/backend.

> **Не использовать** `CAPTCHA_SKIP=true` — frontend без site key блокирует submit (`captchaMissing`).

### 0.5 Google Maps (нужна на prod)

1. https://console.cloud.google.com → New project (e.g. `dogrsc-prod`)
2. APIs & Services → Enable **Maps JavaScript API**
3. Credentials → Create API key
4. Restrict key:
   - Application restrictions: **HTTP referrers**
   - Referrers: `https://<frontend-domain>.up.railway.app/*` (обновить после Generate Domain)
   - API restrictions: только Maps JavaScript API
5. Billing account на Google Cloud **обязателен** (есть free tier ~$200 credit для новых аккаунтов; карта нужна, но при малом трафике charge ≈ $0)

→ `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` в **frontend build** на Railway.

Без ключа `/map` покажет заглушку из i18n.

### 0.6 GitHub private repo (создаём вместе)

**Порядок при первом push:**

1. GitHub → New → **Private** → name `dogrsc` → **без** README/gitignore (репо локально уже есть)
2. Проверить `.gitignore` — `.env*`, `node_modules`, `tmp-*` не попадут в commit
3. Первый commit + push (см. PLAN фаза 0.1)
4. Railway → Deploy from GitHub → доступ **только** к `dogrsc`

---

## Фаза 1 — Railway project + infra

### 1.1 Создание проекта

1. [railway.app](https://railway.app) → **New Project**
2. **Deploy from GitHub repo** → выбрать **private** `dogrsc`
3. При установке GitHub App — доступ **только к этому repo**

### 1.2 PostgreSQL

1. Project canvas → **+ New** → **Database** → **PostgreSQL**
2. Имя сервиса: `postgres` (для references)
3. Скопировать `DATABASE_URL` из Variables (internal)

### 1.3 Railway Bucket

1. **+ New** → **Bucket**
2. Region: ближайший (e.g. Southeast Asia если доступен, иначе US)
3. Credentials tab → note:
   - `ENDPOINT` → `S3_ENDPOINT`
   - `ACCESS_KEY_ID` → `S3_ACCESS_KEY`
   - `SECRET_ACCESS_KEY` → `S3_SECRET_KEY`
   - `BUCKET` → `S3_BUCKET`
   - `REGION` → `S3_REGION` (`auto`)

4. Backend service → Variables → **Add Reference** / inject bucket credentials

### 1.4 Удалить лишнее

- Если Railway auto-создал сервис из repo — переименовать или удалить default service
- Нужны **ровно 3 app services**: backend, frontend, admin

---

## Фаза 2 — Backend

### 2.1 Настройка service

| Setting | Value |
|---------|-------|
| Service name | `backend` |
| Source | GitHub repo |
| Builder | **Dockerfile** |
| Dockerfile path | `backend/Dockerfile` |
| Root directory | `/` (repo root) |
| Watch paths | `backend/**`, `package-lock.json` |
| Public networking | **ON** |
| Health check | `/api/v1/health` |

### 2.2 Variables (backend)

```env
# Auto / references
PORT=4000
DATABASE_URL=${{postgres.DATABASE_URL}}

# S3 — from bucket reference or manual
S3_ENDPOINT=https://storage.railway.app
S3_ACCESS_KEY=<from bucket>
S3_SECRET_KEY=<from bucket>
S3_BUCKET=<BUCKET name from credentials>
S3_REGION=auto
S3_FORCE_PATH_STYLE=false

# Auth
JWT_SECRET=<your secret>
JWT_EXPIRES_IN=8h
ADMIN_EMAIL=admin@dogerescue.org
ADMIN_PASSWORD=<your password>
STAFF_EMAIL=staff@dogerescue.org
STAFF_PASSWORD=<your password>
SYSTEM_USER_EMAIL=system@dogerescue.org

# Captcha — test keys (без Cloudflare аккаунта)
CAPTCHA_SECRET_KEY=1x0000000000000000000000000000000AA

# CORS — заполнить ПОСЛЕ deploy frontend/admin (фаза 3)
# CORS_ORIGINS=https://<frontend-domain>,https://<admin-domain>

# Media defaults (можно не менять)
MEDIA_MAX_BYTES=5242880
MEDIA_PRESIGNED_TTL_SECONDS=900
REPORT_MEDIA_UPLOAD_WINDOW_MINUTES=15
APP_VERSION=0.0.1
```

### 2.3 Deploy + verify

1. Deploy backend (migrate runs on container start)
2. Открыть: `https://<backend-domain>/api/v1/health`
3. Ожидание: `{ "status": "ok", "database": "ok" }`

### 2.4 Seed (один раз)

**Вариант A — Railway CLI:**
```powershell
npm i -g @railway/cli
railway login
railway link          # выбрать project + backend service
railway run npm run db:seed -w dogrsc-backend
```

**Вариант B — локально через public DB URL:**
```powershell
# Postgres → Connect → Public URL (если включите TCP proxy)
$env:DATABASE_URL = "postgresql://..."
$env:ADMIN_PASSWORD = "..."
npm run db:seed -w dogrsc-backend
```

После seed: CMS content, demo dogs, stories, admin user.

---

## Фаза 3 — Frontend + Admin

> **Важно:** `NEXT_PUBLIC_*` вшивается при **docker build**. Backend domain должен уже существовать.

### 3.1 Service: frontend

| Setting | Value |
|---------|-------|
| Dockerfile | `frontend/Dockerfile` |
| Root | `/` |

**Docker build args / Variables (build-time):**

```env
NEXT_PUBLIC_API_URL=https://${{backend.RAILWAY_PUBLIC_DOMAIN}}/api/v1
NEXT_PUBLIC_TURNSTILE_SITE_KEY=<site key или test key — см. §0.4>
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=<Google Maps key — см. §0.5>
```

**Runtime variables:**

```env
API_URL=http://${{backend.RAILWAY_PRIVATE_DOMAIN}}:${{backend.PORT}}/api/v1
PORT=3000
HOSTNAME=0.0.0.0
```

> Railway: если private domain reference не сработает в Dockerfile build — задать `NEXT_PUBLIC_API_URL` literal URL backend после первого deploy, затем **Redeploy** frontend.

### 3.2 Service: admin

| Setting | Value |
|---------|-------|
| Dockerfile | `admin/Dockerfile` |

**Build-time:**

```env
NEXT_PUBLIC_API_URL=https://${{backend.RAILWAY_PUBLIC_DOMAIN}}
```

(admin сам добавляет `/api/v1` в `lib/api.ts`)

### 3.3 CORS — финализировать

После получения domain frontend и admin, добавить в backend:

```env
CORS_ORIGINS=https://<frontend>.up.railway.app,https://<admin>.up.railway.app
```

Redeploy backend.

### 3.4 Generate Domain

Для каждого service: Settings → Networking → **Generate Domain** (если не создался автоматически).

---

## Фаза 4 — Smoke test + hardening

### Checklist

| # | Тест | OK? |
|---|------|-----|
| 1 | `GET /api/v1/health` | ☐ |
| 2 | `https://<frontend>/en` — home + stats | ☐ |
| 3 | `/en/dogs` — карточки | ☐ |
| 4 | `/en/stories` — лента | ☐ |
| 5 | `https://<admin>/login` — форма | ☐ |
| 6 | Login admin → dashboard | ☐ |
| 7 | Dogs → upload photo → видно на frontend | ☐ |
| 8 | Found dog form → submit | ☐ |
| 9 | Donate page → bank info | ☐ |
| 10 | `/en/map` — карта с Google Maps key | ☐ |

### Hardening (сразу после smoke)

- [ ] Сменить admin password если seed использовал временный
- [ ] Проверить Railway **Usage** — не вылезаем за $5 credits
- [ ] Завести Cloudflare Turnstile production keys (заменить test keys если использовали §0.4B)
- [ ] В Google Cloud ограничить Maps key referrer на `<frontend>.up.railway.app/*`
- [ ] (Optional) Restrict Swagger in prod — отдельная задача

---

## Переменные: шпаргалка по сервисам

| Variable | backend | frontend build | frontend runtime | admin build |
|----------|---------|----------------|------------------|-------------|
| `DATABASE_URL` | ✅ | — | — | — |
| `JWT_SECRET` | ✅ | — | — | — |
| `S3_*` | ✅ | — | — | — |
| `CORS_ORIGINS` | ✅ | — | — | — |
| `CAPTCHA_SECRET_KEY` | ✅ | — | — | — |
| `NEXT_PUBLIC_API_URL` | — | ✅ | — | ✅ |
| `API_URL` | — | — | ✅ | — |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | — | ✅ | — | — |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | — | ✅ required | — | — |

---

## Порядок деплоя (кратко)

```
0. GitHub private push + код-патчи (CORS, S3)
1. Railway project + Postgres + Bucket
2. Backend deploy → health OK
3. Seed
4. Frontend deploy (NEXT_PUBLIC_API_URL → backend)
5. Admin deploy
6. CORS_ORIGINS → backend redeploy
7. Smoke
```

---

## Типичные проблемы

| Симптом | Причина | Fix |
|---------|---------|-----|
| Admin CORS error | `CORS_ORIGINS` не задан | добавить admin URL |
| Frontend SSR 500 | `API_URL` wrong | private backend URL |
| Browser API fail | `NEXT_PUBLIC_API_URL` wrong at build | rebuild frontend |
| Photo upload fail | `forcePathStyle: true` | `S3_FORCE_PATH_STYLE=false` |
| Login 401 | seed не запускали | `db:seed` |
| Empty dogs | seed или isPublished | check DB |

---

## Следующая задача (когда скажете «делай»)

**Фаза 0 — порядок работ:**

1. Код: CORS env + S3 path style
2. Вы: создать private repo на GitHub (пустой)
3. Первый commit + push (вместе)
4. Вы: Google Maps API key (нужен до frontend deploy)
5. Railway: project + Postgres + Bucket + 3 services
6. Seed + smoke

---

## Файлы проекта (уже готовы)

- `backend/Dockerfile` — migrate + start
- `frontend/Dockerfile` — standalone Next.js
- `admin/Dockerfile` — standalone Next.js
- `infra/docker-compose.staging.yml` — reference для env
- `infra/.env.staging.example` — template

Код деплоя **не нужно писать с нуля** — нужны 2 патча backend + конфиг Railway.
