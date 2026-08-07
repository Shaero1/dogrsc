# REPORT — /stories

## Что сделано

### Frontend
- **`app/[locale]/stories/page.tsx`** — 3 story cards (Luna, Mango, community report); links на `/dogs/luna`, `/dogs/mango`; CTA Donate / Our dogs
- **`messages/{en,th,ru}.json`** — namespace `stories` + `nav.stories`
- **`components/Header.tsx`** — пункт Stories в nav

Backend без изменений.

## Проверки

```powershell
npm run build -w dogrsc-frontend   # OK — /en|th|ru/stories
# smoke: http://localhost:3000/en/stories
# links: /dogs/luna, /dogs/mango (нужен db:seed)
```

## Не в скоупе

- CMS ContentTranslation
- Фото в карточках
- Fetch rescueStory из dogs API

## Следующий шаг по roadmap

CMS (ContentTranslation) или CI/CD + staging.
