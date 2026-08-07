# TEST REPORT: reports-public

Дата: 2026-08-05  
Среда: локальный dev (Docker infra up, backend :4000, frontend :3000, admin :3001)

## Сводка

| Область | Результат |
|---------|-----------|
| Backend e2e | ✅ 53/53 |
| Public списки + detail API | ✅ |
| Мгновенная публикация (логика) | ✅ (create → ACTIVE) |
| Hide / restore admin | ✅ |
| Frontend списки + форма UI | ✅ |
| **Submit формы (POST)** | ❌ **блокер env** |
| **Карта UI** | ⚠️ нет Google Maps key |
| Пагинация public list | ⚠️ только 50 из 101+ |

---

## 1. Автотесты

```text
npm run test:e2e -w dogrsc-backend  →  11 suites, 53 tests passed
```

Покрытие: public GET, create ACTIVE, captcha skip в e2e, hide, map filters, dashboard `reportsActive`.

---

## 2. API (live на :4000)

| Проверка | Результат |
|----------|-----------|
| `GET /found-reports` | ✅ total=101, items с description |
| `GET /lost-reports` | ✅ total=63 |
| `GET /found-reports/:id` | ✅ телефон в ответе (`+66987654321`) |
| `GET /map/markers` | ✅ 48 маркеров (ACTIVE/VERIFIED + coords) |
| `POST /found-reports` | ❌ **400** `"Captcha is not configured on the server"` |
| Admin login + list | ✅ found total=115 |
| Admin `GET .../:id` | ✅ description, media, status |
| Dashboard `reportsActive` | ✅ 173 |
| `PATCH` → HIDDEN | ✅ public GET → 404 |
| `PATCH` → ACTIVE (restore) | ✅ снова public |

**Причина падения POST:** в `backend/.env` **нет** `CAPTCHA_SECRET_KEY`.  
В `backend/.env.example` ключ есть; в `frontend/.env.local` — `NEXT_PUBLIC_TURNSTILE_SITE_KEY` есть.

**Исправление (1 строка):**
```env
CAPTCHA_SECRET_KEY=1x0000000000000000000000000000000AA
```
После добавления — **перезапустить backend**.

---

## 3. Frontend (браузер + HTTP)

| URL | Статус | Наблюдение |
|-----|--------|------------|
| `/en/found-dog` | ✅ 200 | Заголовок, кнопка «Add report», ~50 карточек «View report» |
| `/en/lost-dog` | ✅ 200 | Кнопка «Add report» в HTML |
| `/en/found-dog/new` | ✅ 200 | Форма: имя, телефон, описание, geolocation, Submit; Turnstile в HTML |
| `/en/found-dog/[id]` | ✅ 200 | Телефон заявителя **в HTML** |
| `/en/map` | ⚠️ | Fallback: **нет** `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` |
| `/en` (home) | ✅ | Ссылки на `found-dog/new` и `lost-dog/new` |

Список found показывает **limit=50** (hardcoded в `fetchPublicFoundReports`), в БД **101+** — остальные не видны без пагинации.

На публичном списке много **мусора от e2e** («Small dog seen near the market entrance», «Found marker», «Pending found for dashboard test») — это старые/тестовые ACTIVE-записи, не баг UI.

---

## 4. Admin (браузер + API)

| Проверка | Результат |
|----------|-----------|
| Login admin | ✅ → dashboard |
| Dashboard «Live reports» | ✅ 173 |
| `/reports` | ✅ вкладки Found/Lost, фильтр Active/Verified/Hidden |
| `/reports/found/[id]` | ✅ после login: description, контакты, кнопки Hide/Verify (client render) |
| Клик по строке таблицы | ⚠️ не проверен в UI (таблица не попала в a11y snapshot; API list OK) |

Текст dashboard subtitle всё ещё говорит «moderation queue» — косметика, не функциональный баг.

---

## 5. Что работает по задумке BRIEF

- ✅ Found/Lost — **публичные списки**, не только формы
- ✅ Кнопка «Add report» → `/new`
- ✅ Detail с **контактами** (телефон на странице)
- ✅ **Нет admin-gate** — ACTIVE сразу в public API
- ✅ Admin: hide удаляет с сайта; detail с полными данными
- ✅ Map API без фильтра APPROVED (ACTIVE|VERIFIED + coords)

---

## 6. Что не работает / блокеры

### P0 — submit формы
**POST падает** без `CAPTCHA_SECRET_KEY` в `backend/.env`.  
Форма на `/found-dog/new` отображается, но отправка через Server Action не пройдёт.

### P1 — карта
Без `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` — жёлтый баннер вместо карты.  
API `/map/markers` отдаёт 48 точек — данные есть, UI карты нет.

### P2 — пагинация
Public list: max 50 записей, UI «следующая страница» нет.  
При 100+ отчётах часть не видна.

### P2 — dev onboarding
`dev-prepare` копирует `.env` только если файла **нет**.  
Существующий `backend/.env` не получил CAPTCHA — легко пропустить после апдейта.

---

## 7. Рекомендации (не делал в этом прогоне)

1. Добавить `CAPTCHA_SECRET_KEY` в `backend/.env` + restart backend — **сразу**
2. Добавить `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` для карты (или принять fallback в dev)
3. Public list: pagination или `limit` + «Load more»
4. Admin `/reports`: пагинация (API есть, UI нет)
5. Опционально: cleanup e2e-отчётов в dev БД или filter по email `@example.com` на public list

---

## 8. Чеклист BRIEF vs факт

| Критерий | Факт |
|----------|------|
| Public list + `/new` + detail | ✅ |
| Captcha на POST | ⚠️ код есть, **env backend не настроен** |
| Submit → сразу public | ✅ (e2e + существующие ACTIVE в БД) |
| Admin detail + hide | ✅ |
| Нет Approve-gate | ✅ |
| e2e + build | ✅ (build ранее; e2e сейчас 53/53) |

**Вердикт:** реализация **в целом рабочая**, но **отправка новых отчётов через UI заблокирована** отсутствием `CAPTCHA_SECRET_KEY` в backend `.env`. Карта без Google API key — второй известный gap.
