# BRIEF: contact

Дата: 2026-08-02

Папка задачи: `tasks/2026-08-02-contact/`

## Формулировка своими словами

Публичная страница **`/[locale]/contact`**: как с нами связаться — email, телефон, мессенджеры, часы работы, адрес (placeholder). Контент на **en/th/ru** через static i18n. Nav ведёт на `/contact` — сейчас 404. **Без** формы обратной связи и email backend на MVP.

## Контекст

- **About/donate:** static i18n — принятый паттерн для статических страниц.
- **I18N.md:** email-шаблоны — этап 2; contact form + notifications — не MVP.
- **Header** — ссылка `/contact` есть.
- Последняя «дыра» в основной nav MVP.

## Scope

### Frontend only

- **`app/[locale]/contact/page.tsx`**
- **`messages/{en,th,ru}.json`** — namespace `contact`:
  - `title`, `subtitle`
  - `reachTitle` — секция контактов
  - `emailLabel`, `emailValue` (+ `mailto:` link)
  - `phoneLabel`, `phoneValue` (+ `tel:` link)
  - `lineLabel`, `lineValue` (optional messenger placeholder)
  - `hoursTitle`, `hoursBody`
  - `addressTitle`, `addressBody`
  - `noteBody` — для срочных случаев → `/found-dog`
- CTA link → report found dog

### Не включаем

- Contact form POST / email sending
- Backend / ContentTranslation CMS
- Google Maps embed для адреса
- reCAPTCHA / spam protection

## Критерии успеха

- [ ] `/en/contact`, `/th/contact`, `/ru/contact` — без 404
- [ ] Nav «Contact» работает
- [ ] mailto/tel ссылки кликабельны
- [ ] `npm run build -w dogrsc-frontend`
- [ ] README smoke

## Открытые вопросы

| Вопрос | Решение (MVP) |
|--------|----------------|
| Форма на странице? | **Нет** — только контактные данные |
| Откуда данные? | **Static i18n** |
| Реальные контакты? | **Placeholder** (dev); заказчик заменит в messages |
| Backend | **Без изменений** |

## Чек-лист выхода

- [x] формулировка своими словами есть
- [x] критерии успеха измеримы
- [x] открытые вопросы закрыты
