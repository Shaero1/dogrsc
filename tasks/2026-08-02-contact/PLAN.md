# PLAN: contact

Дата: 2026-08-02

Папка задачи: `tasks/2026-08-02-contact/`

## Шаги

1. **`app/[locale]/contact/page.tsx`** — RSC, секции контактов, `mailto:` / `tel:` links, CTA to `/found-dog`.
2. **`messages/en.json`** — namespace `contact`.
3. **`messages/th.json`**, **`messages/ru.json`** — те же ключи.
4. **`frontend/README.md`** — route + smoke URL.
5. **`npm run build -w dogrsc-frontend`**
6. **`tasks/2026-08-02-contact/REPORT.md`**, **`harness/DECISIONS.md`**

## Альтернативы

- **Contact form + Server Action → email API:** отвергнута — нужен mail provider, backend endpoint, spam control; шире MVP.
- **ContentTranslation CMS:** отвергнута — как about; отдельная задача.
- **Только email без phone/line:** отвергнута — в Таиланде LINE часто основной канал; placeholder полезен.

## Риски

- 🟢 **Placeholder contacts** → README: заменить в messages перед production.

## Бюджет

- Файлов: ~6
- Время: ~30 мин

## Чек-лист выхода

- [x] шаги конкретны
- [x] отвергнутая альтернатива с причиной
- [x] бюджет назначен
