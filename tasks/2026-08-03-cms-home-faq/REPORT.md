# REPORT: CMS home + FAQ

Дата: 2026-08-03

Папка задачи: `tasks/2026-08-03-cms-home-faq/`

## Сделано

- Manifest: entity **`home`** (5 полей hero/CTA), **`faq`** (13 полей, 5 Q&A).
- Seed: переводы en/th/ru (+54 строки к существующим 129).
- Frontend: home через CMS + `force-dynamic`; новая **`/[locale]/faq`**.
- Nav: пункт **FAQ** в Header; `nav.faq` + namespace `faq` в messages (fallback).
- E2E: +2 теста (home en, faq ru).
- `PROJECT.md`, `DECISIONS.md`, `backend/README.md`.

## Не в scope

- Footer в CMS.
- Динамическое число FAQ-элементов (фиксировано 5).
- `site.name` / `tagline` в CMS.

## Проверка

```powershell
npm run db:seed -w dogrsc-backend
npm run test:e2e -- content.e2e-spec.ts   # 7 tests
npm run build -w dogrsc-frontend
```

Admin `/content` — страницы **Home hero** и **FAQ** появляются автоматически.
