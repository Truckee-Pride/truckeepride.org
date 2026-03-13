# Truckee Pride

Website for Truckee Pride, a 501(c)(3) nonprofit serving the LGBTQ+ community in Truckee, CA. Built with Next.js 15, Tailwind CSS v4, and Neon PostgreSQL.

## Dev Setup

```bash
# Install dependencies
pnpm install

# Link to the Vercel project (one-time setup)
npx vercel link

# Pull environment variables from Vercel
npx vercel env pull .env.local

# Run dev server
pnpm dev
```

The app starts at [http://localhost:3000](http://localhost:3000).

## Other Commands

```bash
pnpm build        # Production build
pnpm lint         # ESLint
pnpm typecheck    # TypeScript check
```
