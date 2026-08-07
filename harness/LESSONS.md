# Журнал уроков (LESSONS.md)
<!-- Новые записи сверху. Формат: дата, суть, причина. 3–5 строк, не эссе. -->

## 2026-08-02 — Docker build frontend и staging compose

- Что случилось: `docker compose build frontend` падал на SSG (`fetch failed ECONNREFUSED` для `/dogs`, `/map`); staging `up` — конфликт имён контейнеров и порта `:4000`; в Dockerfile `npx prisma` тянул Prisma 7 вместо 6.
- Причина: Next pre-render ходит в API при сборке; dev и staging делили project/порты; `npx prisma` без pin игнорирует lockfile workspace.
- Урок: страницы с live API — `force-dynamic` или infra до `next build`; staging — отдельный compose `name` и порты (4001/3002/3003); в Docker — `prisma@6.19.3` явно, не голый `npx prisma`.

## 2026-08-01 — Prisma 7 ломает `schema.prisma` с `url`
- Что случилось: `npx prisma migrate dev` упал с P1012 — `url` в datasource больше не поддерживается; нужен `prisma.config.ts`.
- Причина: `npm install prisma` без pin поставил Prisma 7.9; breaking change относительно NestJS-scaffold с классическим schema.
- Урок: фиксировать Prisma 6 (`prisma@6`, `@prisma/client@6`) до отдельной миграции на Prisma 7; после install проверять `npx prisma -v`.

## 2026-08-01 — Docker Hub pull падает с EOF
- Что случилось: `docker compose up` и `docker pull` для `postgres:16-alpine`, `minio/minio`, `minio/mc` обрывались с `failed to copy: ... cloudfront.docker.com ... EOF`; compose не поднимался.
- Причина: сбой/нестабильность загрузки слоёв с Docker Hub (CloudFront), не ошибка в `docker-compose.dev.yml`.
- Урок: при EOF — повторить pull; для MinIO использовать `quay.io/minio/minio` и `quay.io/minio/mc`; для Postgres — уже локальный образ (`15-alpine`) или повтор pull `16-alpine`; не менять compose без проверки, что проблема не в сети/registry.

## ГГГГ-ММ-ДД — <короткая суть граблей>
- Что случилось: <симптом>
- Причина: <настоящая причина, а не догадка>
- Урок: <что проверять / как не наступить снова>
