# admin (dogrsc-admin)

Administrative panel for Doge Rescue — Next.js, **English UI only** (MVP).

Часть монорепо `dogrsc`. Backend: `../backend/`.

## Setup

```powershell
cd c:\dogrsc
npm install
cd admin
copy .env.example .env.local
```

## Development

Из корня монорепо:

```powershell
npm run dev:admin
```

Или из `admin/`:

```powershell
npm run dev
```

Open [http://localhost:3001](http://localhost:3001) — redirects to `/dashboard`.

| Route | Description |
|-------|-------------|
| `/dashboard` | Overview stats from `GET /admin/dashboard/stats` |
| `/dogs` | Dog list, create, edit, photo upload |
| `/reports` | Found/lost report moderation (tabs, approve/reject) |
| `/content` | CMS pages (ADMIN only) |
| `/users` | Staff accounts (ADMIN only) |
| `/login` | Admin sign-in (JWT) |

Public site runs on `:3000` (`../frontend/`).

### Dashboard

- `/dashboard` — dogs under care, pending reports, donations this month (THB), dogs available; links to reports/dogs/donations

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server on port **3001** |
| `npm run build` | Production build |
| `npm run start` | Production server on 3001 |

## Auth

Login calls `POST /api/v1/auth/login` on the backend. Token is stored in `localStorage` (`dogrsc_admin_token`). Protected routes under `(admin)/` use `AuthGate` — no token redirects to `/login`.

Configure `NEXT_PUBLIC_API_URL` in `.env.local` (backend base URL, default `http://localhost:4000`).

### Dogs

- `/dogs` — list (pagination, slug search, status filter), archive (ADMIN)
- `/dogs/new`, `/dogs/[id]/edit` — multilingual content (en required), slug, publish toggle; **photos on edit only**

### Reports

- `/reports` — tabs Found / Lost, status filter, Approve/Reject for `PENDING` (ADMIN + STAFF)

### Donations

- `/donations` — manage crypto addresses (list, add, activate/deactivate); donation records — later

Dev bypass link on `/login` is shown only when `NODE_ENV === 'development'`.

## Related

| Path | Role |
|------|------|
| `../frontend/` | Public site (en/th/ru) |
| `../backend/` | REST API |
| `../infra/` | Docker Compose (TODO) |
