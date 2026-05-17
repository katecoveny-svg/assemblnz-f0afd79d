# Claude Code handover — wire image persistence for /tools/vessel

**Date:** 2026-05-17
**Status:** Codex is already executing on this in PR #222 (`feat/vessel-image-persistence-2026-05-17`). This doc is kept as the authoritative spec.

---

## Read this first — what shipped

The public Vessel Image Generator at `/tools/vessel` is live on main (PR #220 merged). It calls the existing `vessel-generate` Supabase edge function (Fal Flux 1.1 Pro), gets back a `fal.media/files/...` URL, displays it, and writes a row to `vessel_generations`.

**⚠️ Live status (2026-05-17 ~01:15 UTC):** Production POST returned `500: "Platform vessel generation is not configured on this deployment."` That was caused by `app/api/vessel/generate/route.ts` requiring `FAL_API_KEY` on the Vercel side, when that key actually only needs to live on Supabase. Fixed in a follow-up PR (claude/fix-vessel-platform-key-check). Once that merges, the route will surface real edge-function errors instead of bailing locally.

**Three problems with the current Fal-URL handoff:**

1. **Fal.ai URLs expire.** Their CDN holds files for ~24h-7d depending on plan. After that the image 404s.
2. **The shareable viewer (`/tools/vessel/output/[generationId]`) breaks** once the Fal URL expires — anyone who hit "copy share link" yesterday has a dead link today.
3. **Open Graph previews break** for the same reason. LinkedIn/X cache the OG image once, but if they re-fetch (or someone shares for the first time after the TTL), the unfurl shows nothing.

**Your job: mirror every generated image to Supabase Storage so the share URL is durable.**

## Locked context — do NOT change

- The route handler `app/api/vessel/generate/route.ts` orchestration — leave the rate-limit / BYOK split alone
- The edge function `supabase/functions/vessel-generate/index.ts` — works, do not touch
- Migration `supabase/migrations/20260517100000_vessel_brand_presets.sql` — already applied
- Branding rules (lowercase `assembl`, Pīkau/Mātauranga/Tōro macrons, Mārama Whenua palette `#2B6B57 / #D4A853 / #FAF7F2`, no "AI" in copy)
- The `vessel-generate` edge function is shared with the existing operator-facing `/dashboard/vessel-studio`. Anything you change there affects both surfaces.

## What to do

### Task 1: Mirror Fal.ai images to Supabase Storage (~2 hours)

**Branch:** `feat/vessel-image-persistence-2026-05-17`

#### 1.1 Create the storage bucket

Apply this migration as `supabase/migrations/20260517110000_vessel_storage_bucket.sql`:

```sql
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'vessel-generations',
  'vessel-generations',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

CREATE POLICY "vessel-generations readable by anon"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'vessel-generations');

CREATE POLICY "vessel-generations writable by service role"
  ON storage.objects FOR INSERT
  TO service_role
  WITH CHECK (bucket_id = 'vessel-generations');
```

Apply via Supabase MCP, **not** via the dashboard.

#### 1.2 Modify `app/api/vessel/generate/route.ts`

After Fal returns `imageUrl` and **before** inserting into `vessel_generations`, download the image and re-upload to the bucket. Replace the current `imageUrl` with the public bucket URL.

Sketch:

```ts
async function mirrorToStorage(
  service: ReturnType<typeof getServiceClient>,
  generationId: string,
  remoteUrl: string,
): Promise<string> {
  const res = await fetch(remoteUrl);
  if (!res.ok) throw new Error(`Fetching Fal image failed: ${res.status}`);
  const contentType = res.headers.get('content-type') ?? 'image/jpeg';
  const ext = contentType.includes('png') ? 'png' : contentType.includes('webp') ? 'webp' : 'jpg';
  const bytes = await res.arrayBuffer();
  const path = `gen/${generationId}.${ext}`;
  const { error } = await service.storage
    .from('vessel-generations')
    .upload(path, bytes, { contentType, upsert: false });
  if (error) throw error;
  const { data } = service.storage.from('vessel-generations').getPublicUrl(path);
  return data.publicUrl;
}
```

Wire it in so the row that lands in `vessel_generations` has the Supabase Storage URL, not the Fal URL.

Important:
- Generate `generationId` (a UUID) **before** calling Fal, not after — so the storage path is deterministic
- If the mirror upload fails, still return the Fal URL to the caller so the user sees their image — but log the failure and don't persist the row. Better: insert the row with the Fal URL and a `mirror_failed=true` flag so a retry can pick it up later
- The visitor's response (`{ generationId, imageUrl, ... }`) should be the **bucket URL**, so the share link works immediately

#### 1.3 Add a `mirror_failed` column (optional but cheap)

Migration `20260517110100_vessel_mirror_failed.sql`:

```sql
ALTER TABLE public.vessel_generations
  ADD COLUMN IF NOT EXISTS mirror_failed boolean NOT NULL DEFAULT false;
```

If `mirrorToStorage` throws, set `mirror_failed=true` and persist the original Fal URL. A future cron can sweep these.

#### 1.4 Verify

- `pnpm typecheck` clean
- `pnpm next build` clean
- Open `https://<preview-url>/tools/vessel`, generate one
- Confirm response `imageUrl` starts with `https://wurwcrgxjjwqdaxqceey.supabase.co/storage/v1/object/public/vessel-generations/gen/...`
- Open the bucket in Supabase Studio → file exists at `gen/<uuid>.jpg`
- Open `https://<preview-url>/tools/vessel/output/<generationId>` → image renders, OG meta tag points at the bucket URL
- Generate a second one; confirm both bucket files exist and `vessel_generations` has two rows

#### 1.5 Out of scope

- Image editing / inpainting
- Variant batches (the brief locked v1 to single-image)
- Stripe metering
- Cleanup cron for >90-day generations (separate task; non-urgent)

---

### Task 2: Real watermark overlay (~1 hour, optional)

The current "watermark" is a prompt instruction to Fal asking for the text "assembl.co.nz" in the bottom-right corner. Fal Flux is inconsistent at rendering specified text — sometimes the watermark looks like garbled symbols.

**Branch:** `feat/vessel-real-watermark-2026-05-17` (only after Task 1 is in)

Two paths:

**Path A — server-side canvas overlay (preferred):**
- Install `sharp` (already a Next.js peer dep, may be present)
- After Fal returns the image and **before** uploading to Supabase Storage, composite a small `assembl.co.nz` text on the bottom-right with `sharp`
- Skip the overlay if `byok=true` (BYOK callers paid; they get a clean image)
- Drop the watermark line from the Fal prompt at the same time (saves prompt budget)

**Path B — keep prompt instruction, accept the unreliability**
- Leave it. Document as a known issue.

Recommend Path A. Verification: generate two images, one BYOK and one not. Watermarked one has clean "assembl.co.nz" text in pounamu at the bottom-right; BYOK one has nothing.

---

### Env vars to confirm on Vercel

These must be set on **Production + Preview** for the generator to work end-to-end:

| Var | Where | Status |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Vercel | should be set (already in use everywhere) |
| `SUPABASE_SERVICE_ROLE_KEY` | Vercel (Sensitive) | confirmed set per the launch-followups brief |
| `VESSEL_STUDIO_SHARED_SECRET` | Vercel + Supabase Function Secrets | **VERIFY** — must match on both sides; production 500 today suggests one side is missing or different |
| `FAL_API_KEY` | Supabase Function Secrets (only) | **VERIFY** — needed by `vessel-generate`. Do NOT add to Vercel — the route fix removes the spurious Vercel-side check |
| `VESSEL_IP_HASH_SALT` | Vercel (Sensitive) | optional; if unset, rate-limit uses a hardcoded salt |

Check via `vercel env ls` and the Supabase Studio → Edge Functions → Secrets panel. If any of these are missing, generation will fail with a 500 from the route handler or a 401 from the edge function.

---

## Reporting cadence

After each checkpoint:

```
✓ [Task N · Step M] <one-line summary> · branch at <short-sha>
```

When draft PR is up:

```
✓ Task N DRAFT — PR #<num> — Vercel preview <url>
```

---

## Reference context (no action required)

- Repo canon: `katecoveny-svg/assemblnz-f0afd79d`
- Vercel project: `prj_0pfAzWeZkMqgS6QAqO7c2BNwuZiR`, team `team_4fkROIfytNfYsGSjVX2dC2DI`
- Supabase project: `wurwcrgxjjwqdaxqceey` (Sydney `ap-southeast-2`)
- `vessel-generate` edge function: `c2a0d995-24cb-475b-80db-173558e3ec02`, currently v34
- Tables created by the prior PR: `vessel_brand_presets` (slug PK), `vessel_generations` (uuid PK, RLS, anon SELECT)
- Seed presets: `assembl`, `pilot-sprint`
- Public route handler: `app/api/vessel/generate/route.ts`
- Public pages: `app/tools/vessel/{page.tsx, [brand-slug]/page.tsx, output/[generationId]/page.tsx}`
- Components: `components/tools/{VesselGenerator.tsx, BrandColorPicker.tsx}`
- Rate-limit lib: `lib/vessel/rate-limit.ts` (5 per IP per day, BYOK uncapped)

---

## What NOT to do

- Don't touch `app/api/public-chat/route.ts` or `supabase/functions/public-chat-llm/` — they work, leave alone
- Don't touch `agent_prompts` table
- Don't change `vessel-generate` edge function (operator dashboard relies on it too)
- Don't add "AI" to customer-facing copy
- Don't strip macrons anywhere
- Don't merge directly to main — open a draft PR and let Kate review

End of brief.
