# vessel-generate (v2)

Supabase Edge Function on the assembl-prod project that proxies image
generation requests to Fal.ai (Flux 1.1 Pro and Flux 1.1 Pro Ultra Redux)
and OpenAI (gpt-image-1). Provider API keys live in Supabase Edge Function
secrets so the browser studio and in-app Auaha studios can call this
endpoint without exposing credentials.

## What it does

- Accepts `POST` requests with a JSON body describing the model, prompt,
  aspect ratio, and (optional) reference image.
- Routes to one of three upstream endpoints:
  - **Flux 1.1 Pro** (`/v1.1`) when no `image_url` is provided
  - **Flux 1.1 Pro Ultra Redux** (`/v1.1-ultra-redux`) when `image_url` is
    provided — image-driven generation
  - **OpenAI gpt-image-1** when `model: "openai"`
- Normalises both providers' responses into a single response shape.
- Returns hosted image URLs (Fal.ai) or `data:image/jpeg;base64,...` URLs
  (OpenAI returns base64 from gpt-image-1).
- Reports a cost estimate alongside each response so the studio can keep a
  running tally without inspecting provider invoices.
- Sanitises upstream provider error bodies before returning them so an
  accidental key echo from a misconfigured upstream proxy never reaches
  the client.

## Auth

The function expects a Bearer token equal to the
`VESSEL_STUDIO_SHARED_SECRET` Supabase secret. Missing or mismatched
headers return `401 Unauthorized`. The shared secret is rotatable
independently of the provider keys.

In the browser studio, the secret is exposed as
`NEXT_PUBLIC_VESSEL_STUDIO_SHARED_SECRET` so client-side fetches can read
it. Note that `NEXT_PUBLIC_*` vars are baked into the browser bundle and
visible to anyone who can view the studio source — the shared secret is
shared in the literal sense. CORS is the second layer; the Bearer token
is the first. Anyone with serious abuse intent could extract the secret
from the bundle and bypass CORS via curl, so don't treat this as a hard
security boundary — it's a friction layer for casual scraping plus a
clean key-isolation contract between the studio and provider APIs.

## Required secrets

Set on assembl-prod (`wurwcrgxjjwqdaxqceey`):

| Secret | Purpose |
|---|---|
| `VESSEL_STUDIO_SHARED_SECRET` | Bearer token the studio must present (32 chars) |
| `FAL_API_KEY` | Fal.ai API key — server-side only, never logged |
| `OPENAI_API_KEY` | OpenAI key. Set to literal `PENDING` until identity verification clears — `model: "openai"` returns 503 while pending |
| `ALLOWED_ORIGINS` | Comma-separated list of CORS origins. Default: `https://assembl.co.nz,http://localhost:3000` |

## Request

```http
POST /functions/v1/vessel-generate
Authorization: Bearer <VESSEL_STUDIO_SHARED_SECRET>
Origin: https://assembl.co.nz
Content-Type: application/json

{
  "model": "flux" | "openai",
  "prompt": "string (required, descriptive prompt only — no Midjourney flags)",
  "aspect_ratio": "16:9" | "4:5" | "1:1" | "9:16",
  "variants": 1,                  // optional, 1–4, default 1
  "sref": "<midjourney sref>",    // optional, accepted but ignored server-side
  "image_url": "https://... or data:image/png;base64,...",  // optional, triggers Ultra Redux for flux
  "image_prompt_strength": 0.35    // optional, 0–1, default 0.35 (Ultra Redux only)
}
```

`image_url` accepts:

- `https://...` hosted URLs
- `http://localhost...` and `http://127.0.0.1...` for development
- `data:image/(png|jpeg|webp);base64,...` data URLs

Anything else returns `400`.

## Response

```json
{
  "images": [
    {
      "url": "https://...jpg" | "data:image/jpeg;base64,...",
      "width": 1344,
      "height": 768,
      "content_type": "image/jpeg"
    }
  ],
  "model": "flux",
  "cost_estimate_usd": 0.04,
  "generated_at": "2026-05-07T05:00:00.000Z"
}
```

## Error responses

| Status | Meaning |
|---|---|
| 400 | Malformed JSON or invalid field (model, prompt, aspect_ratio, variants, image_url, image_prompt_strength) |
| 401 | Bearer token missing or doesn't match `VESSEL_STUDIO_SHARED_SECRET` |
| 405 | Method other than POST/OPTIONS |
| 500 | Server misconfigured (a required secret is unset) |
| 502 | Provider returned non-2xx, or returned no images |
| 503 | `model: "openai"` requested while `OPENAI_API_KEY === "PENDING"` |
| 504 | Provider request timed out (60s) |

API keys are never logged or returned in error bodies. Provider error
bodies are passed through (truncated to 500 chars) after key-pattern
redaction.

## CORS

Only origins listed in `ALLOWED_ORIGINS` get an
`Access-Control-Allow-Origin` header echoed back. Browsers will refuse
cross-origin reads from any other origin. Non-browser callers (curl,
server-to-server) bypass CORS entirely — the Bearer token is the only
gate for them.

The `Vary: Origin` header is set on every response so caches don't serve
mismatched-origin responses.

## Cost-per-call

| Provider | Endpoint | Cost / variant (USD) | Notes |
|---|---|---|---|
| Fal.ai | `/v1.1` (no `image_url`) | $0.04 | 28 inference steps, guidance 3.5 |
| Fal.ai | `/v1.1-ultra-redux` (with `image_url`) | $0.06 | image-driven generation, image_prompt_strength 0–1 |
| OpenAI | `gpt-image-1` | $0.19 | quality: high |

Multiply by `variants` for the total. The function returns
`cost_estimate_usd` in the response.

## Aspect ratio mapping

| Input | Fal.ai `image_size` (v1.1) | Fal.ai Ultra Redux | OpenAI `size` |
|---|---|---|---|
| `16:9` | `landscape_16_9` | `16:9` (passed literally) | `1536x1024` |
| `4:5` | `portrait_4_5` | `4:5` (passed literally) | `1024x1024` |
| `1:1` | `square_hd` | `1:1` (passed literally) | `1024x1024` |
| `9:16` | `portrait_16_9` | `9:16` (passed literally) | `1024x1536` |

## Calling from the browser studio

```js
const FUNCTION_URL = "https://wurwcrgxjjwqdaxqceey.supabase.co/functions/v1/vessel-generate";
const SHARED_SECRET = process.env.NEXT_PUBLIC_VESSEL_STUDIO_SHARED_SECRET;

async function generate({ model, prompt, aspect_ratio, variants = 1, image_url, image_prompt_strength }) {
  const res = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${SHARED_SECRET}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      prompt,
      aspect_ratio,
      variants,
      ...(image_url ? { image_url, image_prompt_strength } : {}),
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error ?? `HTTP ${res.status}`);
  }
  return await res.json();
}
```

## Rotating the shared secret

If `VESSEL_STUDIO_SHARED_SECRET` leaks (or on a routine rotation cadence):

1. Generate a new 32-character random string:
   ```sh
   python3 -c "import secrets; print(secrets.token_urlsafe(24))"
   ```
2. Update the secret in Supabase: dashboard → Project Settings → Edge
   Functions → Secrets → click `VESSEL_STUDIO_SHARED_SECRET` → paste new
   value → Save. (The dashboard sometimes pre-fills the field with the
   existing value; if Save fires silently with the old value, delete the
   entry and re-add it instead.)
3. Verify: a curl with the new token should NOT return 401.
4. Update the studio's env (`NEXT_PUBLIC_VESSEL_STUDIO_SHARED_SECRET`)
   and redeploy. Until the studio is updated, every studio request
   returns 401 — keep the rotation window short.

## Updating ALLOWED_ORIGINS

To add or remove an origin (e.g., a new staging domain):

1. Edit the secret in Supabase: dashboard → Project Settings → Edge
   Functions → Secrets → `ALLOWED_ORIGINS` → set new comma-separated
   list (e.g., `https://assembl.co.nz,https://staging.assembl.co.nz,http://localhost:3000`).
2. Save. The next request picks up the new list — no redeploy needed
   (the function reads the env var on every request, not at startup).
3. Verify: a curl with `Origin: <new origin>` should get
   `Access-Control-Allow-Origin: <new origin>` in the response.

Notes:
- Origins must be exact (scheme + host + port). `https://assembl.co.nz`
  and `https://www.assembl.co.nz` are different.
- No wildcards in `ALLOWED_ORIGINS` — the function does string equality
  match. If you need wildcard subdomains, edit the function code.

## Rotating provider API keys

Same pattern as the shared secret, but the rotation happens at the
provider first (fal.ai → API Keys; platform.openai.com → API Keys) —
generate a new key, paste into the Supabase secret, then revoke the old
key on the provider dashboard. Never rotate Supabase first; that breaks
the function until the new provider key arrives.

## Operational notes

- Provider timeout is 60 seconds. On AbortError the function returns
  `504` with a clear timeout message.
- This function does not log prompts or response data. If you need
  request telemetry later, add it explicitly — don't shotgun
  `console.log`, that risks leaking provider responses (which CAN
  contain partial keys in misconfigured upstream proxies) into Supabase
  logs.
- Provider error bodies are passed through to the client after key-
  pattern redaction (`sk-…`, `fal-…`, `Bearer …`, `authorization: …`)
  and 500-char truncation.
- `sref` is accepted in the request schema for studio compatibility but
  is NOT forwarded to either provider — neither Fal.ai nor OpenAI's
  /v1/images/generations endpoint accepts a Midjourney sref. Use
  `image_url` for image-driven Fal.ai generation instead.
