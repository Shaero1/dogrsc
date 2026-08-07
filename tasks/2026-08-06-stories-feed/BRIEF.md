# BRIEF: Stories feed

Дата: 2026-08-06

## Цель

Заменить фиксированные 3 CMS-слота на **настоящую ленту** rescue stories: admin добавляет записи, они сохраняются в БД и отображаются на `/stories` с пагинацией и детальными страницами.

## Утверждённые решения

- JSONB `content` (en/th/ru: title + body), plain text
- Excerpt auto из body (~160 символов)
- Без pin, без markdown
- Unpublish вместо delete; DELETE только ADMIN
- Intro страницы: CMS `stories` — только title + subtitle
- Pagination: 20; public revalidate 60
- Роли admin: ADMIN + STAFF
- Optional cover photo (Media entityType `story`)
- Optional link to published dog

## Не в скоупе

Markdown, tags, RSS, comments, autopull from Dog.rescueStory
