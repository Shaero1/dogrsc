# BRIEF: CMS (ContentTranslation)

Дата: 2026-08-03

Папка задачи: `tasks/2026-08-03-cms/`

## Формулировка своими словами

Вынести **редактируемый статический контент** сайта (about, contact, stories, банковские реквизиты на donate) из `frontend/messages/*.json` в таблицу **`ContentTranslation`** (Prisma уже есть). Добавить **backend API** (публичное чтение + admin CRUD), **редактор в admin** и подключить **frontend** с fallback на messages, если в БД поля нет.

Nav labels, UI-кнопки и тексты форм donate **остаются** в next-intl — только «контент страниц».

## Контекст

- **Roadmap:** после CI/CD + staging; about/contact/stories/donate-bank сейчас static i18n (`tasks/2026-08-02-*`).
- **Schema:** `ContentTranslation` — `entityType`, `entityId`, `locale`, `field`, `value` (unique composite).
- **I18N.md:** CMS для about/FAQ/баннеров; Dogs — JSONB (не трогаем).
- **Admin UI:** en-only; контент редактируется на en/th/ru.
- **Staging:** frontend SSR через `API_URL`; публичный fetch CMS с backend работает в Docker.

## Scope

### Страницы и поля (MVP)

| entityType | entityId | Поля (ключи = field) |
|------------|----------|----------------------|
| `page` | `about` | title, subtitle, missionTitle, missionBody, workTitle, workItem1–3, helpTitle, helpBody, ctaDonate, ctaDogs, ctaFound |
| `page` | `contact` | title, subtitle, reachTitle, emailLabel, emailValue, phoneLabel, phoneValue, lineLabel, lineValue, hoursTitle, hoursBody, addressTitle, addressBody, noteBody, ctaFound |
| `page` | `stories` | title, subtitle, story1Title, story1Body, story2Title, story2Body, story3Title, story3Body, readDogProfile, ctaDonate, ctaDogs |
| `page` | `donate-bank` | bankAccountName, bankName, bankAccountNumber, bankNote |

Локали: **en, th, ru**. Fallback на **en**, если перевода нет.

### Backend

- Модуль **`content/`**: manifest страниц, service (upsert, resolve с fallback), controllers.
- **`GET /api/v1/content/pages/:entityId?locale=th`** — публично, map `{ field: value }`.
- **`GET /admin/content/pages`** — список страниц из manifest (id, label, fields).
- **`GET /admin/content/pages/:entityId`** — все локали + поля для редактора.
- **`PUT /admin/content/pages/:entityId`** — bulk upsert `{ items: [{ locale, field, value }] }`; **ADMIN only**.
- Seed: заполнить `ContentTranslation` из текущих `messages/en|th|ru.json` для четырёх entity.
- E2E: публичный GET + admin PUT + STAFF 403.

### Admin

- Nav: **Content** → `/content`.
- Страница: выбор page (about | contact | stories | donate bank), табы локалей en/th/ru, textarea/input по полям, Save.
- `admin/lib/api.ts` + types.

### Frontend

- **`frontend/lib/content-api.ts`** — `fetchPageContent(entityId, locale)`.
- **`frontend/lib/page-content.ts`** — merge CMS + next-intl fallback (`getTranslations` namespace).
- Обновить: `about`, `contact`, `stories`, `donate` (+ props в `DonatePageClient` / `DonationMethodModal` для bank fields).
- `force-dynamic` на about/contact/stories (как dogs/donate) для свежего CMS в Docker.

### Не включаем

- Dogs descriptions (JSONB в Dog model).
- FAQ, home hero, footer (отдельная задача).
- Rich-text / Markdown editor (plain textarea).
- Автоперевод черновиков (I18N.md §27 — не MVP).
- Версионирование контента, preview/draft workflow.
- Удаление ключей из `messages/*.json` (оставляем как fallback и для UI).

## Критерии успеха

- [ ] Seed создаёт переводы для 4 страниц × 3 локали.
- [ ] `GET /api/v1/content/pages/about?locale=th` возвращает тексты; missing field → en fallback.
- [ ] Admin `/content` сохраняет изменения; после reload frontend показывает новый текст.
- [ ] `/about`, `/contact`, `/stories`, bank modal на `/donate` — en/th/ru работают локально и на staging.
- [ ] E2E проходит; `npm run build` monorepo OK.
- [ ] `REPORT.md` + запись в `harness/DECISIONS.md`.
- [ ] PLAN утверждён человеком до реализации.

## Открытые вопросы

| Вопрос | Решение (MVP) |
|--------|----------------|
| entityType | **`page`** для всех четырёх |
| donate bank entityId | **`donate-bank`** (отдельно от crypto из БД) |
| Fallback | **messages JSON** если API недоступен или поле пустое |
| Кто редактирует | **ADMIN only** (как users) |
| Кэш | **Без CDN**; `force-dynamic` на страницах CMS |
| Commit | **Только по явному запросу** |

## Чек-лист выхода

- [x] формулировка своими словами есть
- [x] критерии успеха измеримы
- [x] открытые вопросы закрыты
