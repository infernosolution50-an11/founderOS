# FounderOS Production Runbook

## Pre-Deploy Checks

1. Confirm Vercel has all required environment variables from `.env.example`.
2. Run `npm run lint`, `npm run build`, and `npm run typecheck`.
3. Review pending Supabase migrations in `supabase/migrations`.
4. Confirm OpenAI usage limits and Supabase email rate limits are acceptable for the release.

## Supabase Migration Flow

1. Link the project:
   ```bash
   supabase link --project-ref <project-ref>
   ```
2. Preview migrations locally or in a staging project.
3. Apply:
   ```bash
   supabase db push
   ```
4. Verify:
   - `public.users` has a profile row for new auth users.
   - Opportunity creation works for a confirmed user.
   - Documents upload, download, and delete correctly.
   - RLS blocks cross-user reads/writes.

## Production Smoke Test

1. Visit `/api/health` and confirm required checks are true.
2. Sign up with a real email and confirm the account.
3. Create a blank opportunity and open the whiteboard.
4. Create an example opportunity from `/dashboard?example=true`.
5. Add, complete, update, and delete a task.
6. Upload a small PDF/DOCX, synthesize it, download it, then delete it.
7. Ask Ember a short question and verify the response streams.

## Rollback

1. Roll back the Vercel deployment from the Vercel dashboard.
2. For database rollbacks, create a new forward migration that reverses the specific change. Do not manually edit applied migration files.
3. Re-run the smoke test after rollback.

