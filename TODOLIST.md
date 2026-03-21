# Truckee Pride Website — Task List

> **Actively maintained.** Delete tasks as completed. For architecture decisions and technical reference, see `ARCHITECTURE.md`.

---

## MVP.5.x: Abuse Prevention

**Goal: Protect event submission from spam, bots, and targeted harassment.**

- [ ] **MVP.5.1** User banning: bulk-reject pending events on ban, admin "Ban Submitter" button in approval queue
- [ ] **MVP.5.2** Cloudflare Turnstile (free CAPTCHA) on event submission forms
- [ ] **MVP.5.3** Disposable email domain blocking in Auth.js signIn callback

---

## MVP.7: Tidy

- [ ] Send admins emails when events are submitted
- [ ] Bring back the photo carousel to the homepage! Put it below the calendar
- [ ] In the Meta tags (for seo) make sure each event page has its time, date, maybe location (not address) in the description
- [ ] Add vibe tags to event pages

## MVP.8: Launch

- [ ] **MVP.7.1** Verify truckeepride.org domain in Resend — coordinate with David for DNS access:
  - Add Resend MX record to truckeepride.org DNS
  - Add SPF (TXT) record
  - Add DKIM (TXT) records (Resend provides these)
  - Verify domain in Resend dashboard
  - Update `EMAIL_FROM` env var to `auth@truckeepride.org`
- [ ] **MVP.7.2** Custom domain on Vercel (truckeepride.org)
- [ ] **MVP.7.3** DNS cutover: domain → Vercel, Resend email DNS (SPF/DKIM) verified
- [ ] **MVP.7.4** Smoke test all flows: sign in, create event, submit, approve, view, emails. **Go live.**

## Deferred to Post-MVP

- [ ] Google Maps links and autocomplete in events form
- [ ] "My Events" tab/filter on `/events` page: show user's own events with status badges
- [ ] Audit Log
- [ ] Admin event owners page (`src/app/admin/events/[id]/owners/page.tsx`) — use Drizzle Studio until then
- [ ] Admin user management: role editing, user detail view
- [ ] Rate limiting on sign-in
- [ ] Full site nav: Get Involved, About, Donate links, mobile hamburger
- [ ] About page, Get Involved page
- [ ] `loading.tsx` skeletons
- [ ] Fancy React Email templates (replace plain text)
- [ ] Design system & visual polish (Dialog, Toast, responsive pass, accessibility audit)
- [ ] SEO: OG images/metadata
- [ ] Analytics: Vercel Analytics and/or Plausible
- [ ] Performance: Lighthouse, Core Web Vitals
- [ ] Make it easy for admins to edit the photo carousel image options
- [ ] Make repeat events maintain an nice slug in 2027
