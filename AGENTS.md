<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Cloud Agent environment

Local development uses Postgres on this machine. Boot starts PostgreSQL 16 with `pg_ctlcluster` because `policy-rc.d` blocks `service postgresql`, then runs `npm run dev` on port 3000.

When `.env.local` is missing, boot writes `DATABASE_URL` for the local database `order_restaurant` and a generated `SESSION_SECRET`. Stripe, Resend, and platform-admin variables are optional. Signup, the public menu, and table orders work without them.

`npm run lint` and `npm run build` are the project checks (`next build` typechecks). Unit tests run with `npx tsx --test src/lib/*.test.ts`. The image Node is 22, which satisfies `engines.node` (`>=20.9.0`). `.nvmrc` says `20`.
