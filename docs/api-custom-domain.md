# Setting up `api.assembl.co.nz` for the MCP gateway

The `@assembl/mcp` npm package defaults to calling `https://api.assembl.co.nz` so customers get a clean branded URL in their MCP client config. This document explains the DNS + proxy setup required to make that URL serve the `mcp-router` Supabase edge function.

## Why a proxy is needed

Lovable's custom-domain feature routes a domain to your **frontend** (`https://assembl.co.nz` → the React app). It does not let you map a subdomain straight to an arbitrary Supabase edge function. So we need a thin proxy layer in between:

```
api.assembl.co.nz  →  Cloudflare Worker  →  https://ssaxxdkxzrvkdjsanhei.supabase.co/functions/v1/mcp-router
```

You can use any of:

- **Cloudflare Workers** (recommended — free tier covers expected MCP traffic, low latency, easy to deploy)
- **Vercel rewrites** (if you already host other Assembl marketing on Vercel)
- **Netlify redirects**
- **Caddy / nginx** on a small VPS

The Cloudflare Worker setup is below.

## Cloudflare Worker setup (recommended)

### 1. Add `assembl.co.nz` to Cloudflare (if not already)

If your DNS is currently elsewhere, follow Cloudflare's [add a site flow](https://developers.cloudflare.com/fundamentals/setup/manage-domains/add-site/). You'll change your registrar's nameservers to Cloudflare's. **Important:** keep all existing records (including the Lovable A records `185.158.133.1`) so `assembl.co.nz` continues to serve the marketing site.

### 2. Create the worker

In the Cloudflare dashboard → **Workers & Pages → Create application → Create Worker**. Name it `assembl-mcp-proxy`.

Paste this code:

```js
const UPSTREAM = "https://ssaxxdkxzrvkdjsanhei.supabase.co/functions/v1/mcp-router";

export default {
  async fetch(request) {
    // Pass-through, but rewrite the host. Method, headers, and body all
    // forwarded as-is so JSON-RPC and the X-Assembl-Api-Key header arrive
    // intact at the edge function.
    const url = new URL(request.url);
    const upstream = new URL(UPSTREAM);
    upstream.search = url.search;

    const headers = new Headers(request.headers);
    headers.set("Host", upstream.host);

    const proxied = await fetch(upstream.toString(), {
      method: request.method,
      headers,
      body: request.method === "GET" || request.method === "HEAD" ? undefined : request.body,
    });

    // Strip hop-by-hop headers and return.
    const out = new Headers(proxied.headers);
    out.delete("transfer-encoding");
    return new Response(proxied.body, {
      status: proxied.status,
      headers: out,
    });
  },
};
```

Click **Save and deploy**.

### 3. Add the route

Workers & Pages → your worker → **Triggers → Add Custom Domain**. Enter `api.assembl.co.nz`. Cloudflare creates the DNS record automatically and provisions SSL.

### 4. Verify

```bash
curl -X POST https://api.assembl.co.nz \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json, text/event-stream' \
  -H 'X-Assembl-Api-Key: asm_live_...' \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{}}'
```

Expected: a JSON-RPC `result` with `protocolVersion: "2024-11-05"`.

## Vercel alternative

If you'd rather use Vercel, add this `vercel.json` to a small static project deployed at `api.assembl.co.nz`:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "https://ssaxxdkxzrvkdjsanhei.supabase.co/functions/v1/mcp-router/$1"
    }
  ]
}
```

## Until DNS is live

The npm package supports a fallback. Customers can set:

```
"env": { "ASSEMBL_API_URL": "https://ssaxxdkxzrvkdjsanhei.supabase.co/functions/v1/mcp-router" }
```

or pass `ASSEMBL_USE_FALLBACK=1`. Once `api.assembl.co.nz` is live, remove that env var and the package will pick up the default.

## Security notes

- The proxy is unauthenticated by design — auth happens **inside** the edge function via `X-Assembl-Api-Key` against `mcp_api_keys`.
- Keep the upstream Supabase URL secret? **Not required** — the URL alone is useless without a valid API key. But omit it from public docs if you'd rather not advertise the underlying provider.
- Cloudflare's free plan logs nothing by default; enable Workers Logs if you need request-level visibility.
