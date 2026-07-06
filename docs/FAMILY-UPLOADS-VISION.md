# Family Uploads + Vision

The upload/scan half of the Family OS demo. A parent snaps a photo (receipt,
fridge, product, school newsletter) or a short video; the bytes land in a
**private** bucket; a vision model reads them and **proposes** `family_items`. A
named adult approves everything in the ops console before anything becomes a real
handoff. **Draft-only** — nothing is bought, paid, RSVP'd or sent.

## Pieces

| File | What it does |
| --- | --- |
| `supabase/migrations/20260715090000_family_uploads.sql` | Private `family-uploads` bucket (service-role-only RLS), `public.family_uploads` table (RLS, no policies), daily 30-day purge cron. |
| `supabase/functions/family-vision/index.ts` | Downloads the file, runs a per-kind vision extraction (Gemini gateway), maps to proposed `family_items`, assigns an A/B/C trust score, updates the row. |
| `lib/family/uploads.ts` | Next server contract the UI calls: `uploadAndScan()`, `listUploads()`. |
| `supabase/config.toml` | `[functions.family-vision] verify_jwt = false`. |

## Privacy posture (Privacy Act 2020 / IPP 3A)

Uploads may contain **child data**, so none of it leaves the tenant:

- The `family-uploads` bucket is **private** (`public = false`) — no anon/public read.
- All access is **service-role only** (the edge function + the Next helper).
- `family_uploads` has **RLS enabled, no policies** — same posture as `family_items`.
- A **30-day purge** cron deletes rows **and** the underlying storage objects (data minimisation).

## The UI contract — `lib/family/uploads.ts`

```ts
type FamilyUploadKind = 'receipt' | 'fridge' | 'product' | 'newsletter' | 'video';

type FamilyUpload = {
  id: string;
  hub: string;
  kind: FamilyUploadKind | null;
  storage_path: string | null;
  uploaded_by: string | null;
  status: 'processing' | 'reviewed' | 'done' | 'failed';
  trust: 'A' | 'B' | 'C' | null;
  summary: string | null;
  review: boolean;
  created_at: string;
};

async function uploadAndScan(input: {
  file: { bytes: Uint8Array | ArrayBuffer | Buffer; name: string; type: string };
  kind: FamilyUploadKind;
  hub?: string;         // default 'demo'
  uploadedBy?: string;
}): Promise<{ ok: boolean; uploadId?: string; error?: string }>;

async function listUploads(hub?: string, limit?: number): Promise<FamilyUpload[]>;
```

`uploadAndScan` validates type + size (images png/jpg/webp/heic + pdf ≤ 15MB;
video mp4/mov/webm ≤ 30MB — larger is rejected with a clear message), uploads to
`<hub>/<yyyymm>/<uuid>.<ext>`, files a `processing` row, then fires the
`family-vision` function. All fail-soft — never throws.

## The `family-vision` request / response

**Request** `POST /functions/v1/family-vision` (service-role Authorization + apikey):

```json
{ "path": "demo/202607/<uuid>.jpg", "kind": "receipt", "hub": "demo", "uploadedBy": "Kate", "uploadId": "<family_uploads.id>" }
```

**Response** (always `200`; `ok:false` on a soft failure):

```json
{ "ok": true, "uploadId": "<id>", "kind": "receipt", "trust": "A", "created": 2, "summary": "…", "paymentDraftId": null }
```

## Per-kind behaviour

- **receipt** → `{store, date, total, line_items[], unusual[]}`. Files a `memory`
  note of the receipt; any `unusual` spend also files an `approval` (kind `money`).
- **fridge / product** → `{spotted[], runningLow[], suggested_items[]}`.
  `runningLow` + `suggested_items` become one proposed `shopping` item.
- **newsletter** → the same **ParsedWeek** shape as `lib/family/parse.ts`
  (events/tasks/pickups/shopping/approvals/memory), mapped exactly like
  `family-inbox-sync`. If it finds an amount due (e.g. a **Kindo** payment) it
  **also files a DRAFT** into `agent_action_requests` (kind `email_draft`,
  `pending`) — **never** submits or pays.

## Trust score (A / B / C)

The model returns a `confidence` hint; the function maps it:

- **A** — clear text, high-confidence extraction (`confidence: "high"`).
- **B** — partial / some uncertainty (`confidence: "medium"` or unknown).
- **C** — unclear image / low confidence (`confidence: "low"`).

Reasoning is stored in the `vision` JSON on the `family_uploads` row.

## Video limitation

Deno can't decode video frames server-side. For `kind = 'video'`, the function
does **not** attempt frame extraction — it returns **trust `C`** with the summary
_"Video received — please add a still frame for a confident read"_ and creates
**nothing**. The UI enforces the **30s / 720p** framing client-side and sends a
captured **still** (as `product` or `newsletter`) for a confident read.

## Env vars

| Var | Where | Purpose |
| --- | --- | --- |
| `SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_URL` | function / Next | project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | both | service-role auth (RLS bypass, storage, function call) |
| `GEMINI_API_KEY` | function | the vision gateway (same as echo-respond / fridge-to-list); falls back to `LOVABLE_API_KEY` |

The 30-day purge runs via `pg_cron` (a plain SQL delete — no edge round-trip). If
`pg_cron` isn't enabled the migration no-ops with a notice; schedule it via the
Supabase dashboard.
