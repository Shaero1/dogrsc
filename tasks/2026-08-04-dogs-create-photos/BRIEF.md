# BRIEF: Create dog + photos in one Save (variant A)

Дата: 2026-08-04

Папка: `tasks/2026-08-04-dogs-create-photos/`

## Формулировка

На **`/dogs/new`** staff выбирает тексты и **несколько фото**, нажимает **Save один раз** → создаётся собака, затем клиент загружает все файлы через `POST /admin/media`. Redirect на **`/dogs`**; при частичной ошибке upload — баннер на list + ссылка edit.

## Scope

- **Admin `DogForm`:** create — multi-file, preview, remove; edit — success feedback, EN validation, upload validation
- **`/dogs/new`:** create → upload loop → flash → `/dogs`
- **`/dogs`:** баннеры create success / photoErrors (sessionStorage)
- **Backend:** без изменений

## Критерии успеха

- [ ] New dog + photos → Save → `/dogs` + «Dog created»
- [ ] Partial upload fail → list banner + link edit
- [ ] Edit Save → «Changes saved»
- [ ] EN validation при любой вкладке
- [ ] Double Save на create не дублирует собаку
