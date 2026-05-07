# vessel-generate

Supabase Edge Function that proxies image generation requests to Fal.ai
(Flux 1.1 Pro) and OpenAI (gpt-image-1). Provider API keys live in Supabase
Edge Function secrets so the browser studio can call this endpoint without
exposing credentials.

## What it does

- Accepts `POST` requests with a JSON body describing the model, prompt, and
  aspect ratio.
- Routes to either Fal.ai or OpenAI based on `model`.
- Normalises both providers' responses into a single response shape.
- Returns image URLs (Fal.ai) or `data:image/jpeg;base64,...` URLs (OpenAI,
  which returns base64 from `gpt-image-1`).
- Reports a cost estimate alongside each response so the studio can keep a
  running tally without inspecting provider invoices.

## Auth

The function expects a Bearer token equal to the
`VESSEL_STUDIO_SHARED_SECRET` Supabase secret. Missing or mismatched headers
return `401 Unauthorized`. The shared secret is rotatable independently of
the provider keys.

## Required secrets

Set on the assembl-prod Supabase project (`wurwcrgxjjwqdaxqceey`):

| Secret | Purpose |
|---|---|
| `VESSEL_STUDIO_SHARED_SECRET` | Bearer token the studio must present |
| `FAL_API_KEY` | Fal.ai API key (server-side only) |
| `OPENAI_API_KEY` | OpenAI key. Set to literal `PENDING` until identity verification clears — `model: "openai"` returns 503 while pending |

## Request

```http
POST /functions/v1/vessel-generate
Authorization: Bearer <VESSEL_STUDIO_SHARED_SECRET>
Content-Type: application/json

{
  "model": "flux" | "openai",
  "prompt": "string (required, descriptive prompt only — no Midjourney flags)",
  "aspect_ratio": "16:9" | "4:5" | "1:1" | "9:16",
  "variants": 1,                  // optional, 1–4, default 1
  "sref": "https://example.com/x.jpg"  // optional, accepted but currently unused (see note below)
}
```

> **Note on `sref`:** the request schema accepts `sref` for forward
> compatibility, but it is NOT currently forwarded to either provider.
> gpt-image-1's `/v1/images/generations` endpoint doesn't accept a
> reference URL — that's the `/v1/images/edits` endpoint, which would
> require uploading a reference image as multipart form data. If you need
> reference-driven generation, it requires a function update.

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
| 400 | Malformed JSON or invalid field (model, prompt, aspect_ratio, variants) |
| 401 | Bearer token missing or doesn't match `VESSEL_STUDIO_SHARED_SECRET` |
| 405 | Method other than POST/OPTIONS |
| 500 | Server misconfigured (a required secret is unset) |
| 502 | Provider returned non-2xx, returned no images, or the request timed out (120s) |
| 503 | `model: "openai"` requested while `OPENAI_API_KEY === "PENDING"` |

Provider error bodies are passed through (truncated to 500 chars). API
keys are never logged or echoed.

## Calling from the browser

```js
const FUNCTION_URL = "https://wurwcrgxjjwqdaxqceey.supabase.co/functions/v1/vessel-generate";
const SHARED_SECRET = "..."; // pasted into the studio config, never in source

async function generate({ model, prompt, aspect_ratio, variants = 1, sref }) {
  const res = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${SHARED_SECRET}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ model, prompt, aspect_ratio, variants, sref }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error ?? `HTTP ${res.status}`);
  }
  return await res.json();
}
```

CORS is open (`Access-Control-Allow-Origin: *`) so the studio can be hosted
on any domain — auth still requires the Bearer token.

## Cost estimates

| Provider | Per variant | Notes |
|---|---|---|
| Fal.ai (Flux 1.1 Pro) | $0.04 USD | 28 inference steps, guidance scale 3.5 |
| OpenAI (gpt-image-1) | $0.19 USD | quality: high |

Multiply by the `variants` parameter for the total cost. The function
returns `cost_estimate_usd` in the response.

## Aspect ratio mapping

| Input | Fal.ai `image_size` | OpenAI `size` | Returned dimensions |
|---|---|---|---|
| `16:9` | `landscape_16_9` | `1536x1024` | Fal: 1344×768 / OpenAI: 1536×1024 |
| `4:5` | `portrait_4_5` | `1024x1024` | Fal: 832×1024 / OpenAI: 1024×1024 |
| `1:1` | `square_hd` | `1024x1024` | Fal: 1024×1024 / OpenAI: 1024×1024 |
| `9:16` | `portrait_16_9` | `1024x1536` | Fal: 768×1344 / OpenAI: 1024×1536 |

## Rotating the shared secret

If `VESSEL_STUDIO_SHARED_SECRET` leaks (or on a routine rotation cadence):

1. Generate a new 32-character random string:
   ```sh
   python3 -c "import secrets; print(secrets.token_urlsafe(24))"
   ```
2. Update the secret in Supabase: dashboard → Project Settings → Edge
   Functions → Secrets → click `VESSEL_STUDIO_SHARED_SECRET` → paste new
   value → Save. (The dashboard UI sometimes pre-fills with the existing
   value and Save fires silently with the old value — if so, delete the
   entry and re-add it with the new value.)
3. Verify the new value took effect: `curl -i -X POST -H "Authorization: Bearer <new>" -H "Content-Type: application/json" -d '{"model":"flux","prompt":"test","aspect_ratio":"1:1"}' https://wurwcrgxjjwqdaxqceey.supabase.co/functions/v1/vessel-generate` should NOT return 401.
4. Update the studio's config with the new secret. Until the studio is
   updated it will get 401s — keep the rotation window short.

## Rotating provider API keys

Same pattern, but the rotation happens at the provider first
(`fal.ai/dashboard/keys`, `platform.openai.com/api-keys`) — generate a
new key, paste into the Supabase secret, then revoke the old key on the
provider dashboard. Never rotate Supabase first, that breaks the function
until the new provider key arrives.

## Operational notes

- CORS open to `*` — the studio can be hosted anywhere.
- Provider timeout is 120 seconds (high-quality OpenAI gens can run long).
- This function does not log prompts or response data. If you need request
  telemetry later, add it explicitly — don't shotgun `console.log` and risk
  leaking provider responses into Supabase logs.
- Provider error bodies are truncated to 500 chars before being returned
  to the client, so a verbose provider error doesn't push past response
  size limits.
