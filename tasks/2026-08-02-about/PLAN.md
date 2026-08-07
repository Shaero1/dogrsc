# PLAN: about

Дата: 2026-08-02

Папка задачи: `tasks/2026-08-02-about/`

## Шаги

### Frontend — page

1. **`app/[locale]/about/page.tsx`** — RSC, `setRequestLocale`, `getTranslations('about')`.
2. Layout: hero, mission, work list, help section + CTA links (`Link`).

### i18n

3. **`messages/en.json`** — namespace `about` (полный набор ключей).
4. **`messages/th.json`**, **`messages/ru.json`** — те же ключи, переводы/placeholder.

### Docs & close

5. **`frontend/README.md`** — route `/about` + smoke URL.
6. **`npm run build -w dogrsc-frontend`**
7. **`tasks/2026-08-02-about/REPORT.md`**
8. **`harness/DECISIONS.md`** — static i18n for about (defer CMS).

## Альтернативы

- **ContentTranslation + admin CMS:** отвергнута — шире скоуп (API, admin UI, seed rows); static i18n закрывает nav 404 и MVP тексты быстрее; CMS — отдельная задача.
- **Один HTML blob в messages:** отвергнута — структурированные ключи проще для переводчиков и типографики.
- **Client component:** отвергнута — контент статический, RSC достаточно.

## Риски

- 🟢 **Placeholder тексты** → осмысленные заглушки на всех локалях; README отмечает замену заказчиком.
- 🟢 **Дублирование с home tagline** → about расширяет миссию, не копирует hero один в один.

## Бюджет

- Файлов: ~6
- Время: ~30–45 мин
- Правило: превысил → стоп и пересмотр

## Чек-лист выхода

- [x] шаги конкретны (сделан/не сделан)
- [x] есть отвергнутая альтернатива с содержательной причиной
- [x] красных рисков нет
- [x] бюджет назначен
