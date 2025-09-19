### StarSling Takehome – Setup & Run (10 min)

This repo implements:

- GitHub OAuth sign-in via Better-Auth
- Org management (default org auto-created on first login)
- GitHub App connect/disconnect (scoped by active org)
- Webhook signature verification and background processing via Inngest
- Issues listing by active org

### 1) Prerequisites

- Node.js 18+
- PostgreSQL (Supabase recommended)

### 2) Environment variables

Copy and fill in values:

```bash
cp .env.example .env.local
```

Required keys:

- NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3000
- SUPABASE_DB_CONN_URI=postgres://USER:PASSWORD@HOST:PORT/DB
- NEXT_PUBLIC_SUPABASE_URL=...
- NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
- SUPABASE_API_SERVICE_ROLE_KEY=...
- GITHUB_OAUTH_CLIENT_ID=...
- GITHUB_OAUTH_CLIENT_SECRET=...
- GITHUB_APP_ID=...
- GITHUB_APP_SLUG=...
- GITHUB_APP_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
- GITHUB_WEBHOOK_SECRET=...

### 3) Install dependencies

```bash
npm install
```

### 4) Database schema

Run Better-Auth migrations (writes SQL into `better-auth_migrations/`). See docs: `https://www.better-auth.com/docs/integrations/next`.

```bash
npx @better-auth/cli@latest generate --config ./lib/auth/server.ts
```

Apply SQL files to your Postgres (Supabase SQL editor or psql). Then create two app tables:

```sql
-- Integration installations
create table if not exists integration_installations (
  provider text not null,
  installation_id text primary key,
  user_id text,
  organization_id text,
  metadata jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Issues (minimal)
create table if not exists issues (
  provider text not null,
  issue_id bigint primary key,
  installation_id text not null,
  number int,
  title text,
  state text,
  repo_full_name text,
  updated_at timestamptz
);
```

### 5) Inngest local dev

Start your Next.js dev server, then run the Inngest dev server in a second terminal. Docs: `https://www.inngest.com/docs/getting-started/nextjs-quick-start`.

```bash
npm run dev

npx inngest-cli@latest dev
```

### 6) Run the app

- Open `http://localhost:3000/login` and sign in with GitHub OAuth
- You’ll be redirected to `/integrations`
- Click “Connect GitHub Account” and complete the GitHub App install
- Webhooks will post to `/api/github/webhook` → verified → enqueued to Inngest → stored
- Issues for your org: GET `http://localhost:3000/api/issues`

### Notes

- Protected routes enforce session and active org.
- Integrations and issues are scoped by the active org.
- Webhooks require `GITHUB_WEBHOOK_SECRET` and GitHub App config callbacks pointing to your dev URL.

References:

- Inngest Quick Start: `https://www.inngest.com/docs/getting-started/nextjs-quick-start`
- Better-Auth Next: `https://www.better-auth.com/docs/integrations/next`
