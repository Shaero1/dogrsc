# Карта проекта: Doge Rescue

Обновлено: **2026-08-10** (site shell, glass UI, branding CMS, dev perf)

## Что это

Сайт организации помощи собакам: публичный каталог собак, объявления о найденных/потерянных собаках, карта, пожертвования (банк + крипто), CMS для статических страниц, административная панель. Целевая аудитория — посетители сайта, волонтёры (STAFF), администраторы.

**Текущий статус:** MVP backend + admin + публичный frontend **реализованы локально**; CI (GitHub Actions) и **staging Docker Compose** в репозитории; **production deploy и remote git** — не подключены.

Решения и история: `harness/DECISIONS.md`, задачи в `tasks/`.

## Стек

**Зафиксировано (DECISIONS 2026-07-31 … 2026-08-03):**

| Слой | Технологии |
|------|------------|
| Публичный сайт | Next.js 16, TypeScript, React, **next-intl** (en/th/ru), SSR/RSC |
| Admin | Next.js 16, UI на **en**; JWT в localStorage |
| Backend | NestJS, REST **`/api/v1`**, Prisma 6, PostgreSQL |
| Файлы | MinIO (dev/staging), S3-compatible API; presigned URLs |
| Кэш/очереди | Redis в compose; **в runtime backend пока не используется** |
| Карты | Google Maps (`@vis.gl/react-google-maps`); без API key — fallback UI |
| Крипто MVP | Статические адреса (BTC, ETH, USDT, DOGE) из БД; этап 2 — watch-only |
| CI | **GitHub Actions** — build, lint, e2e (11 spec-файлов) |
| Staging | **Docker Compose** full stack; порты 4001/3002/3003 |
| Production | **TODO** — хостинг и домен не выбраны |
| OpenAPI | `backend/openapi.yaml`, `npm run openapi:export -w dogrsc-backend` |

**Монорепо:** `backend/`, `frontend/`, `admin/`, `infra/`; корневой `package.json` (npm workspaces).

## Структура

```
dogrsc/
├── .github/workflows/ci.yml    # CI: build + lint + e2e
├── harness/                    # PROJECT.md, DECISIONS, LESSONS, templates
├── tasks/                      # BRIEF / PLAN / REPORT по задачам
├── backend/                    # NestJS, Prisma, e2e, Dockerfile
├── frontend/                   # Публичный сайт, i18n, Dockerfile
├── admin/                      # Admin panel, Dockerfile
├── infra/                      # docker-compose.dev.yml, docker-compose.staging.yml
└── package.json
```

Подробности bootstrap: `tasks/00-bootstrap-decisions/REPOS.md`, `I18N.md`.

## Реализовано (MVP)

### Публичный frontend (`frontend/`)

| Маршрут | Статус | Примечание |
|---------|--------|------------|
| `/[locale]` | ✅ | **CMS** hero + CTA на **site background**; Ken Burns; site name/tagline — messages |
| `/[locale]/faq` | ✅ | **CMS**; 5 Q&A |
| `/[locale]/about` | ✅ | **CMS** + messages fallback |
| `/[locale]/contact` | ✅ | **CMS** + social links; без contact form |
| `/[locale]/stories` | ✅ | **CMS**; links на seed dogs |
| `/[locale]/dogs`, `/dogs/[slug]` | ✅ | Public API, `revalidate: 60` |
| `/[locale]/found-dog`, `/lost-dog` | ✅ | Server Actions + optional photo |
| `/[locale]/map` | ✅ | APPROVED markers only |
| `/[locale]/donate` | ✅ | Crypto из API; bank из **CMS**; форма отчёта |
| `/[locale]/account` | ❌ | Этап 2 |

Nav: Home, About, **FAQ**, Stories, Dogs, Map, Donate, Contact, Found/Lost.

### Backend (`backend/src/`)

| Модуль | Endpoints (кратко) |
|--------|-------------------|
| **auth** | `POST /auth/login`, `GET /auth/me` |
| **health** | `GET /health` |
| **dogs** | Public list/slug; admin CRUD, archive, publish |
| **media** | Admin upload; public presigned для reports |
| **reports** | Public POST found/lost; admin list/moderate |
| **map** | `GET /map/markers` |
| **donations** | Public crypto + `POST /donate/donations`; admin crypto + records |
| **dashboard** | `GET /admin/dashboard/stats` |
| **users** | `GET/POST/PATCH /admin/users` (ADMIN only) |
| **content** | `GET /content/pages/:id`; **`GET /content/branding`**; admin GET/PUT CMS + branding |

E2E: 11 файлов в `backend/test/` (включая `content.e2e-spec.ts`).

### Admin (`admin/`)

| Страница | Роли | Функции |
|----------|------|---------|
| `/dashboard` | ADMIN, STAFF | Stats + quick links |
| `/dogs` | ADMIN, STAFF | CRUD, publish, media |
| `/reports` | ADMIN, STAFF | Found/Lost moderation |
| `/content` | **ADMIN** | CMS pages + **site logo/background** |
| `/donations` | ADMIN, STAFF | Crypto + records + **bank details** |
| `/users` | **ADMIN** | Staff accounts |

Seed: `admin@dogerescue.org`, `staff@dogerescue.org`, demo dogs/reports/donations/CMS — `npm run db:seed -w dogrsc-backend`.

### CMS (`ContentTranslation`)

Редактируемые страницы: **`home`**, **`faq`**, **`about`**, **`contact`** (incl. social links), **`stories`**, **`donate-bank`** (en/th/ru). **Branding:** site logo + hero (site background). Bank details редактируются в **Donations** admin. Nav и UI-строки остаются в `frontend/messages/*.json`.

### Site shell + glass UI

- **Site background:** CMS `heroImage` → fixed layer на всех страницах (`SiteBackground`, overlay 55%).
- **Header/Footer:** glass/dark variant при активном фоне (`data-site-bg`).
- **Inner pages:** `InnerMain` — title on photo, content in glass panel; cards `.glass-card`.

### Infra / CI

- **Dev:** `infra/docker-compose.dev.yml` — Postgres :5432, Redis, MinIO
- **Staging:** `infra/docker-compose.staging.yml` — project `dogrsc-staging`, API **:4001**, frontend **:3002**, admin **:3003**, Postgres **:5433**
- **CI:** `.github/workflows/ci.yml` — срабатывает после push на remote `main`

## Ключевые модули (сводка)

| Модуль | Где | Статус |
|--------|-----|--------|
| Каталог собак | frontend + backend | ✅ MVP |
| Found/lost + модерация | frontend + backend | ✅ MVP |
| Карта | frontend + backend | ✅ MVP |
| Пожертвования | frontend + backend | ✅ MVP (без blockchain watch) |
| CMS статики | backend + admin + frontend | ✅ MVP + home/faq/branding |
| Site shell / glass UI | frontend | ✅ локально; commit TBD |
| Auth / роли | backend + admin | ✅ JWT; USER login — этап 2 |
| Личный кабинет | — | ❌ этап 2 |
| Уведомления (email) | — | ❌ этап 2 |
| Matching found↔lost | — | ❌ этап 3 |
| Audit log UI | backend schema only | ❌ |
| PWA | — | ❌ этап 3 |

## Как запустить / проверить

### Dev (хост)

```powershell
cd c:\dogrsc
npm install
npm run dev
```

Одна команда: env-файлы (если нет) → Docker infra → migrate → seed-if-empty → backend + frontend + admin.

**Облегчённый режим:** `npm run dev:lite` — backend + frontend без admin (меньше RAM). Dev использует **webpack** (`next dev --webpack`), не turbopack root.

| URL | Назначение |
|-----|------------|
| http://localhost:4000/api/v1/health | API |
| http://localhost:3000/en | Frontend |
| http://localhost:3001/login | Admin |

Логины seed: `admin@dogerescue.org` / `changeme-dev-only`; staff: `staff@dogerescue.org` / `changeme-staff-dev`.

Отдельно: `npm run dev:prepare` (только infra+migrate), `npm run dev:apps` (только приложения), `npm run dev:infra:down`.

### Сборка и тесты

```powershell
npm run build          # backend + frontend + admin
npm run lint           # frontend + admin
npm run test:e2e       # backend e2e (нужен dev compose + migrate)
```

### Staging (Docker full stack)

```powershell
cd c:\dogrsc\infra
copy .env.staging.example .env.staging
docker compose -f docker-compose.staging.yml up --build -d

# optional seed
cd c:\dogrsc
$env:DATABASE_URL = "postgresql://dogrsc:dogrsc@localhost:5433/dogrsc"
npm run db:seed -w dogrsc-backend
```

Smoke: `:4001/health`, `:3002/en`, `:3003/login`. Подробнее: `infra/README.md`.

## Roadmap (что дальше)

| Приоритет | Задача |
|-----------|--------|
| Ближайшее | Production deploy (хостинг TBD), push GitHub + проверка CI в облаке |
| Опционально | Contact form + SMTP; **footer** в CMS |
| Этап 2 | `/account`, усыновление, волонтёры, Electrum watch-only, email |
| Этап 3 | CV matching, PWA, собственная BTC-нода |

Спецификация по фазам — PDF + раздел 31 в bootstrap.

## Known issues / ограничения

- **Remote git** может отсутствовать — CI workflow лежит в репо, но не запускается без push
- **Production** хостинг и домен не зафиксированы
- **Redis** поднят в compose, backend его не использует
- **S3-провайдер prod:** R2 рекомендован, не подтверждён
- **Stripe/PayPal** — не в MVP
- **`npm run build -w dogrsc-backend`** может дать EPERM на `prisma generate`, если dev backend держит query engine — остановить процесс или `npx nest build` в `backend/`
- **Staging seed** — вручную после первого `up` (не в CI)
- **Footer** — static i18n, не CMS
- **Dogs i18n** — JSONB в Prisma; редактируется в admin dogs, не в CMS

## Точки входа

| Среда | Backend | Frontend | Admin |
|-------|---------|----------|-------|
| Dev | `:4000` | `:3000` → `/en` | `:3001` → `/dashboard` |
| Staging | `:4001` | `:3002` | `:3003` |

API prefix: `/api/v1`. Swagger/OpenAPI: см. `backend/README.md`.
