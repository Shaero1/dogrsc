# PLAN: Bank donation details → Donations admin

Дата: 2026-08-10

> PLAN утверждён задним числом (commit `4a8de10`).

## Шаги

1. Admin donations page — секция Bank transfer details (reuse content API).
2. Убрать или скрыть `donate-bank` из Content nav/editor (если дублировало).
3. Проверить frontend donate — bank props из CMS без изменений.
4. Smoke: edit bank in Donations → reload `/donate`.

## Риски

- 🟢 Public API и entityId не меняются — только admin UX.

## Проверка

- Admin `/donations` → bank fields save.
- Frontend donate modal — новые значения.
