# BRIEF: Header typography (пропорции)

Дата: 2026-08-10

Папка задачи: `tasks/2026-08-10-header-typography/`

## Формулировка своими словами

Увеличить текст в шапке **пропорционально логотипу**: название сайта и nav читаются мелко на glass-фоне; tagline в header не добавляем.

## Scope

- `Header.tsx` only — минимальный diff.
- Название: `text-xl` mobile / `text-2xl` sm+ (было `text-lg`).
- Nav: `text-base` (было `text-sm`).
- Padding: `py-3` / `sm:py-3.5` (было `py-4`).
- Tagline в header — **не** включаем.

## Критерии успеха

- [ ] Название визуально балансирует logo 40/48px.
- [ ] Nav 16px, читаем на glass и solid.
- [ ] Без tagline в header.
- [ ] REPORT.

## PLAN утверждён

2026-08-10 — пользователь «делай» после согласования пропорций в чате.
