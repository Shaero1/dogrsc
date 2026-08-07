# BRIEF: about

Дата: 2026-08-02

Папка задачи: `tasks/2026-08-02-about/`

## Формулировка своими словами

Публичная страница **`/[locale]/about`**: кто мы, чем занимается Doge Rescue, как можно помочь. Контент на **en/th/ru** через `next-intl` (static messages). Nav уже ведёт на `/about` — сейчас 404. Backend и admin CMS — **не в этой задаче**.

## Контекст

- **I18N.md:** about — статический контент на трёх языках; CMS через `ContentTranslation` — отдельная задача позже.
- **Donate/map:** контентные блоки без backend (bank i18n) — тот же паттерн для MVP.
- **Header** — ссылка `/about` есть.
- Таблица `content_translations` в schema — не используем пока.

## Scope

### Frontend only

- **`app/[locale]/about/page.tsx`** — RSC, типографика, секции
- **`messages/{en,th,ru}.json`** — namespace `about`:
  - `title`, `subtitle`
  - `missionTitle`, `missionBody`
  - `workTitle`, `workItem1`…`workItem3` (или короткие параграфы)
  - `helpTitle`, `helpBody`
  - CTA labels (optional links → `/donate`, `/dogs`, `/found-dog`)
- Ссылки через `@/i18n/navigation` (`Link`)

### Структура страницы (MVP)

1. Hero — title + subtitle  
2. Mission — один блок текста  
3. What we do — 3 пункта  
4. How you can help — текст + кнопки Donate / Our dogs / Report found  

### Не включаем

- Backend API / `ContentTranslation`
- Admin editor для about
- FAQ, team photos, timeline
- Rich markdown CMS

## Критерии успеха

- [ ] `/en/about`, `/th/about`, `/ru/about` — без 404, контент на нужном языке
- [ ] Nav «About» работает
- [ ] CTA-ссылки ведут на существующие страницы
- [ ] `npm run build -w dogrsc-frontend`
- [ ] `frontend/README.md` — smoke `/about`

## Открытые вопросы

| Вопрос | Решение (MVP) |
|--------|----------------|
| Откуда контент? | **Static i18n** в `messages/*.json` |
| CMS / admin edit | **Отложено** — задача content-cms |
| Фото на about | **Нет** в MVP |
| Тексты | **Placeholder** на en/th/ru (осмысленные, не lorem); заказчик заменит позже |
| Backend | **Без изменений** |

## Чек-лист выхода

- [x] формулировка своими словами есть
- [x] критерии успеха измеримы
- [x] открытые вопросы закрыты
