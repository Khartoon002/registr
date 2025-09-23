
# Admin System Starter (Projects • Packages • Downlines • Chat Bots)

This is a production-ready **starter scaffold** for the administrator system described in your prompt.  
It uses **Next.js (App Router) + TypeScript + TailwindCSS + Prisma + PostgreSQL** and includes:
- Dashboard with stats placeholders and recent activities
- Projects → Packages → Unique Person Links → Registration form
- Downlines listing
- Bots (chat bot definitions + glass UI starter)
- WhatsApp redirect template carrying `{ID, project, package, tag}` for **Tasker/AutoRemote** parsing
- Soft-delete pattern (flag) + confirmation modal
- Audit log model
- Theme (dark/glass) with toggle (stored in localStorage)

> This is a scaffold with working pages, routes, types, Prisma schema, and API stubs.
> You can extend each route to meet full logic requirements.

---

## Quick Start

```bash
# 1) Clone repo, then
cp .env.example .env

# 2) Fill env values
#    - DATABASE_URL=postgresql://...

# 3) Install deps
pnpm i        # or npm i / yarn

# 4) Generate UI + DB client
pnpm prisma generate
pnpm prisma migrate dev --name init

# 5) Run
pnpm dev
```

Open http://localhost:3000

Login is mocked in dev (no NextAuth yet). Swap to NextAuth easily (see `lib/auth.ts` hints).

---

## Env

See `.env.example`

- `DATABASE_URL` – Postgres connection
- `NEXTAUTH_SECRET` – Add when integrating NextAuth
- `JWT_SECRET` – If you prefer custom JWTs
- `APP_BASE_URL` – e.g., http://localhost:3000
- `DEFAULT_WHATSAPP_NUMBER` – Optional fallback
- `AUTOREMOTE_WEBHOOK` – Optional webhook target

---

## Folder Map

```
/app
  /(public)
    /r/[token]        -> Registration form (glass)
    /bot/[slug]       -> Public chat bot UI
  /dashboard          -> Admin home (stats + recent activity)
  /projects           -> List & create
  /projects/[id]      -> Detail w/ packages & actions
  /packages/[id]      -> Package detail w/ downlines & links
  /downlines          -> Global list
  /bots               -> List & create
  /bots/[id]          -> Bot flow builder (placeholder)
/app/api              -> API stubs (REST-like)
/components           -> UI atoms (Card, Button, Modal, Table)
/lib                  -> util, db, auth helpers
/prisma/schema.prisma
```

---

## WhatsApp Redirect

On registration submit, build a URL like:

```
https://wa.me/<COUNTRYCODE_NUMBER>?text=<URLENCODED>
```

Payload example (raw before encoding):
```
[MAGNUS] REG_OK
PROJ:{project_slug}
PKG:{package_slug}
ID:{unique_id}
NAME:{full_name}
PHONE:{phone}
TAG:{tasker_tag}
```

---

## Notes

- This starter uses soft-delete boolean fields (`deleted`, `archivedAt`) in models.
- See `app/api/*` for handler stubs to implement real logic.
- Add authentication (NextAuth) and rate limiting before shipping to production.
- The UI is intentionally simple and fast; replace placeholder components with shadcn/ui if desired.
