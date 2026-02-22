# Daily 5 - Personalized Product Feed

A Next.js application that provides 5 personalized product recommendations every day based on a user's style quiz.

## Features

- **Personalized Onboarding**: Interactive quiz to understand style, fit, and budget.
- **Daily Feed**: 5 curated products refreshed daily at 06:00 AM.
- **Smart Scoring**: Recommendation engine based on brand affinity and attribute overlap.
- **Diversity Rules**: Ensures variety in brands and categories.
- **Admin Tools**: Import products via simple JSON/CSV-compatible API.
- **Localization**: Full Turkish (TR) language support.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Database**: Supabase (PostgreSQL + Auth)
- **Styling**: Tailwind CSS + Framer Motion
- **Jobs**: Vercel Cron

## Getting Started

### 1. Environment Setup

Ensure your `.env.local` is configured with:

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
CRON_SECRET=...
ADMIN_API_KEY=...
```

### 2. Database Migration

Run the migration in Supabase SQL Editor:
Copy contents of `supabase/migrations/001_init.sql`.

### 3. Install & Run

```bash
npm install
npm run dev
```

Visit `http://localhost:3000`.

## API Endpoints

### Client
- `GET /api/feed`: Get today's 5 products.
- `POST /api/vote`: Like/Dislike a product.
- `GET /r/[id]`: Redirect to marketplace.

### Admin / System
- `POST /api/admin/products/import`: Import products.
  - Header: `x-admin-key: <ADMIN_API_KEY>`
  - Body: `{ "items": [ ... ] }`
- `GET /api/cron/daily`: Trigger daily generation.
  - Header: `x-cron-key: <CRON_SECRET>`

## Workflow for Manual Testing

1. **Import Products**: Use Postman/Curl to import sample products.
2. **Start Quiz**: Go to `/` and click "Start Your Persona".
3. **Auth**: Sign in via Magic Link.
4. **View Feed**: Check `/feed` for your daily 5.
5. **Vote**: Like/Dislike products (affects future scores).

## How to Resume Work (How to Continue)

To continue working on this project from your desktop:

1. Open a terminal in this folder: `openclaw-ui-demo`
2. Run `npm run dev` to start the server.
3. Open `http://localhost:3000` in your browser.
4. Edit files in `app/` to make changes.

The project state is saved and ready for you!
