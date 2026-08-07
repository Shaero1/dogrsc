# REPORT: Admin Dogs UX (create + photos + edit save)

Дата: 2026-08-04

Папка: `tasks/2026-08-04-dogs-create-photos/`

## Сделано

### `DogForm.tsx`
- EN validation (JS, `noValidate`) — независимо от активной вкладки
- Edit: green banner «Changes saved» после успешного Save
- Create: guard double submit (`createSubmitted`, loading до unmount)
- Edit upload: validation (MIME + extension fallback), loading, disabled inputs
- Create: file input disabled при save/upload
- Убрана мёртвая ветка «redirect to edit»

### `/dogs/new`
- Flash через `sessionStorage` (`dog-flash.ts`)
- Redirect `/dogs`; partial fail — photoErrors + createdDogId в flash
- Имена файлов в ошибках upload

### `/dogs`
- Flash: «Dog created successfully», «Dog updated successfully», photoErrors banner
- Убран query `photoErrors` (Strict Mode safe)

### `/dogs/[id]/edit`
- Save → flash `dogUpdated` → redirect **`/dogs`**
- Guard double submit (`editSubmitted`)

### `AdminHeader`
- Убран misleading «Sign in»

### Docs
- BRIEF, AUDIT актуализированы

## Не в scope

- Presigned URL TTL 15 min
- Dev-БД cleanup
- Admin e2e

## Проверка

- `npm run build -w dogrsc-admin`
- Backend e2e (без изменений backend)
