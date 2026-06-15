# FounderOS Functional Audit

## Current Product Surface

- Landing page: public marketing flow with signup, login, and example opportunity CTAs.
- Auth: email/password signup, confirmation callback, login, magic link, password reset, and sign out.
- Dashboard: authenticated opportunity list, search, sort, create, example create, delete confirmation, and empty states.
- Whiteboard: research, market, moat, risks, execute, and notes tabs with autosave and server-side rescoring.
- Ember: tab-aware streaming AI assistant using OpenAI Responses API and `gpt-5-mini`.
- Documents: private upload, synthesis, signed download, delete, and storage cleanup.
- Tasks: create, complete, prioritize, date, filter, and delete execution tasks.
- Settings/help/docs: protected operational surfaces for account, config health, product help, and document workflow.

## Remaining Product Risks

- The in-memory AI/upload rate limiter resets on serverless cold starts; use Redis or a managed Vercel KV store for durable quotas.
- Structured Ember write-back currently supports starter task generation; field/risk suggestions should expand behind explicit confirmations.
- E2E tests cover smoke paths; authenticated Supabase-backed flows still need a seeded test account or mocked auth harness.
- RLS migrations must be applied before production code paths that persist `ember_messages.response_id`.
- Billing and plan enforcement are not implemented beyond the existing `users.plan` column.

## Production Smoke Checklist

1. Sign up and confirm a new email.
2. Create a blank opportunity from `/dashboard`.
3. Create an example opportunity from `/dashboard?example=true`.
4. Open the whiteboard and edit each tab.
5. Create, date, prioritize, complete, and delete a task.
6. Upload, synthesize, download, and delete a document.
7. Ask Ember from at least one tab and confirm streaming output.
8. Visit `/settings`, `/help`, `/docs`, and `/api/health`.

