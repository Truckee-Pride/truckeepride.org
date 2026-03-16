# Plan: MVP.2.0 — Resend Sandbox Setup Instructions

## Context

Auth.js v5 magic links require a working email provider. Before any auth code can be tested (MVP.2.1+), Resend must be configured. This plan provides step-by-step instructions for the user to complete MVP.2.0 manually — no code changes, just account setup and env vars.

## Step-by-Step Instructions

### Step 1: Create a Resend account

1. Go to https://resend.com and sign up (GitHub or email)
2. Free tier limits: **100 emails/day, 3,000/month** — more than enough for dev and a small nonprofit

### Step 2: Generate a Resend API key

1. In the Resend dashboard, go to **API Keys** (left sidebar)
2. Click **Create API Key**
3. Name it something like `truckeepride-dev`
4. Permission: **Sending access** (default) is sufficient
5. Domain: leave as **All domains**
6. Copy the key — it's shown only once

### Step 3: Add env vars to `.env.local`

The project's `.env.example` already has placeholders. Add these three values:

```bash
# Generate auth secret
openssl rand -base64 32
```

Then in `.env.local`:

```
AUTH_SECRET=<paste the openssl output>
AUTH_RESEND_KEY=<paste your Resend API key>
EMAIL_FROM=onboarding@resend.dev
```

**Important:** Set `EMAIL_FROM=onboarding@resend.dev` for now (not `auth@truckeepride.org`). Sandbox mode only allows sending from Resend's shared address. The truckeepride.org sender will be configured in MVP.3.1 after DNS verification.

`AUTH_URL=http://localhost:3000` is already in `.env.example` — copy it to `.env.local` too if not already there.

### Step 4: Understand sandbox limitations

Before truckeepride.org is verified in Resend (MVP.3.1), these restrictions apply:

| What                    | Limitation                                    |
| ----------------------- | --------------------------------------------- |
| **Sender address**      | Must be `onboarding@resend.dev`               |
| **Recipient addresses** | Only the email address on your Resend account |
| **Daily limit**         | 100 emails/day                                |
| **Email retention**     | 1 day (logs disappear after 24h)              |

This means during dev, **only you can receive magic link emails** — that's fine for local testing. Other team members testing auth will need their own Resend accounts or you'll need to verify the domain first (MVP.3.1).

### Step 5: Verify it works (after MVP.2.2 code is written)

You can't test email sending yet — that requires the Auth.js configuration code from MVP.2.2. But you can verify the API key works:

```bash
curl -X POST https://api.resend.com/emails \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "from": "onboarding@resend.dev",
    "to": "YOUR_RESEND_ACCOUNT_EMAIL",
    "subject": "Test",
    "text": "Resend is working!"
  }'
```

If you get a `201` response with an `id`, the API key is valid.

## Packages Needed (for reference — installed in MVP.2.1/2.2)

MVP.2.0 is config-only, but for context, the auth phase will need:

```bash
pnpm add next-auth@latest resend @auth/drizzle-adapter
```

- `next-auth` — Auth.js v5 (the package name is still `next-auth`)
- `resend` — Resend SDK
- `@auth/drizzle-adapter` — connects Auth.js to our Neon/Drizzle database

## Summary checklist

- [ ] Resend account created at resend.com
- [ ] API key generated and copied
- [ ] `AUTH_SECRET` generated via `openssl rand -base64 32`
- [ ] `.env.local` updated with `AUTH_SECRET`, `AUTH_RESEND_KEY`, `AUTH_URL`, `EMAIL_FROM=onboarding@resend.dev`
- [ ] (Optional) Verified API key with curl test
- [ ] Delete MVP.2.0 from TODOLIST.md when done
