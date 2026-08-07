# Журнал решений (DECISIONS.md)
<!-- Новые записи сверху. Формат: дата, суть, причина. 3–5 строк, не эссе. -->

## 2026-08-03 — CMS home + FAQ
- Решение: entity **`home`** (hero + CTA buttons) и **`faq`** (5 Q&A + ctaContact) в ContentTranslation; публичная **`/[locale]/faq`**; nav **FAQ**; **`site.name`/`tagline`** остаются в messages; seed + fallback как у about.
- Почему: закрывает пункт roadmap после базового CMS; footer — отдельно; фиксированные 5 пар Q&A достаточны для MVP admin editor.
- Затронуто: `content-pages.manifest.ts`, `content-seed-data.ts`, `frontend/app/[locale]/{page,faq}/`, `Header.tsx`, `tasks/2026-08-03-cms-home-faq/`

## 2026-08-03 — CMS ContentTranslation
- Решение: таблица **`ContentTranslation`** — backend `GET /content/pages/:id` + admin `GET/PUT /admin/content/pages/:id` (**ADMIN only**); страницы **`about`**, **`contact`**, **`stories`**, **`donate-bank`**; seed из текущих messages; frontend **CMS + messages fallback**; admin **`/content`** с табами en/th/ru; `force-dynamic` на CMS-страницах.
- Почему: редактируемый контент без деплоя; nav/UI/form donate остаются в next-intl; hybrid fallback если БД пуста; Dogs JSONB — отдельно.
- Затронуто: `backend/src/content/`, `backend/prisma/content-seed-data.ts`, `frontend/lib/content-api.ts`, `admin/app/(admin)/content/`, `tasks/2026-08-03-cms/`

## 2026-08-02 — CI/CD + staging (Compose)
- Решение: GitHub Actions `ci.yml` — build + lint + e2e (dev compose + migrate); staging **`docker-compose.staging.yml`** + Dockerfiles (backend/frontend/admin); project `dogrsc-staging`, host ports **4001/3002/3003**; API-backed frontend pages **`force-dynamic`** для сборки без live API; облачный deploy — позже.
- Почему: автопроверка перед CMS; staging = полный stack на любом Docker host; порты отделены от dev `:4000/:3000/:3001`.
- Затронуто: `.github/workflows/`, `infra/`, `*/Dockerfile`, `frontend/app/[locale]/{dogs,map,donate}/`, `tasks/2026-08-02-cicd-staging/`

## 2026-08-02 — Stories page (static i18n)
- Решение: `/[locale]/stories` — 3 curated rescue stories в **next-intl messages** (en/th/ru); demo links на seed dogs `luna`/`mango`; nav **Stories** в Header; **без backend**.
- Почему: закрывает пункт roadmap после `/users`; CMS ContentTranslation — отдельная задача; static i18n = тот же паттерн, что about/contact.
- Затронуто: `frontend/app/[locale]/stories/`, `frontend/messages/*.json`, `frontend/components/Header.tsx`, `tasks/2026-08-02-stories/`

## 2026-08-02 — Admin users management
- Решение: `GET/POST/PATCH /admin/users` — **ADMIN only**; список только ADMIN+STAFF; `system@` исключён; PATCH role/password; нельзя понизить последнего ADMIN; seed demo STAFF; admin `/users` — list + create + role/password update.
- Почему: закрывает placeholder nav; STAFF не управляет ролями; без delete (FK media/audit); USER — этап 2.
- Затронуто: `backend/src/users/`, `admin/app/(admin)/users/`, `tasks/2026-08-02-admin-users/`

## 2026-08-02 — Donation records (report + moderation)
- Решение: public `POST /donate/donations` → `PENDING` с `paymentMethod` BANK|CRYPTO; `/donate` — две кнопки + модалка (реквизиты + форма); redirect `/donate/thank-you` **без SMTP**; admin `/donations` tabs Crypto|Records, Confirm/Reject только из PENDING; dashboard sum уже по CONFIRMED.
- Почему: закрывает «я перевёл» без blockchain; email донора для учёта/страховки; bank text остаётся static i18n; модерация отделена от submit.
- Затронуто: `backend/src/donations/`, `frontend/app/[locale]/donate/`, `admin/app/(admin)/donations/`, `tasks/2026-08-02-donation-records/`

## 2026-08-02 — Admin dashboard stats
- Решение: `GET /admin/dashboard/stats` — aggregate: `IN_CARE` dogs, pending found+lost reports, sum **CONFIRMED** donations current UTC month (THB), **`AVAILABLE` dogs (A, без isPublished)**; admin `/dashboard` client fetch + quick links.
- Почему: один запрос вместо нескольких list API; 4-я карточка — pipeline усыновления, не volunteers (нет модели); donations sum полезнее count.
- Затронуто: `backend/src/dashboard/`, `admin/app/(admin)/dashboard/`, `tasks/2026-08-02-admin-dashboard/`

## 2026-08-02 — Contact page (static i18n)
- Решение: `/[locale]/contact` — email, phone, LINE placeholder, hours, address в **next-intl messages**; `mailto:`/`tel:` links; CTA на `/found-dog` для срочных случаев; **без** contact form и backend.
- Почему: закрывает последний nav 404 MVP; форма + email provider — этап 2; тот же паттерн, что about/donate bank.
- Затронуто: `frontend/app/[locale]/contact/`, `frontend/messages/*.json`, `tasks/2026-08-02-contact/`

## 2026-08-02 — About page (static i18n)
- Решение: `/[locale]/about` — контент в **next-intl messages** (en/th/ru): mission, work items, CTA links; **без backend** и без `ContentTranslation` на MVP.
- Почему: закрывает nav 404 быстро; CMS для статических страниц — отдельная задача; тексты placeholder до копирайта заказчика.
- Затронуто: `frontend/app/[locale]/about/`, `frontend/messages/*.json`, `tasks/2026-08-02-about/`

## 2026-08-02 — Donate (static crypto + bank i18n)
- Решение: public `GET /donate/crypto-addresses` (active only); admin CRUD `/admin/crypto-addresses`; **one active per currency**; bank transfer text — **static i18n** на frontend; таблица `donations` не используется; deactivate вместо delete.
- Почему: MVP по спеке — статические адреса без blockchain watch; admin меняет кошельки без деплоя; bank CMS отложен; публичная форма «я перевёл» — шире скоуп.
- Затронуто: `backend/src/donations/`, `frontend/app/[locale]/donate/`, `admin/app/(admin)/donations/`, `tasks/2026-08-02-donate/`

## 2026-08-02 — Public map (found/lost markers)
- Решение: `GET /api/v1/map/markers?type=` — только `APPROVED` + lat/lng; public DTO **без контактов**; optional thumbnail; frontend `/[locale]/map` с `@vis.gl/react-google-maps`, client filters All/Found/Lost; без `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` — fallback message, build OK.
- Почему: закрывает nav `/map` после reports; отдельный public endpoint не утекает PII из admin API; Google Maps по DECISIONS; key не блокирует разработку backend/страницы.
- Затронуто: `backend/src/map/`, `frontend/app/[locale]/map/`, `frontend/components/ReportsMap.tsx`, `tasks/2026-08-02-map/`

## 2026-08-02 — Found/lost reports (public submit + moderation)
- Решение: public `POST /found-reports`, `/lost-reports` → `PENDING`; optional photo через public media endpoints (`found_report`/`lost_report`, upload window **15 min**, system user `system@dogerescue.org`); admin list/PATCH approve|reject (`ADMIN`+`STAFF`, только из `PENDING`); frontend **Server Actions** + geolocation optional; admin `/reports` с табами Found/Lost.
- Почему: без CORS для форм; переиспользование MediaModule; moderation отделена от submit; координаты не блокируют отправку при отказе geolocation.
- Затронуто: `backend/src/reports/`, `backend/src/media/`, `frontend/app/[locale]/found-dog/`, `frontend/app/[locale]/lost-dog/`, `admin/app/(admin)/reports/`, `tasks/2026-08-02-reports/`

## 2026-08-02 — Public frontend dogs catalog
- Решение: страницы `/[locale]/dogs` и `/[locale]/dogs/[slug]`; данные через **RSC fetch** к `GET /api/v1/dogs`; `Accept-Language` = locale; UI strings в next-intl; `revalidate: 60`; backend без изменений.
- Почему: API уже готов после `10-dogs`; server fetch без CORS; замыкает admin → public vertical slice.
- Затронуто: `frontend/lib/api.ts`, `frontend/app/[locale]/dogs/`, `tasks/2026-08-02-public-dogs/`

## 2026-08-02 — Dogs catalog (admin + public read)
- Решение: admin CRUD + `isPublished`; public `GET /dogs`, `/dogs/:slug` только `isPublished=true` и status `AVAILABLE`|`IN_CARE`; slug autogen из `descriptions.en.name` + ручной override; archive (`ARCHIVED`) — **ADMIN only**, без hard delete; media link через `entityType=dog`; seed `luna`/`mango`.
- Почему: первый end-to-end модуль каталога; публикация отдельно от статуса ухода; JSONB i18n по DECISIONS; frontend подключится к public API позже.
- Затронуто: `backend/src/dogs/`, migration `dog_is_published`, `admin/app/(admin)/dogs/`, `prisma/seed.ts`, `tasks/2026-08-02-dogs/`

## 2026-08-02 — Media upload (admin API)
- Решение: server-side upload в MinIO/S3 (`forcePathStyle`); metadata в `media`; отдача через **presigned GET** (TTL 900s); soft delete (`deletedAt`), S3 cleanup позже; лимит **5 MB**, MIME jpeg/png/webp; `@Roles(ADMIN, STAFF)`; delete: ADMIN — любой, STAFF — свой или entity-linked.
- Почему: проще валидация и MVP без MinIO CORS/policy; presigned снимает нагрузку с API; soft delete безопаснее ошибочных удалений. Admin UI upload — в `10-dogs`.
- Затронуто: `backend/src/media/`, migration `media_soft_delete`, `tasks/2026-08-02-media/`

## 2026-08-01 — Auth (JWT admin)
- Решение: JWT access token (`JWT_EXPIRES_IN=8h`), bcrypt passwords, `POST /auth/login` + `GET /auth/me`; global `JwtAuthGuard` + `RolesGuard`; admin token в **localStorage**; dev admin через Prisma seed (`ADMIN_EMAIL` / `ADMIN_PASSWORD`).
- Почему: stateless API, проще cross-origin admin:3001 ↔ api:4000; без refresh/session на MVP; только ADMIN/STAFF могут логиниться в admin.
- Затронуто: `backend/src/auth/`, `backend/prisma/seed.ts`, `admin/lib/auth.ts`, `admin/components/admin/AuthGate.tsx`, `tasks/2026-08-01-auth/`

## 2026-08-01 — ORM и MVP schema (Prisma)
- Решение: **Prisma 6** в `backend/`; первая миграция `init_mvp` — 9 таблиц MVP (users, dogs, reports, donations, crypto_addresses, media, content_translations, audit_logs). Dog i18n — JSONB `descriptions` + `seo`. Health: `database: ok` / HTTP 503 при недоступности Postgres.
- Почему: заказчик выбрал Prisma; scope minimum MVP; JSONB по `I18N.md`; Prisma 7 отложен (breaking config). Тонкий `PrismaService` без `@nestjs/prisma`.
- Затронуто: `backend/prisma/`, `backend/src/prisma/`, health, `tasks/2026-08-01-database-schema/`

## 2026-08-01 — Dev infra: образы compose
- Решение: локально Postgres **15-alpine**, MinIO с **quay.io/minio/minio** и **quay.io/minio/mc** (Docker Hub EOF).
- Почему: Hub не отдавал слои; 15-alpine уже локально; `DATABASE_URL` совместим.
- Затронуто: `infra/docker-compose.dev.yml`, `infra/README.md`, `tasks/04-infra-local/`

## 2026-07-31 — Монорепо в `dogrsc`
- Решение: весь код в одном репозитории `dogrsc`: `backend/`, `frontend/`, `admin/`, `infra/`; npm workspaces; один git в корне.
- Почему: удобнее Cursor workspace, проще координация; scaffold без коммитов — безболезненный перенос; независимый деплой возможен через отдельные Dockerfile/CI job.
- Затронуто: структура каталогов, `package.json` (root), harness/PROJECT.md, REPOS.md, README приложений

## 2026-07-31 — Репозитории и i18n (отменено частично)
- Решение: отдельные репо `dogrsc-frontend`, `dogrsc-admin`, `dogrsc-backend`, `dogrsc-infra`; `dogrsc` — координация (harness, spec, tasks). MVP на en/th/ru. Admin UI на en; контент сайта редактируется на трёх языках. OpenAPI в backend, без репо `dogrsc-contracts`. Remote на GitHub не создаём до отдельного решения.
- Почему: явный выбор заказчика; независимый CI/CD и деплой admin; соответствие спеке (раздел 27); локальная работа без публикации кода.
- Затронуто: harness/PROJECT.md, tasks/00-bootstrap-decisions/, будущие репо frontend/admin/backend/infra

## 2026-07-31 — Стек и границы MVP
- Решение: NestJS + REST `/api/v1`, Next.js (frontend и admin), PostgreSQL, Redis, Google Maps, S3-совместимое хранилище (рекомендация: Cloudflare R2). Крипто в MVP — статические адреса; Electrum watch-only — этап 2.
- Почему: соответствует спецификации (разделы 22–23, 31, 35); единый TypeScript-стек; минимальный scope MVP без blockchain-мониторинга.
- Затронуто: backend, frontend, admin, infra
