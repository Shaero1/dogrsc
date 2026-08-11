# REPORT: пропадание фото после простоя

**Дата:** 2026-08-11  
**Статус:** root cause подтверждён, баг воспроизведён на prod  
**Код не менялся** — только исследование и тесты.

---

## Симптом

После **простоя 15+ минут** (вкладка открыта, пользователь на другом разделе или на главной) при переходе в раздел с карточками (**Our Dogs**, **Stories**, **Found a Dog**) фотографии **не отображаются** — пустые блоки в карточках. **F5 (полная перезагрузка)** обычно восстанавливает фото.

---

## Root cause (подтверждено)

**Presigned S3 URL (TTL 15 мин) попадают в prefetched / client-cached RSC payload и не обновляются после простоя.**

| Компонент | Значение |
|-----------|----------|
| Presigned TTL | **900 сек (15 мин)** — `backend/src/media/media.constants.ts` |
| Новая подпись | на **каждый** API-запрос (разные `X-Amz-Signature`) |
| Кэш fetch на сервере | `next: { revalidate: 30–60 }` в `api.ts`, `stories-api.ts`, `reports-api.ts` |
| Prefetch | все `<Link>` в `Header.tsx` — Next.js prefetch RSC (`/en/dogs?_rsc=...`) |
| Рендер фото | `<img src={presignedUrl}>` без `onError` |

### Цепочка бага

```
T=0     Пользователь открывает Home
        → Next.js prefetch /en/dogs с presigned URL (X-Amz-Date=T0)
T=0..15m Простой (читает главную, другой раздел, вкладка в фоне)
T>15m   Клик «Our Dogs» (client navigation)
        → берётся stale prefetched RSC с URL от T0
        → S3 отвечает 403 (подпись истекла)
        → <img> в DOM, naturalWidth=0, визуально пустая карточка
F5      → полный SSR → свежие presigned URL → фото снова видны
```

---

## Тесты и результаты

### 1. Воспроизведение на prod (главный тест)

**Сценарий:** Home → простой **16 мин** → клик «Our Dogs» (client nav)

| Метрика | Результат |
|---------|-----------|
| Prefetch при загрузке Home | ✅ `/en/dogs?_rsc=...` (2 запроса, ~683 ms и ~1446 ms) |
| Фото после 16 мин idle | ❌ **3/3 broken**, `naturalWidth=0` |
| `X-Amz-Date` в `<img>` | `20260811T100556Z` (стale payload) |
| F5 после бага | ✅ новые URL `20260811T102234Z`, все 3 фото загружены |

### 2. Истечение presigned URL (контроль)

| Проверка | Результат |
|----------|-----------|
| URL подписан в T0, GET сразу | **200** |
| Тот же URL через **16 мин** | **403** |
| Свежий SSR после 16 мин | новые даты, GET **200** |
| Симуляция expired URL в браузере (`X-Amz-Date=20200101...`) | `Image.onerror`, `w=0` — **идентично багу** |

### 3. Server Data Cache (SSR / F5)

Последовательные SSR-запросы `/en/dogs`:

| Время | X-Amz-Date в карточках | GET фото |
|-------|------------------------|----------|
| T0 | `093947Z` | 200 |
| T+3s | `093947Z` (cache hit) | 200 |
| T+65s | `093947Z` (stale SWR) | 200 |
| T+68s | `094124Z` (revalidate) | 200 |
| T+130s | `093704Z` unchanged | 200 |
| T+16min F5 | **новые** даты | 200; старый URL → **403** |

**Вывод:** F5 после простоя **обычно** чинит, потому что SSR запрашивает свежие URL. Client nav — **нет**.

### 4. Client Router Cache (без длинного простоя)

| Сценарий | Поведение |
|----------|-----------|
| Dogs → About → Dogs (< 5 сек) | **те же** `X-Amz-Signature` — cache hit |
| Dogs → About → Dogs (65–120 сек) | **новые** подписи — cache refresh |
| Home → Dogs (prefetch, < 16 мин) | фото OK |
| Home → **16 мин idle** → Dogs | **баг воспроизведён** |

Порог бага: **~15 мин** — совпадает с presigned TTL, не с `revalidate: 60`.

### 5. Ложные срабатывания (не баг)

Часть карточек **стабильно** без фото — нет медиа в API:

- Stories: `luna-temple`, `timely-report` — `cover: null`
- Found Dog: 2/7 отчётов без `thumbnailUrl`

Отличие: текст **«No photo»** в `.glass-card-media-empty`, а не пустой `<img>`.

---

## Почему «иногда F5 не помогает» (редко)

1. **Server Data Cache SWR** — до ~60–130 сек отдаёт stale JSON (не 15 мин, но при cold start API revalidation может падать).
2. **Путаница с «No photo»** — реально нет фото в данных.
3. **Layout branding** (`getBranding()` в `layout.tsx`) — hero/logo один раз при первой загрузке; не влияет на карточки, но похожий симптом на сайте.

---

## Как подтвердить в DevTools (когда баг случится)

1. **Network → Img** — статус **403** / `AccessDenied` на `storageapi.dev` → протухший presigned.
2. В Elements: `<img src="...X-Amz-Date=...">` — сравнить Date с текущим UTC; если прошло **> 15 мин** → истёк.
3. Client nav vs F5: после F5 в HTML **новый** `X-Amz-Date`, фото 200.

---

## Рекомендуемый fix (не реализован)

### Быстрый (frontend)

1. `cache: 'no-store'` во всех fetch со presigned URL:
   - `frontend/lib/api.ts`
   - `frontend/lib/stories-api.ts`
   - `frontend/lib/reports-api.ts`
   - `frontend/lib/map-api.ts`
2. `prefetch={false}` на nav-ссылках в `Header.tsx` **или** глобально отключить prefetch для страниц с медиа.

### Надёжный (backend + frontend)

Стабильный URL медиа через proxy: `GET /api/v1/media/:id/file` (без presigned в JSON). Presigned — только для upload.

### Дополнительно

- Увеличить presigned TTL (симптом сгладит, root cause не уберёт).
- `onError` на `<img>` + повторный fetch URL (костыль).

---

## Затронутые файлы

| Файл | Роль |
|------|------|
| `backend/src/media/media.constants.ts` | TTL 900s |
| `backend/src/media/media.service.ts` | presign на каждый read |
| `frontend/lib/api.ts` | dogs list + revalidate 60 |
| `frontend/lib/stories-api.ts` | stories + revalidate 60 |
| `frontend/lib/reports-api.ts` | reports + revalidate 30 |
| `frontend/components/Header.tsx` | prefetch всех nav Link |
| `frontend/app/[locale]/dogs/page.tsx` | `<img src={dog.media[0].url}>` |
| `frontend/components/StoryCard.tsx` | cover.url |
| `frontend/components/ReportListCard.tsx` | thumbnailUrl |

---

## Итог

| Вопрос | Ответ |
|--------|-------|
| Причина после простоя? | **Stale prefetched/client-cached RSC с presigned URL старше 15 мин** |
| Воспроизведено? | **Да** — Home + 16 min idle + client nav → 3/3 фото broken |
| F5 помогает? | **Да** в том же тесте — свежий SSR |

---

## Fix (2026-08-11)

1. `cache: 'no-store'` — `frontend/lib/api.ts`, `stories-api.ts`, `reports-api.ts`, `map-api.ts`
2. `prefetch={false}` — `Header.tsx` (все nav), `page.tsx` (CTA `/dogs`)

Долгосрочно: stable proxy `/api/v1/media/:id/file` вместо presigned в JSON.
