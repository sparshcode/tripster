# Trip Brain 🧠✈️

> Your trip information is scattered across 10 places. Trip Brain turns it into one context-aware travel assistant that knows what you've booked, what you planned, and what you still need to do.

**[Try the live demo](https://tripbrain-seven.vercel.app)**

Built with **Next.js 15** + **Anthropic Claude** (bring-your-own-key) + browser storage.

## What V0 does

- **Add to trip** — upload a booking PDF, screenshot, or paste a confirmation email. Claude extracts the fields into a structured booking.
- **Trip at a glance** — every booking, sorted, with times, locations, and action items.
- **Timeline** — day-by-day view of your trip.
- **Ask Trip Brain** — ask questions grounded only in the bookings you've added.
- **Conflicts & gaps** — same-day overlap detection and long free-window flags.

## Bring your own key

Trip Brain does not ship with a server-side API key. The first time you add a booking or ask a question you'll be prompted for an Anthropic API key. It is kept in browser memory only for the current tab, sent over HTTPS to the app's server routes, and never stored.

## Quick start

```bash
npm install
npm run dev
# open http://localhost:3000
```

## Deploy

Deploy to Vercel — no environment variables required for V0. Optionally set `ANTHROPIC_MODEL` to override the default Claude model.

## Roadmap

- Multiple trips + trip switcher
- Cloud persistence (Supabase) so trips move with your account
- "Trip Briefing" the day before departure
- "What changed?" comparison when re-uploading updated bookings
- Live travel-time estimates for conflict scoring
