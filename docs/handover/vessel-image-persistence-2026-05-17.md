# Vessel Image Persistence — Handover

**Date:** 2026-05-17
**Branch:** `feat/vessel-image-persistence-2026-05-17`
**Repo:** `katecoveny-svg/assemblnz-f0afd79d`
**Supabase:** `wurwcrgxjjwqdaxqceey` (Sydney ap-southeast-2)

## Why

The current `/tools/vessel` flow returns the Fal.ai-hosted image URL straight
to the caller and persists it in `vessel_generations.image_url`. Fal URLs
expire (or at least are not guaranteed to persist), so:

- Shareable `/tools/vessel/output/[generationId]` links rot.
- Open Graph image meta points at a URL that may 404.
- We have no canonical archive of what was generated.

Fix: mirror every generation into a Supabase Storage bucket
(`vessel-generations`) and persist the bucket URL.

## Task 1 — Mirror Fal output to Supabase Storage

### 1.1 Apply via Supabase MCP, not via the dashboard.

### 1.2 Modify `app/api/vessel/generate/route.ts`

After Fal returns `imageUrl` and before inserting into `vessel_generations`,
download the image and re-upload to the `vessel-generations` bucket. Replace
the current `imageUrl` with the public bucket URL.

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
  const ext = contentType.includes('png') ? 'png'
    : contentType.includes('webp') ? 'webp' : 'jpg';
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

Wire it in so the row that lands in `vessel_generations` has the Supabase
Storage URL, not the Fal URL.

Important:

- Generate `generationId` (a UUID) **before** calling Fal, not after — so the
  storage path is deterministic.
- If the mirror upload fails, still return the Fal URL to the caller so the
  user sees their image — but log the failure and persist the row with the
  Fal URL plus `mirror_failed=true` so a future retry can pick it up.
- The visitor's response (`{ generationId, imageUrl, ... }`) should be the
  bucket URL when mirror succeeds, so the share link works immediately.

### 1.3 Add a `mirror_failed` column

Migration `20260517110100_vessel_mirror_failed.sql`:

```sql
ALTER TABLE public.vessel_generations
  ADD COLUMN IF NOT EXISTS mirror_failed boolean NOT NULL DEFAULT false;
```

If `mirrorToStorage` throws, set `mirror_failed=true` and persist the
original Fal URL. A future cron can sweep these.

### 1.4 Verify

- `pnpm typecheck` clean
- `pnpm next build` clean
- Open `https://<preview-url>/tools/vessel`, generate one
- Confirm response `imageUrl` starts with
  `https://wurwcrgxjjwqdaxqceey.supabase.co/storage/v1/object/public/vessel-generations/gen/...`
- Open the bucket in Supabase Studio → file exists at `gen/<uuid>.jpg`
- Open `https://<preview-url>/tools/vessel/output/<generationId>` → image
  renders, OG meta tag points at the bucket URL
- Generate a second one; confirm both bucket files exist and
  `vessel_generations` has two rows

### 1.5 Out of scope

- Image editing / inpainting
- Variant batches (the brief locked v1 to single-image)
- Stripe metering
- Cleanup cron for >90-day generations (separate task; non-urgent)

## Task 2 — Real watermark overlay (~1 hour, optional)

The current "watermark" is a prompt instruction to Fal asking for the text
`assembl.co.nz` in the bottom-right corner. Fal Flux is inconsistent at
rendering specified text — sometimes the watermark looks like garbled
symbols.

**Branch:** `feat/vessel-real-watermark-2026-05-17` (only after Task 1 is in)

### Path A — server-side canvas overlay (preferred)

- Install `sharp` (already a Next.js peer dep, may be present)
- After Fal returns the image and before uploading to Supabase Storage,
  composite a small `assembl.co.nz` text on the bottom-right with sharp
- Skip the overlay if `byok=true` (BYOK callers paid; they get a clean image)
- Drop the watermark line from the Fal prompt at the same time (saves
  prompt budget)

### Path B — keep prompt instruction, accept the unreliability

Leave it. Document as a known issue.

**Recommend Path A.** Verification: generate two images, one BYOK and one not.
Watermarked one has clean "assembl.co.nz" text in pounamu at the
bottom-right; BYOK one has nothing.

## Env vars to confirm on Vercel

These must be set on Production + Preview for the generator to work
end-to-end:

| Var                          | Where                              | Status                                                                |
| ---------------------------- | ---------------------------------- | --------------------------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`   | Vercel                             | should be set (already in use everywhere)                             |
| `SUPABASE_SERVICE_ROLE_KEY`  | Vercel (Sensitive)                 | confirmed set per the launch-followups brief                          |
| `VESSEL_STUDIO_SHARED_SECRET`| Vercel + Supabase Function Secrets | VERIFY — must match on both sides                                     |
| `FAL_API_KEY`                | Supabase Function Secrets (only)   | VERIFY — needed by `vessel-generate`                                  |
| `VESSEL_IP_HASH_SALT`        | Vercel (Sensitive)                 | optional; if unset, rate-limit uses a hardcoded salt                  |

Check via `vercel env ls` and the Supabase Studio → Edge Functions →
Secrets panel. If any of these are missing, generation will fail with a
500 from the route handler or a 401 from the edge function.

## Reporting cadence

After each checkpoint:

```
✓ [Task N · Step M] <one-line summary> · branch at <short-sha>
```

When draft PR is up:

```
✓ Task N DRAFT — PR #<num> — Vercel preview <url>
```

## Reference context

- Repo canon: `katecoveny-svg/assemblnz-f0afd79d`
- Vercel project: `prj_0pfAzWeZkMqgS6QAqO7c2BNwuZiR`, team `team_4fkROIfytNfYsGSjVX2dC2DI`
- Supabase project: `wurwcrgxjjwqdaxqceey` (Sydney ap-southeast-2)
- `vessel-generate` edge function: `c2a0d995-24cb-475b-80db-173558e3ec02`, currently v34
- Tables created by the prior PR: `vessel_brand_presets` (slug PK),
  `vessel_generations` (uuid PK, RLS, anon SELECT)
- Seed presets: `assembl`, `pilot-sprint`
- Public route handler: `app/api/vessel/generate/route.ts`
- Public pages: `app/tools/vessel/{page.tsx, [brand-slug]/page.tsx, output/[generationId]/page.tsx}`
- Components: `components/tools/{VesselGenerator.tsx, BrandColorPicker.tsx}`
- Rate-limit lib: `lib/vessel/rate-limit.ts` (5 per IP per day, BYOK uncapped)

## What NOT to do

- Don't touch `app/api/public-chat/route.ts` or `supabase/functions/public-chat-llm/` — they work, leave alone
- Don't touch `agent_prompts` table
- Don't change `vessel-generate` edge function (operator dashboard relies on it too)
- Don't add "AI" to customer-facing copy
- Don't strip macrons anywhere
- Don't merge directly to main — open a draft PR and let Kate review

## Implementation notes (added during Task 1)

- The `vessel-generations` storage bucket did not exist in prod as of
  2026-05-17. A second migration (`20260517110200_vessel_generations_bucket.sql`)
  creates it as public with a 10 MB size cap and `image/*` MIME allowlist,
  plus an RLS policy on `storage.objects` so service-role uploads succeed
  and anonymous reads work via the public CDN URL.
