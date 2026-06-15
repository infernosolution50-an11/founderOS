# FounderOS

FounderOS is a dark-themed founder intelligence platform for researching and executing on new business opportunities. It combines a thinking whiteboard, Supabase-backed workspace, document synthesis, and Ember, an AI co-founder powered exclusively by OpenAI Responses API using `gpt-5-mini`.

## Stack

- Next.js 14 App Router + TypeScript
- Tailwind CSS
- Supabase Auth, Postgres, RLS, and private Storage
- OpenAI Responses API at `/v1/responses`
- Vercel deployment

## Environment Variables

Copy `.env.example` to `.env.local` and fill in project-specific values:

```bash
cp .env.example .env.local
```

Do not commit `.env.local` or real secrets. The Supabase publishable/anon key is safe for browser use; keep the service role key and OpenAI key private.

Add the same variables to the Vercel project environment variables for Production, Preview, and Development as needed. At minimum, set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` before deploying so auth pages can initialize Supabase.

## Local Setup

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Supabase Setup

Apply schema migrations:

```bash
supabase link --project-ref <project-ref>
supabase db push
```

The migration at `supabase/migrations/001_initial_schema.sql` creates:

- `users`
- `opportunities`
- `tasks`
- `ember_messages`
- `documents`
- `opportunity_notes`
- `risk_assessments`
- private `documents` storage bucket
- RLS policies that scope all rows and files to the authenticated user

If using the Supabase dashboard instead of the CLI, run SQL migrations in order from `supabase/migrations`. See `docs/PRODUCTION_RUNBOOK.md` for the production migration flow.

## Quality Gates

```bash
npm run lint
npm run test
npm run build
npm run typecheck
```

E2E smoke tests are available with:

```bash
npm run test:e2e
```

## Vercel Deployment

1. Import `https://github.com/infernosolution50-an11/founderOS.git` into Vercel.
2. Set the environment variables listed above.
3. Confirm the framework is Next.js. `vercel.json` already sets `"framework": "nextjs"`.
4. Deploy.

## AI Constraint

FounderOS must only use:

- Model: `gpt-5-mini`
- Endpoint: `https://api.openai.com/v1/responses`

No fallback models and no `/v1/chat/completions` calls are allowed.
