# Horizon Gate School — Vercel-ready bundle

Frontend + backend in one deployable project. The static pages live at the
root; `/api/inquiry` and `/api/visit` are Vercel serverless functions that
write to MongoDB.

## Deploy

1. **Get a MongoDB connection string.** The free tier of [MongoDB Atlas](https://www.mongodb.com/atlas) works fine — create a cluster, a database user, and allow access from anywhere (`0.0.0.0/0`) so Vercel's functions can reach it.
2. **Push this folder to a GitHub repo** (or deploy directly via the Vercel CLI — see below).
3. **Import the repo in Vercel** ([vercel.com/new](https://vercel.com/new)). Vercel auto-detects this as a static site with an `/api` folder — no framework preset or build command needed.
4. **Set environment variables** in Vercel → Project → Settings → Environment Variables:
   - `MONGODB_URI` — your Atlas connection string
   - `ADMIN_PASSWORD` — a password for the `/admin.html` dashboard
   - Optional, for email confirmations: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `NOTIFY_EMAIL_FROM`, `NOTIFY_EMAIL_TO`. Leave these blank to skip email entirely — forms still save to the database either way.
5. **Deploy.** Your site is live at `<project>.vercel.app` (or your custom domain), and the forms are already wired to `/api/inquiry` and `/api/visit` on the same domain — no CORS config needed since everything is same-origin.

## Managing content (News, Events, Gallery)

The `/admin.html` dashboard now does more than list form submissions — it's a working CMS for the News & Events page and the Gallery page:

- **News & Events tab**: add/edit/delete posts with a title, category (News / Announcement / Event / Competition / Celebration), date, excerpt, and image URL. Posts tagged "Event" with a future date automatically populate the "Upcoming Events" strip on the homepage.
- **Gallery tab**: add/edit/delete photos with a caption, category (for the gallery filters), and image URL.
- Both support a "published" toggle — uncheck it to hide something without deleting it.

The public pages (`news.html`, `gallery.html`, `index.html`) fetch this content client-side on load via `assets/js/cms.js`. If the API isn't reachable (e.g. you're previewing the static files with no backend deployed), the pages silently fall back to the placeholder content already baked into the HTML — nothing breaks, it just won't reflect your admin edits until the API is live.

## Or deploy from the CLI

```bash
npm i -g vercel
cd vercel-ready
vercel        # first deploy, follow the prompts
vercel --prod # promote to production
```

## Test locally first (optional)

```bash
cp .env.example .env.local   # fill in MONGODB_URI and ADMIN_PASSWORD
vercel dev
```

This runs the static pages and the `/api` functions together on `localhost`, exactly as they'll behave in production.

## Admin dashboard

Visit `/admin.html` on your deployed domain and enter the `ADMIN_PASSWORD`. It lists recent enquiries and visit bookings. Same caveat as noted in the main project README: this is a shared-password gate, not real per-user authentication — fine for a small internal tool, not for anything handling sensitive data at scale.

## Known limitation: rate limiting

The standalone Express backend (in the other zip) rate-limits form submissions in memory. Serverless functions don't share memory across invocations, so that approach doesn't carry over here. For a school-visit form this is a low-risk gap, but if spam becomes an issue, add [Vercel's Attack Challenge Mode](https://vercel.com/docs/security/attack-challenge-mode) or a Redis-backed limiter (e.g. Upstash) in front of `/api/inquiry` and `/api/visit`.

## What's still not real

Being direct about what's left, since this started as a gap list:

- **Video** — nowhere on the site is there actual video (hero, testimonials, campus tour are all styled image placeholders). Would need real footage or stock video licensing.
- **Interactive Google Map** — replaced with a real, working OpenStreetMap embed instead (no API key needed), but it's centered on placeholder coordinates, not your real campus.
- **React/Next.js/Framer Motion/GSAP/Lottie** — this is still static HTML/Tailwind/vanilla JS + AOS, not the stack originally specified. Rebuilding in React would be a from-scratch effort, not an incremental one — ask if you want that pursued separately.
- **Rate limiting on serverless** — see above.
- **Admin auth** — still a single shared password, not per-user login. Fine for a small team, not for anything handling sensitive data at real scale.

## Editing content

This bundle is the *deploy output* — for editing page copy/nav/footer, use `frontend/build.py` + `frontend/pages.py` from the main project zip, regenerate, and re-copy the HTML files here (or redeploy from the main zip's `frontend/` folder directly, since its structure is otherwise identical).
