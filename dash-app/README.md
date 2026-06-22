# Dash app — starter scaffold

A Next.js + Supabase starter for **Dash**: the opt-in reward layer for AI agent wait time.
It runs in **demo mode out of the box** (no backend), then you wire up Supabase to make it real.

> New to this? You only need two free tools: **Node.js** (to run the app) and later a **Supabase** account (the database). That's it.

---

## 1. Run it right now (demo mode, no backend)

1. Install **Node.js 18+** from nodejs.org (one-time).
2. Open a terminal in this `dash-app` folder.
3. Run:
   ```bash
   npm install
   npm run dev
   ```
4. Open **http://localhost:3000** — you'll see a pretend NZ AI agent with the Dash loader. Click **Switch Dash on** and watch it work → earn → choose a reward.

Nothing real happens yet (no money, no database) — it's the full experience in demo mode so you can show people.

> Even faster, zero-install preview: open `../dash-loader-demo.html` in any browser. Same demo, no Node needed.

---

## 2. What's in here

```
app/                 the web page (the demo host app + loader)
components/DashLoader.tsx   ← the core product (opt-in → working → reward)
lib/supabaseClient.ts       ← connects to Supabase (off in demo mode)
supabase/schema.sql         ← the database tables (run in Supabase)
supabase/functions/         ← serve-slot + record-view (the "Brain")
.env.example                ← copy to .env.local to go real
```

---

## 3. Make it real (when you're ready)

Follow `dash-build-checklist.md` (Phases 1–4). Short version:

1. Create a free **Supabase** project.
2. In Supabase → **SQL Editor**, paste and run `supabase/schema.sql`.
3. Copy `.env.example` → `.env.local` and paste your Supabase URL + anon key (Project Settings → API).
4. Deploy the two Edge Functions:
   ```bash
   npx supabase functions deploy serve-slot
   npx supabase functions deploy record-view
   ```
5. In `components/DashLoader.tsx`, replace the two `TODO (real mode)` spots with real `fetch()` calls to those functions (Claude can do this in one step — paste it the file and the checklist).

---

## 4. Build tips
- Work one small change at a time; run `npm run dev` after each.
- Keep keys in `.env.local` only — never commit them (`.gitignore` already covers it).
- The wallet is an **append-only ledger** — never edit a balance, just add `wallet_entries` rows and sum them. Ask Claude to write a test for the maths.
- Deploy the site free on **Vercel** when ready (`vercel` CLI or connect the GitHub repo).

---

*Part of the Dash docs set: `dash-build-checklist.md` (steps), `dash-design-brief.md` (look), `dash-strategy-and-build-playbook.md` (why). A product of Assembl.*
