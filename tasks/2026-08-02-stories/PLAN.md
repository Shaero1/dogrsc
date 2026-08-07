# PLAN: /stories

Дата: 2026-08-02

Папка задачи: `tasks/2026-08-02-stories/`

## Шаги

### Frontend — page

1. **`app/[locale]/stories/page.tsx`** — RSC; массив demo stories с slug optional; карточки + CTA block.
2. Конфиг историй в page (не i18n):
   - story 1 → slug `luna`
   - story 2 → slug `mango`
   - story 3 → без slug (community rescue narrative)

### i18n & nav

3. **`messages/en.json`** — `nav.stories` + namespace `stories` (title, subtitle, story1–3 title/body, readDogProfile, ctaDonate, ctaDogs).
4. **`messages/th.json`**, **`messages/ru.json`** — те же ключи.
5. **`components/Header.tsx`** — добавить `{ key: 'stories', href: '/stories' }` после `about` или рядом с `dogs`.

### Docs & close

6. **`frontend/README.md`** — route `/stories` + smoke URL.
7. **`npm run build -w dogrsc-frontend`**
8. **`tasks/2026-08-02-stories/REPORT.md`**
9. **`harness/DECISIONS.md`** — static i18n stories; defer CMS.

## Альтернативы

- **Fetch rescueStory из `GET /dogs`:** отвергнута — stories = curated editorial, не все собаки; добавляет зависимость от API и усложняет i18n (dog JSON уже локализован, но список stories другой).
- **ContentTranslation CMS сейчас:** отвергнута — следующий пункт roadmap; static i18n закрывает страницу за ~30 мин.
- **Убрать stories из nav вместо страницы:** отвергнута — пользователь выбрал реализацию `/stories`.

## Риски

- 🟢 **Placeholder тексты** → осмысленные заглушки en/th/ru; README — замена заказчиком.
- 🟢 **Broken dog links без seed** → README smoke требует `db:seed`; slugs совпадают с seed.
- 🟢 **Nav переполнение** → flex-wrap уже есть в Header.

## Бюджет

- Файлов: ~7
- Время: ~30–45 мин
- Правило: превысил → стоп и пересмотр

## Чек-лист выхода

- [x] шаги конкретны (сделан/не сделан)
- [x] есть отвергнутая альтернатива с содержательной причиной
- [x] красных рисков нет
- [x] бюджет назначен
