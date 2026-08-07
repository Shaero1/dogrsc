# BRIEF: reports-public (found/lost lists, instant publish, captcha)

Дата: 2026-08-05  
Утверждено пользователем: 2026-08-05

## Формулировка

Found/Lost — публичные каталоги (как `/dogs`): список + карточка + форма по кнопке «Добавить». Публикация **сразу** после submit + captcha. Admin **не** подтверждает публикацию — только просмотр, hide, optional verify. Карта — все active отчёты с coords.

## Критерии успеха

- [ ] Public list + detail + `/new` (found & lost)
- [ ] Captcha на POST; без токена → 400
- [ ] Submit → ACTIVE → сразу public + map (coords)
- [ ] Admin detail + hide/verify; нет Approve-gate
- [ ] e2e + build

См. объединённый текст в чате 2026-08-05.
