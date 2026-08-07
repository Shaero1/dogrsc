# BRIEF: Deploy dogrsc на Railway (Hobby $5)

Дата: 2026-08-07  
План: Hobby ($5/мес + $5 usage credits)  
Статус: **решения утверждены**, к реализации

## Цель

Поднять **полный production-like стек** на Railway:

- public frontend (`/en`, dogs, stories, forms)
- admin panel (login, CRUD)
- backend API + PostgreSQL + media storage

## Принятые решения

| # | Решение |
|---|---------|
| 1 | Хостинг: **Railway Hobby** |
| 2 | Deploy: **GitHub private repo** → Railway auto-deploy |
| 3 | GitHub: **создаём private repo вместе с первым push** |
| 4 | Storage: **Railway Bucket** (не MinIO-контейнер) |
| 5 | Redis: **не деплоим** (не используется в коде) |
| 6 | Домены: **`*.up.railway.app`** (свой домен — позже) |
| 7 | Seed: **один раз вручную** после первого migrate |
| 8 | Swagger на prod: **оставить** (можно закрыть позже) |
| 9 | **Google Maps: нужна** → API key до deploy frontend (Google Cloud) |
| 10 | **Turnstile: Cloudflare аккаунта нет** → **test keys** на deploy (формы работают, защиты нет; CF — позже) |

## Не в scope первого деплоя

- Custom domain + DNS
- GitHub Actions auto-deploy на Railway (только Railway watch branch)
- Redis / workers / cron
- Отдельный staging environment (можно добавить второй Railway environment позже)
- CI изменения
- **Реальный Cloudflare Turnstile** (production bot protection) — после регистрации аккаунта

## Критерии успеха

- [ ] `GET /api/v1/health` → database ok
- [ ] Frontend `/en` открывается, dogs/stories/home stats работают
- [ ] Admin login + upload фото собаки
- [ ] Found-dog form с Turnstile
- [ ] `/en/map` — карта с Google Maps key
- [ ] Секреты не в git
- [ ] Private GitHub — код не публичный

## Оценка

| Фаза | Время |
|------|-------|
| 0 GitHub + код-патчи | 1–1.5 ч |
| 1 Railway infra | 0.5–1 ч |
| 2 Backend + seed | 0.5 ч |
| 3 Frontend + Admin | 0.5–1 ч |
| 4 Smoke + фиксы | 0.5–1 ч |
| **Итого** | **3–5 ч** |
