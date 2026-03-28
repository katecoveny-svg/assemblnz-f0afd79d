

## Fix Echo Voice and Health Check False Alerts

### Problem Summary
Three distinct issues are causing voice problems and dashboard noise:

1. **ElevenLabs TTS edge function is broken** — uses `supabase.auth.getClaims()` which does not exist in supabase-js v2. Any TTS fallback call will 500.
2. **Health check URLs are wrong** — producing constant false "error" status for 3 of 4 services, making the health dashboard useless.
3. **Conversational voice token endpoint** appears structurally correct but may fail silently if the ElevenLabs API key or agent IDs are stale.

### Plan

**Step 1: Fix `elevenlabs-tts` edge function auth**
- Replace `supabase.auth.getClaims(token)` with `supabase.auth.getUser()` (same pattern used in the conversation-token function)
- This restores the TTS fallback voice for all agents

**Step 2: Fix health check URLs**
- `supabase_api`: Use the REST healthcheck endpoint or pass the anon key via header instead of query param
- `chat_function`: These functions require POST + auth; change to a simple HEAD/OPTIONS check or accept that 401 = "reachable"
- `elevenlabs_api`: Update URL from `/v1/models` to a valid public endpoint (e.g. `/v1/voices` or the status endpoint)
- Treat HTTP 401/403 as "reachable but auth-required" (status: `ok`) for services that need auth

**Step 3: Redeploy both edge functions**
- Deploy `elevenlabs-tts` and `health-check`
- Test both via invoke to confirm they work

### Technical Details

**elevenlabs-tts fix** (lines ~37-42):
```typescript
// BEFORE (broken)
const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
if (claimsError || !claimsData?.claims) { ... }

// AFTER (working)
const { data: { user }, error: userError } = await supabase.auth.getUser();
if (userError || !user) { ... }
```

**health-check fix** — update `checkService` calls:
- Supabase API: pass apikey as header, not query param
- Chat function: use OPTIONS method (hits CORS preflight, confirms function is alive)
- ElevenLabs: check a valid public endpoint
- Treat 401/403 responses as "service reachable" (not an error)

