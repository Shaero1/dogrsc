# BRIEF: Social media links on contact (CMS)

Дата: 2026-08-10

Папка задачи: `tasks/2026-08-10-contact-social-cms/`

## Формулировка своими словами

Добавить в CMS страницы **contact** поля для ссылок на соцсети (Facebook, Instagram, LINE и т.д.) и отобразить их на публичной странице `/contact` с иконками/ссылками.

## Контекст

- Contact page уже на ContentTranslation (`tasks/2026-08-03-cms`).
- Email/phone/address — в CMS; соцсети — новые поля.

## Scope

- Manifest + seed: поля social (label + URL или structured keys).
- Admin content editor — новые inputs для contact.
- Frontend `/contact` — блок social links из CMS + fallback messages.

## Критерии успеха

- [x] Admin редактирует social links для en/th/ru.
- [x] Frontend показывает ссылки на `/contact`.
- [x] Пустые поля не рендерятся.
- [x] REPORT.

## Открытые вопросы

| Вопрос | Решение |
|--------|---------|
| Какие сети | Facebook, Instagram, LINE (MVP) |
| Иконки | Inline SVG или emoji/text labels |

## Чек-лист выхода

- [x] scope и критерии определены
- [x] PLAN утверждён (задним числом)
