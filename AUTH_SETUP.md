# FounderOS Supabase Auth Setup

Configure these settings in the Supabase dashboard before testing production auth flows.

## Providers

1. Open Authentication > Providers.
2. Enable Email.
3. Enable email/password signups.
4. Enable magic links / passwordless email.
5. Keep confirm email enabled.
6. Set email confirmation token expiry to 24 hours.

## URLs

Open Authentication > URL Configuration.

Set Site URL:

```text
https://founder-os-alpha-kohl.vercel.app
```

Add redirect URLs:

```text
https://founder-os-alpha-kohl.vercel.app/**
http://localhost:3000/**
```

The app uses these redirect destinations:

- Email confirmation and magic link: `/api/auth/callback?next=/dashboard`
- Password reset: `/reset-password`

## Password Reset

Ensure password reset is enabled for the Email provider and that reset emails are allowed to redirect to:

```text
https://founder-os-alpha-kohl.vercel.app/reset-password
http://localhost:3000/reset-password
```

## Email Templates

Customize Authentication > Email Templates.

Confirm email subject:

```text
Confirm your FounderOS account
```

Reset password subject:

```text
Reset your FounderOS password
```

Template guidance:

- Mention FounderOS by name.
- Mention Ember as the co-founder inside the product.
- Avoid generic Supabase wording.
- Keep the action button clear: "Confirm your account" or "Reset password".

Example confirmation copy:

```text
Welcome to FounderOS. Confirm your account to start building your first opportunity with Ember.
```

Example reset copy:

```text
Reset your FounderOS password to get back to your opportunity workspace and Ember.
```

## Environment Variables

Set these in Vercel for Production, Preview, and Development:

```text
NEXT_PUBLIC_SUPABASE_URL=https://vojwuojfqfdtezeklawb.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_sraWBBJgSzLRjRYj9sPiLA_qWjNLkE2
SUPABASE_SERVICE_ROLE_KEY=<your service role key>
OPENAI_API_KEY=<your OpenAI key>
```

Local `.env.local` should use the same names.

Never expose `SUPABASE_SERVICE_ROLE_KEY` in browser code.
