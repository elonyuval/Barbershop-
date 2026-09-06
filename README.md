# MODA BARBER CLUB

A complete, working demo site for an upscale men's barbershop — built as a
template to show barbershop owners and then rebrand for each one.

Cinematic opening screen, dark editorial homepage, and a real booking system
that stores appointments and prevents double-booking, with a back-office view.

---

## Running it

```bash
npm install
npm run dev          # http://localhost:3000
```

```bash
npm run build && npm start   # production
npm run typecheck            # tsc --noEmit
```

No environment variables are needed. Out of the box the site runs in **demo
mode**: bookings are stored in the visitor's own browser.

---

## What is here

| Route | What it is |
|---|---|
| `/` | Opening screen → homepage (hero, services, team, gallery, why us, experience, reviews, booking, location) |
| `/admin` | Demo back office: day/week diary, status changes, blocked times |

### The opening screen

Full-bleed, warm light-grey, one classic barber pole in the centre with a helix
that really moves. The pole fades in with a small scale-in, the **MODA**
wordmark opens outward from the centre behind it, a gold hairline draws, the
gold subtitle appears, then the ENTER capsule — about 3.2 seconds end to end.
ENTER plays a short zoom-and-darken hand-off into the hero.

- Shows **once per session** (configurable), with a quiet Skip button.
- The <kbd>Enter</kbd> and <kbd>Esc</kbd> keys both work.
- Scrolling is locked behind it and the page below is `inert`.
- Under `prefers-reduced-motion` it lands on the finished frame at once and the
  helix slows to a crawl.
- No 3D model, no WebGL, no image download — it is layered CSS, so it costs
  nothing on first load. See `components/intro/barber-pole.css`.

An inline script in `app/layout.tsx` stamps `<html data-intro>` before first
paint, so a returning visitor never sees a flash of the intro and there is never
a white gap while the page boots.

### The booking system

Five steps: service → barber (or "no preference") → date & time → details →
confirm, then a success screen with a confirmation code and an **Add to
calendar** `.ics` download.

The availability engine (`lib/booking/availability.ts`) intersects opening hours
with each barber's rota, then removes anything overlapping an existing
appointment (plus a clean-up buffer), a blocked time, or the minimum-notice
window. "No preference" resolves to whichever barber is actually free, and the
chosen slot is re-checked at write time so two tabs cannot take it.

Israeli phone numbers are validated (`05x`, `07x`, and `02/03/04/08/09`, with or
without `+972`).

---

## Rebranding it for a client

Almost everything lives in **`config/siteConfig.ts`**: business name, tagline,
colours, services and prices, team and their rotas, opening hours, address,
phone, WhatsApp, Instagram, gallery, reviews, booking rules and the opening
screen's behaviour.

```
config/siteConfig.ts     ← business content and brand colours
config/types.ts          ← the shape of the above
content/en.ts, he.ts     ← every UI string, both languages
public/media/            ← imagery (see ASSET-GUIDE.md)
```

Colours in `siteConfig.brand.colors` are written into CSS variables on `<html>`
by `app/layout.tsx`, and the whole design system — including the barber pole —
reads those variables. Changing the gold changes the site.

No component hard-codes a price, a name or a phone number.

### Languages

English (LTR) and Hebrew (RTL), switchable from the header. All copy lives in
`content/en.ts` and `content/he.ts`, typed against `content/dictionary.ts`, so a
missing string is a build error rather than a surprise. Direction, fonts and
layout mirror automatically.

---

## Storage: demo mode and Supabase

Everything goes through one interface (`lib/booking/types.ts` → `BookingStore`),
with two implementations:

- **`localStore.ts`** — demo mode. Appointments live in `localStorage`, and a
  few plausible bookings are seeded on first visit so the diary and the admin
  view are not empty.
- **`supabaseStore.ts`** — the same contract over Supabase's REST API using
  plain `fetch` (no SDK dependency in the bundle).

`getBookingStore()` picks Supabase the moment `NEXT_PUBLIC_SUPABASE_URL` and
`NEXT_PUBLIC_SUPABASE_ANON_KEY` are set. **The UI does not change.**

To switch over:

1. Create a Supabase project.
2. Run `supabase/migrations/0001_init.sql` (tables, indexes, an exclusion
   constraint that makes overlapping appointments impossible at the database
   level, and RLS policies).
3. Copy `.env.example` to `.env.local` and fill in the two public values.

Read the security notes at the bottom of the migration before going live.

---

## Before this goes live for a real client

- [ ] Replace all imagery — `ASSET-GUIDE.md` lists every file and its size.
- [ ] Add the two hero/experience videos, or leave the posters (both work).
- [ ] Replace the **demo reviews** in `siteConfig.testimonials` with real ones,
      or delete the section. They are labelled as demo content on the page.
- [ ] Replace the **AI-generated team portraits and invented barber names** with
      the client's actual staff.
- [ ] Replace the demo address, phone, WhatsApp number and Instagram link.
- [ ] Point `business.mapEmbedUrl` and `business.mapQuery` at the real location.
- [ ] Connect Supabase, or bookings only exist in each visitor's own browser.
- [ ] **Put `/admin` behind real authentication.** It has none: the page says so
      in a red banner, `robots.ts` disallows it, and the RLS policies in the
      migration deliberately hide appointments from anonymous callers.
- [ ] Set `NEXT_PUBLIC_SITE_URL` so metadata, Open Graph and the sitemap
      resolve to the real domain.
- [ ] Decide whether booking confirmations should be emailed or sent by SMS —
      nothing is sent today.

---

## Stack

Next.js 16 (App Router) · TypeScript (strict) · Tailwind CSS v4 ·
Framer Motion · lucide-react. No 3D library, no UI kit, no date library.

## Project layout

```
app/            routes, layout, metadata, sitemap, robots
components/
  intro/        opening screen + the CSS barber pole
  layout/       header, footer, logo, language switch, intro gate
  sections/     hero, services, team, gallery, advantages, experience, reviews, location
  booking/      the five-step wizard and its parts
  admin/        demo back office
  ui/           button, section, reveal, background media
config/         siteConfig.ts + its types
content/        en / he dictionaries
lib/            i18n, booking domain, availability engine, stores, utils
scripts/        placeholder image generator
supabase/       SQL migration
```
