# Horizon Gate School — Vercel-ready bundle

Frontend + backend in one deployable project. The static pages live at the
root; `/api/*` are Vercel serverless functions backed by MongoDB (forms,
CMS content) and Google Sheets (admission registrations).

## Deploy

1. **Get a MongoDB connection string.** Free tier of [MongoDB Atlas](https://www.mongodb.com/atlas) works — create a cluster, a database user, and allow access from anywhere (`0.0.0.0/0`) so Vercel's functions can reach it.
2. **Set up admin login** — see "Admin login" below for the exact two values you need (`ADMIN_PASSWORD_HASH`, `SESSION_SECRET`).
3. **Set up Google Sheets storage** — see "Google Workspace setup" below. Required for the Admission Registration form to actually store anything.
4. **Push this folder to a GitHub repo** (or deploy via the Vercel CLI — see below).
5. **Import the repo in Vercel** ([vercel.com/new](https://vercel.com/new)). Vercel auto-detects this as a static site with an `/api` folder — no framework preset or build command needed.
6. **Set environment variables** in Vercel → Project → Settings → Environment Variables — see `.env.example` for the full list with explanations.
7. **Deploy.** Your site is live at `<project>.vercel.app` (or your custom domain).

## Admin login

The admin dashboard (`/admin.html`) now uses a real login — email + password, checked server-side, with a signed HttpOnly session cookie. No password is ever sent on every request, stored in localStorage, or readable by client-side JS.

**One-time setup:**
1. Pick an admin email — this goes in the `ADMIN_EMAIL` env var.
2. Generate a bcrypt hash of your real password (do this locally, never commit the plaintext password anywhere):
   ```bash
   npm install bcryptjs
   node -e "console.log(require('bcryptjs').hashSync('your-real-password', 10))"
   ```
   Copy the output (starts with `$2a$` or `$2b$`) into `ADMIN_PASSWORD_HASH`.
3. Generate a session-signing secret:
   ```bash
   openssl rand -hex 32
   ```
   Copy that into `SESSION_SECRET`.
4. Set all three (`ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH`, `SESSION_SECRET`) in Vercel's environment variables and redeploy.
5. Visit `/admin.html`, sign in with your email + the real (unhashed) password.

Sessions last 8 hours, then you'll need to sign in again. Logout clears the cookie server-side.

**Honest scope note:** this is a single-admin system (one login for the whole school), not multi-user accounts with roles — that's what the requirements asked for as the "if a full system would be too large" fallback. It's real server-side auth with hashed passwords and signed sessions, not the previous shared-password-in-every-request approach, but it's not a multi-admin system with audit logs, password reset flows, or granular permissions. Also not implemented: CSRF tokens beyond what `SameSite=Strict` cookies already provide — reasonable for a low-traffic admin tool, worth adding if this ever handles higher-stakes data.

## Google Workspace setup (admission registration data)

The Admission Registration form (separate from Book a Visit and the general enquiry form) stores submissions in a Google Sheet via a service account — never in the browser, never via a client-visible API key.

**Steps:**
1. Go to [console.cloud.google.com](https://console.cloud.google.com), create a project (or use an existing one).
2. **APIs & Services → Library** → search "Google Sheets API" → Enable.
3. **APIs & Services → Credentials** → Create Credentials → Service Account. Give it any name (e.g. `horizon-gate-sheets`). No special roles needed at the project level.
4. Open the new service account → **Keys** tab → Add Key → Create new key → JSON. This downloads a `.json` file — keep it private, don't commit it anywhere.
5. Open that JSON file. You need two values from it:
   - `client_email` → this is your `GOOGLE_SERVICE_ACCOUNT_EMAIL`
   - `private_key` → this is your `GOOGLE_PRIVATE_KEY` (the whole thing, including the `-----BEGIN PRIVATE KEY-----` / `-----END PRIVATE KEY-----` lines)
6. Create a new Google Sheet (in the Google Workspace / Drive account where you want the data to live). Name a tab exactly **`Admission Registrations`** (the API writes to this tab name specifically — if you rename it, update `SHEET_TAB` in `api/_lib/sheets.js` to match).
7. Click **Share** on the sheet → paste in the service account's `client_email` → give it **Editor** access. This is the step that actually lets the API write to it — the service account is otherwise a stranger to your Sheet.
8. Copy the Sheet ID from its URL: `docs.google.com/spreadsheets/d/`**`THIS-LONG-ID-PART`**`/edit` → this is your `GOOGLE_SHEET_ID`.
9. Set `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_PRIVATE_KEY`, and `GOOGLE_SHEET_ID` in Vercel's environment variables, redeploy.

The API writes a header row automatically on first use, then appends one row per registration: timestamp, parent name, student name, grade, mobile, email, preferred visit date, time slot, visitors, remarks.

If these env vars aren't set, the registration form fails **loudly** with a clear error message to the user (not a silent fake success) — it will never pretend a submission was saved when it wasn't.

## Google Maps (optional)

The Contact page map defaults to a real, working **OpenStreetMap** embed — no API key needed. If you specifically want Google Maps:

1. [console.cloud.google.com](https://console.cloud.google.com) → enable the **Maps Embed API**.
2. Create an API key under Credentials.
3. **Restrict it**: under "Application restrictions" choose HTTP referrers and add your domain(s). Under "API restrictions" limit it to the Maps Embed API only. This is what makes it safe to use client-side — Maps Embed keys are *designed* to be public, protected by domain restriction rather than secrecy (unlike the Google Sheets service account key above, which must never be client-visible).
4. Set `window.GOOGLE_MAPS_API_KEY` and `window.SCHOOL_MAP_QUERY` in `assets/js/config.js`.

Until you do that, the Contact page correctly shows OpenStreetMap and says so in a small on-page label — it does not claim to be Google Maps when it isn't.

## Social media

Edit `assets/js/config.js` → `window.SOCIAL_LINKS`. Any left blank show as visibly disabled icons (not clickable, not linking to "#") rather than fake/dead links.

## Managing content (News, Events, Gallery, Teachers)

`/admin.html` is a working CMS for four things, each with add/edit/delete and a "published" toggle:

- **News & Events** — posts tagged "Event" with a future date automatically populate the homepage's "Upcoming Events" strip.
- **Gallery** — photos with category tags matching the gallery page's filters.
- **Teachers** — name, role, bio, qualifications, photo, display order. Feeds the "Meet the Faculty" section on the About page.
- **Visit Requests / Admission Enquiries** — read-only views of MongoDB-stored form submissions (Admission Registration submissions are in your Google Sheet instead — see above, not in this dashboard).

The public pages fetch this content client-side via `assets/js/cms.js`. If the API isn't reachable, pages fall back to the static placeholder content already in the HTML — nothing breaks either way.

## Or deploy from the CLI

```bash
npm i -g vercel
cd vercel-ready
vercel        # first deploy, follow the prompts
vercel --prod # promote to production
```

## Test locally first (optional)

```bash
cp .env.example .env.local   # fill in every value
vercel dev
```

## Known limitations (being direct about what's left)

- **Video** — the homepage hero has a real, working `<video>` element (autoplay/muted/loop/playsinline, gradient overlay, text on top) pointing at `assets/video/campus-hero.mp4`. That file doesn't exist yet — I can't source real campus footage. Until you add one, it gracefully shows its poster image instead (nothing breaks). See `assets/video/README.md`.
- **Rate limiting** — form endpoints aren't rate-limited on this serverless deployment (in-memory limiting doesn't work across function invocations). Low risk for a school's form volume; add Vercel's Attack Challenge Mode or a Redis-backed limiter if it becomes one.
- **Enquiry form** — unchanged from the general enquiry form built earlier. I was told this should be "updated per a spec originally provided" but never received that reference — it still works (validation, MongoDB storage, email, success animation), just wasn't redesigned.
- **React/Next.js/Framer Motion/GSAP/Lottie** — still static HTML/Tailwind/vanilla JS + AOS. Rebuilding in React is a from-scratch effort, not incremental.
- **CSRF hardening beyond SameSite cookies** — see admin login section above.

## Editing content/design

Page copy/nav/footer live in `frontend/build.py` + `frontend/pages.py` in the main project zip — edit there, regenerate, and copy the HTML output here (this bundle's structure otherwise matches `frontend/` exactly, plus the `/api` folder and `admin.html`).
