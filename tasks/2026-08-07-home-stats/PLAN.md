# PLAN: Home stats — безопасное внедрение

Дата: 2026-08-07

Зависимости: текущий CMS (`home`), dashboard counts (reference only), stories feed.

## Phase 1 — MVP (рекомендуется)

### 1. Backend

| Файл | Действие |
|------|----------|
| `backend/src/stats/stats.module.ts` | новый модуль |
| `backend/src/stats/stats.service.ts` | агрегация метрик (Promise.all counts) |
| `backend/src/stats/stats-public.controller.ts` | `GET stats/home` |
| `backend/src/stats/dto/home-stats.dto.ts` | OpenAPI response |
| `backend/src/stats/home-metrics.registry.ts` | enum keys + map key → query |
| `backend/src/app.module.ts` | import StatsModule |
| `backend/test/stats.e2e-spec.ts` | public endpoint, counts после seed |

**Без изменений:** `dashboard.service.ts` (минимизируем риск регрессии admin).

Metric registry (пример):

```typescript
export const HOME_METRIC_KEYS = [
  'dogs_adopted',
  'dogs_in_care',
  'dogs_available',
  'donations_confirmed_total',
  'donations_confirmed_month',
  'reports_active',
  'stories_published',
] as const;
```

### 2. CMS

| Файл | Действие |
|------|----------|
| `content-pages.manifest.ts` | добавить поля stats (см. BRIEF) |
| `content-seed-data.ts` | HOME: defaults `statsSectionEnabled: 'false'`, demo labels en/th/ru |
| `backend/test/content.e2e-spec.ts` | +1 assert: home manifest содержит stat1Enabled |

Поля home (additive):

```
statsSectionEnabled, statsSectionTitle,
stat1Enabled, stat1Metric, stat1Label, stat1Offset,
stat2Enabled, stat2Metric, stat2Label, stat2Offset,
stat3Enabled, stat3Metric, stat3Label, stat3Offset,
stat4Enabled, stat4Metric, stat4Label, stat4Offset,
```

Label в CMS admin: подсказка «Use `{value}` for the number».

### 3. Frontend

| Файл | Действие |
|------|----------|
| `frontend/lib/stats-api.ts` | `fetchHomeStats()` |
| `frontend/lib/home-stats.ts` | resolve slots: CMS + API → `{ label, value }[]` |
| `frontend/components/HomeStatsSection.tsx` | grid 2×2 / 4 col |
| `frontend/app/[locale]/page.tsx` | fetch stats + render section |
| `frontend/messages/{en,th,ru}.json` | fallback keys для stats |

**Логика resolve:**

```typescript
// pseudo
if (!cms.statsSectionEnabled) return [];
const api = await fetchHomeStats();
return [1,2,3,4]
  .filter(n => cms[`stat${n}Enabled`] === 'true')
  .map(n => ({
    label: cms[`stat${n}Label`].replace('{value}', format(api[cms[`stat${n}Metric`]] + offset)),
    // или: label template split — display big number + caption
  }));
```

**UI (минимальный):**

```
[ Hero как сейчас ]

--- stats (optional) ---
|  42+   |  12   |  1,500 THB |  3   |
| rescued| need  | donated    | stories|
```

Число крупно, подпись из label (или label = только подпись, value отдельно — проще для стилей).

### 4. Admin UX (без новых страниц)

- Manifest label: **Home hero & stats**
- Content page form — те же text inputs; для `statNMetric` dropdown можно **Phase 1.1** (пока free text с валидацией на frontend)

### 5. Порядок деплоя (zero-downtime)

1. Deploy backend (`GET /stats/home`) — home ещё не вызывает
2. Deploy frontend с компонентом, но seed `statsSectionEnabled=false`
3. `db:seed` — новые CMS keys
4. Admin включает stats в `/content` → проверка на staging
5. При необходимости — включить demo stats в seed

### 6. Rollback

- Выключить `statsSectionEnabled` в CMS — мгновенно без redeploy
- Откат frontend — hero без изменений

## Phase 2 (optional, позже)

- `statNMetric` dropdown в admin Content UI
- Refactor: `StatsService` shared с dashboard
- Manual-only mode (`statNManualValue` без metric key)
- Redis cache TTL 60s для `/stats/home`

## Phase 3 (optional)

- Таблица `SiteCounter` + admin `/settings/counters` CRUD
- Произвольное число слотов, reorder drag-drop

## Тест-план

```powershell
npm run test:e2e -- stats.e2e-spec.ts
npm run test:e2e -- content.e2e-spec.ts
npm run build -w dogrsc-backend
npm run build -w dogrsc-frontend
npm run db:seed -w dogrsc-backend
```

Manual:

1. `/en` — без stats (default)
2. Admin Content → home → enable 3 stats → save
3. `/en` — блок виден, числа совпадают с БД
4. `/ru` — локализованные подписи
5. Backend down / 500 — home hero работает, stats скрыты (try/catch)

## Оценка diff

~15 файлов, без migration (если только CMS keys). **Нулевая migration** — главный фактор «без вреда».

## Demo seed (если утвердят показ по умолчанию)

| Slot | Metric | Label (en) | Offset |
|------|--------|------------|--------|
| 1 | dogs_adopted | Dogs found a home | 120 |
| 2 | dogs_available | Looking for adoption now | 0 |
| 3 | stories_published | Rescue stories shared | 0 |

Offset 120 = «мы спасли 120+ до CRM + adopted из БД».
