# BRIEF: map

Дата: 2026-08-02

Папка задачи: `tasks/2026-08-02-map/`

## Формулировка своими словами

Публичная страница **`/[locale]/map`** с Google Maps: на карте видны только **одобренные** (`APPROVED`) объявления found/lost, у которых есть координаты. Посетитель переключает фильтр Found / Lost / All и открывает маркер с кратким описанием (без телефона и email автора). Данные — read-only API; matching и редактирование — не в этой задаче.

## Контекст

- **Reports** (`08-02-reports`): формы, модерация, optional geolocation — готово.
- **Nav** уже ведёт на `/map`, страницы нет (404).
- **DECISIONS:** карты — **Google Maps** (не OSM/Leaflet).
- **Schema:** `FoundReport` / `LostReport` — `latitude`, `longitude`, `status`; миграций не нужно.
- Seed сейчас: 2× `PENDING` reports **без координат** — для карты нужны demo **APPROVED** pins.

## Scope

### Backend

**Public (`@Public()`):**

| Method | Path | Назначение |
|--------|------|------------|
| GET | `/api/v1/map/markers` | Маркеры для карты |

Query `type`: `found` \| `lost` \| `all` (default `all`).

Условия выборки:
- `status = APPROVED`
- `latitude` и `longitude` not null

**Публичный DTO** (без PII):
- `id`, `type` (`found`|`lost`), `description`, `latitude`, `longitude`, `createdAt`
- optional `thumbnailUrl` — первое фото report, если есть

### Frontend

- `/[locale]/map` — RSC fetch markers + client map component
- Фильтры: All / Found / Lost (клиентская фильтрация по уже загруженным markers)
- Info window / popup: тип, дата, описание (truncate ~200 chars), миниатюра если есть
- i18n namespace `map` (en/th/ru)
- Env: `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
- Без ключа — понятное сообщение, не падать при build

### Seed

- 1× `FoundReport` `APPROVED` с координатами (Bangkok area)
- 1× `LostReport` `APPROVED` с координатами (рядом, но другая точка)
- Отдельные marker emails (`seed-map-found@…`, `seed-map-lost@…`), не трогаем pending demo

### Не включаем

- Matching found ↔ lost
- Clustering / heatmap
- Admin map view
- Публичный список reports без карты
- Редактирование координат после submit

## Критерии успеха

- [ ] `GET /map/markers` — только APPROVED + lat/lng; без phone/email/name
- [ ] Query `type` фильтрует found/lost/all
- [ ] `/en/map` рендерит карту с seed markers (при API key + seed)
- [ ] Фильтры Found/Lost/All на UI работают
- [ ] PENDING / без координат не попадают на карту
- [ ] e2e backend + `npm run build` (frontend)
- [ ] README smoke + `.env.example` для Maps key

## Открытые вопросы

| Вопрос | Решение (MVP) |
|--------|----------------|
| Показывать контакт на карте? | **Нет** — только description + дата + тип |
| Reports без координат | **Не показываем** |
| Центр карты по умолчанию | **Bangkok** (13.7563, 100.5018), zoom fit bounds если есть markers |
| Библиотека Maps | **`@vis.gl/react-google-maps`** (официальный React wrapper) |
| Thumbnail в popup | **Да**, если media есть |
| Нет API key в dev | **Fallback UI** — текст «configure GOOGLE_MAPS_API_KEY» |
| Seed | **2 APPROVED** с координатами |

## Чек-лист выхода

- [x] формулировка своими словами есть
- [x] критерии успеха измеримы
- [x] открытые вопросы закрыты
