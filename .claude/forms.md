# Forms & Validation

- Use **Zod** for all input validation — both client-side (for fast feedback) and server-side (for security).
- Define Zod schemas in a colocated `schema.ts` next to the form they validate.
- Use React's `useActionState` (Next.js 15) with Server Actions for form handling — no client-side `fetch` for mutations.
- Return structured errors from Server Actions; display them inline next to the relevant field.
