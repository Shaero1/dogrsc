# BRIEF: admin-scaffold

Дата: 2026-07-31

## Формулировка своими словами

Каркас админ-панели в локальном репо `c:\dogrsc-admin`: Next.js, UI только на **английском**, базовый layout (sidebar + header), заглушка auth (страница login без реального backend-auth), dashboard-заглушка. Без CRUD и без API-интеграции.

## Контекст

- REPOS.md: после frontend → `03-admin-scaffold`.
- I18N.md: admin UI = en only в MVP.
- Backend: `http://localhost:4000/api/v1` — env-заготовка.

## Критерии успеха

- [ ] `c:\dogrsc-admin` — Next.js, `npm run build` OK
- [ ] Layout: sidebar с разделами из спеки (dashboard, dogs, reports… — ссылки-заглушки)
- [ ] `/login` — форма-заглушка (без реальной авторизации)
- [ ] `/` или `/dashboard` — dashboard-заглушка
- [ ] `.env.example`, README
- [ ] `git init` (без commit)

## Открытые вопросы

| Вопрос | Статус |
|--------|--------|
| Auth stub | Страница login + комментарий «wire to backend in auth task» |
| Отдельный поддомен | Не настраиваем; локально `:3001` |

## Чек-лист выхода

- [x] формулировка есть
- [x] критерии измеримы
- [x] вопросы закрыты
