# BRIEF: /stories

Дата: 2026-08-02

Папка задачи: `tasks/2026-08-02-stories/`

## Формулировка своими словами

Публичная страница **`/[locale]/stories`**: короткие истории спасения и усыновления — для доверия и эмоциональной связи с организацией. Конент на **en/th/ru** через `next-intl` (static messages), как `/about`. Добавить пункт **Stories** в header nav (сейчас в PROJECT.md есть, в nav — нет). Backend и CMS — **не в этой задаче**.

## Контекст

- **Roadmap:** после admin `/users`; CMS (`ContentTranslation`) — **следующая** отдельная задача.
- **About/contact/donate bank:** static i18n без backend — тот же паттерн.
- **Dogs API:** seed `luna` / `mango` с `rescueStory` — можно дать CTA «Meet Luna» → `/dogs/luna`, но текст истории на stories — **редакторский**, не fetch из API.
- **Header** — ссылки на `/stories` пока нет.

## Scope

### Frontend only

- **`app/[locale]/stories/page.tsx`** — RSC, список 2–3 story cards
- **`messages/{en,th,ru}.json`** — namespace `stories`:
  - `title`, `subtitle`
  - для каждой истории: `storyNTitle`, `storyNBody` (N=1..3)
  - `readDogProfile` — label кнопки к профилю собаки (если есть slug)
  - footer CTA: `ctaDonate`, `ctaDogs` (optional)
- **`components/Header.tsx`** — nav item `stories` → `/stories`
- **`messages/*.json`** — `nav.stories` на трёх языках
- Slugs собак для demo-ссылок — **hardcode в page** (`luna`, `mango`), не в i18n

### Структура страницы (MVP)

1. Hero — title + subtitle  
2. Список карточек: заголовок + текст + optional link на `/dogs/[slug]`  
3. Низ страницы — CTA Donate / Our dogs  

### Не включаем

- Backend / `ContentTranslation` / admin editor
- Pagination, фильтры, markdown
- Фото в карточках (можно этап 2)
- Автоподтягивание `rescueStory` из dogs API

## Критерии успеха

- [ ] `/en/stories`, `/th/stories`, `/ru/stories` — без 404, контент на нужном языке
- [ ] Nav «Stories» в header ведёт на страницу
- [ ] CTA на `/dogs/luna` (и вторую demo) работают при seed
- [ ] `npm run build -w dogrsc-frontend`
- [ ] `frontend/README.md` — smoke `/stories`
- [ ] PLAN утверждён человеком до реализации

## Открытые вопросы

| Вопрос | Решение (MVP) |
|--------|----------------|
| Откуда контент? | **Static i18n** в `messages/*.json` |
| CMS | **Отложено** — следующая задача roadmap |
| Сколько историй? | **3** placeholder (2 с link на seed dogs, 1 общая «community report») |
| Фото | **Нет** в MVP |
| Backend | **Без изменений** |

## Чек-лист выхода

- [x] формулировка своими словами есть
- [x] критерии успеха измеримы
- [x] открытые вопросы закрыты
