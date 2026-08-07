# frontend (dogrsc-frontend)

Public website for Doge Rescue — Next.js App Router, i18n **en / th / ru**.

Часть монорепо `dogrsc`. Backend: `../backend/`.

## Setup

```powershell
cd c:\dogrsc
npm install
cd frontend
copy .env.example .env.local
```

## Development

Из корня монорепо:

```powershell
npm run dev:frontend
```

Или из `frontend/`:

```powershell
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — redirects to `/en`.

| URL | Locale |
|-----|--------|
| `/en` | English |
| `/th` | Thai |
| `/ru` | Russian |

Language switcher in the footer preserves the current path.

## Public API

Set `NEXT_PUBLIC_API_URL` in `.env.local` (default `http://localhost:4000/api/v1`).

| Route | Description |
|-------|-------------|
| `/[locale]/dogs` | Dog catalog (from backend `GET /dogs`) |
| `/[locale]/dogs/[slug]` | Dog profile (`GET /dogs/:slug`) |
| `/[locale]/found-dog` | Found dog report form (Server Action → API) |
| `/[locale]/lost-dog` | Lost dog report form |
| `/[locale]/found-dog/thank-you`, `/lost-dog/thank-you` | Post-submit confirmation |
| `/[locale]/map` | Found/lost map (`GET /map/markers`; Google Maps key optional for build) |
| `/[locale]/donate` | Bank info (i18n) + crypto addresses (`GET /donate/crypto-addresses`) |
| `/[locale]/about` | About page (static i18n content) |
| `/[locale]/stories` | Rescue stories (static i18n; links to demo dogs) |
| `/[locale]/contact` | Contact info (static i18n, mailto/tel links) |

**Prerequisite:** backend running, `npm run db:seed -w dogrsc-backend` for demo dogs.

Smoke:

```powershell
npm run dev:backend
npm run dev:frontend
# http://localhost:3000/en/dogs
# http://localhost:3000/en/dogs/luna
# http://localhost:3000/en/found-dog
# http://localhost:3000/en/map
# http://localhost:3000/en/donate
# http://localhost:3000/en/about
# http://localhost:3000/en/stories
# http://localhost:3000/en/contact
```

Optional: set `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` in `.env.local` to render the map (Maps JavaScript API).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server |
| `npm run build` | Production build |
| `npm run start` | Production server |
| `npm run lint` | ESLint |

## i18n

- Library: [next-intl](https://next-intl.dev/)
- Messages: `messages/en.json`, `messages/th.json`, `messages/ru.json`
- Routing: `i18n/routing.ts`, `middleware.ts`
- Localized links: `@/i18n/navigation`

Details: `tasks/00-bootstrap-decisions/I18N.md`

## Related

| Path | Role |
|------|------|
| `../backend/` | REST API |
| `../admin/` | Admin UI |
| `../infra/` | Docker Compose (TODO) |
