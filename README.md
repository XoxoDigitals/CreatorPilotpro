# Creator Pilot Pro

Cross-platform content scheduling for **YouTube**, **TikTok**, and **Facebook**.

## Quick start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## API keys (when ready)

Copy `.env.example` to `.env.local` and add your sandbox or production credentials:

| Variable | Platform |
|---|---|
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | YouTube |
| `TIKTOK_CLIENT_KEY` / `TIKTOK_CLIENT_SECRET` | TikTok |
| `FACEBOOK_APP_ID` / `FACEBOOK_APP_SECRET` | Facebook |

Restart the dev server after updating env vars.

## Routes

### Marketing
- `/` — Homepage
- `/about` — About
- `/contact` — Contact form
- `/pricing` — Pricing

### Policies
- `/privacy`, `/terms`, `/cookies`, `/data-deletion`
- `/acceptable-use`, `/community-guidelines`
- `/policies/youtube`, `/policies/facebook`, `/policies/tiktok`

### App
- `/login`, `/signup` — Demo auth (any credentials)
- `/dashboard` — Overview
- `/dashboard/schedule` — Schedule config
- `/dashboard/posts` — Create & manage posts
- `/dashboard/accounts` — OAuth + sandbox connections
- `/dashboard/analytics` — Publishing stats
- `/dashboard/settings` — Profile & API setup

## OAuth redirect URIs

Configure these in each developer console:

- YouTube: `{APP_URL}/api/auth/youtube/callback`
- TikTok: `{APP_URL}/api/auth/tiktok/callback`
- Facebook: `{APP_URL}/api/auth/facebook/callback`
- Facebook data deletion: `{APP_URL}/api/facebook/data-deletion`
