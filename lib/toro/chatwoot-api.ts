/**
 * Chatwoot REST API helper for the Tōro draft pipeline.
 *
 * Single-tenant pilot: account id is hardcoded to the Hudson household
 * (164366). Once the multi-tenant migration applies, swap the constant for
 * a per-tenant lookup that reads `tenants.chatwoot_account_id` and pulls
 * the API token from Supabase Vault keyed by tenant.
 *
 * Spec: outputs/TORO-MULTI-TENANT-CHATWOOT-ARCHITECTURE-2026-05-09.md (§5).
 */

const PILOT_CHATWOOT_ACCOUNT_ID = 164366;

function readEnv(name: string, fallback?: string): string {
  const v = process.env[name];
  if (v && v.length > 0) return v;
  if (fallback !== undefined) return fallback;
  throw new Error(
    `Missing env ${name}. Set it in Vercel project env (and .env.local for ` +
      `local dev). For the pilot, the Chatwoot user access token lives in ` +
      `the session sandbox at /sessions/<sid>/mnt/outputs/.secrets/chatwoot.env.`,
  );
}

interface PostMessageOk {
  message_id: number;
}

interface ChatwootMessageResponse {
  id?: number;
}

/**
 * POST a message to a Chatwoot conversation as the bot user.
 *
 * @param conversationId Chatwoot conversation id (integer)
 * @param content        Message body to send
 * @returns              The Chatwoot message id
 * @throws               Error if the API rejects the request
 */
export async function postMessage(
  conversationId: number,
  content: string,
): Promise<PostMessageOk> {
  const baseUrl = readEnv("CHATWOOT_BASE_URL", "https://app.chatwoot.com");
  const accountId = Number(
    readEnv("CHATWOOT_ACCOUNT_ID", String(PILOT_CHATWOOT_ACCOUNT_ID)),
  );
  const token = readEnv("CHATWOOT_USER_API_TOKEN");

  const url =
    `${baseUrl.replace(/\/$/, "")}` +
    `/api/v1/accounts/${accountId}/conversations/${conversationId}/messages`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      api_access_token: token,
    },
    body: JSON.stringify({
      content,
      message_type: "outgoing",
      private: false,
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(
      `chatwoot postMessage failed: ${res.status} ${res.statusText}${
        detail ? ` — ${detail.slice(0, 500)}` : ""
      }`,
    );
  }

  const json = (await res.json().catch(() => ({}))) as ChatwootMessageResponse;
  if (typeof json.id !== "number") {
    throw new Error("chatwoot postMessage: response missing message id");
  }
  return { message_id: json.id };
}
