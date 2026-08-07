# PLAN: map

Дата: 2026-08-02

Папка задачи: `tasks/2026-08-02-map/`

## Шаги

### Prerequisite

1. Infra + backend + reports moderation работают.
2. Google Maps API key (Maps JavaScript API) — положить в `frontend/.env.local` как `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`.

### Backend — public map API

3. **`dto/map-marker.dto.ts`** — `MapMarkerDto`, `MapMarkersResponseDto` (без reporter fields).
4. **`MapService`** (или метод в `ReportsService`) — `findMapMarkers(type)`:
   - query found + lost tables
   - filter APPROVED + coords not null
   - batch load first media per entity → presigned thumbnail URL
5. **`MapPublicController`** — `GET /map/markers` `@Public()`, query `type`.
6. **`MapModule`** → `AppModule` (imports `MediaModule`, `PrismaModule`).

### Seed

7. **`prisma/seed.ts`** — upsert 2 APPROVED map demos с lat/lng (Bangkok ~13.75/100.50 и соседняя точка).

### Frontend

8. **`frontend/.env.example`** — `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=`
9. **`lib/map-api.ts`** — `fetchMapMarkers(type?)`, server fetch, `revalidate: 60`
10. **`components/ReportsMap.tsx`** — client: Google Map, markers, info window, filter chips
11. **`app/[locale]/map/page.tsx`** — RSC wrapper, pass markers + locale strings
12. **`messages/{en,th,ru}.json`** — namespace `map`

### Tests & docs

13. **E2E** `test/map.e2e-spec.ts`:
    - seed/insert APPROVED with coords → in response
    - PENDING excluded
    - no `reporterPhone` in body
    - `?type=found` / `?type=lost`
14. **`npm run build`** backend + frontend; **`openapi:export`**
15. **`backend/README.md`**, **`frontend/README.md`**
16. **`tasks/2026-08-02-map/REPORT.md`**, **`harness/DECISIONS.md`**

## Альтернативы

- **Leaflet + OpenStreetMap:** отвергнута — в DECISIONS зафиксирован Google Maps; смена стека потребует пересмотра решения.
- **Клиент fetch к admin API:** отвергнута — утечка PII и нужен auth; нужен отдельный public DTO.
- **Один merged endpoint vs два (`/found-map`, `/lost-map`):** отвергнуты два URL — один `/map/markers?type=` проще для frontend и кэша.
- **Server-side filter only (без client chips):** отвергнута — лишний round-trip при переключении; dataset маленький, фильтр на клиенте достаточен.
- **Embed iframe Google Maps без JS API:** отвергнута — нет кастомных маркеров и фильтров found/lost.

## Риски

- 🔴 **Нет Google Maps API key** → ДО smoke: завести key в Google Cloud Console (Maps JavaScript API); без key — fallback UI, build не ломаем.
- 🟡 **Presigned thumbnail N+1** → batch media query по списку entity ids в одном сервисном методе.
- 🟡 **Пустая карта после seed** → seed создаёт APPROVED + coords; README описывает smoke.
- 🟢 **Reports без geolocation** → просто не попадают в API; ожидаемое поведение.

## Бюджет

- Файлов: ~18
- Время: ~2–3 ч
- Правило: превысил → стоп и пересмотр

## Чек-лист выхода

- [x] шаги конкретны (сделан/не сделан)
- [x] есть отвергнутые альтернативы с содержательной причиной
- [x] красный риск снят (fallback без key + документация)
- [x] бюджет назначен
