# Industry Pack Deployment Surfaces

Industry Pack tenants can expose their active kete agents in three public formats:

1. Public chat link: `https://assembl.co.nz/c/<tenant-slug>`
2. Embed widget: a single script tag that opens an iframe chat panel
3. Installable app: the same public chat route with a tenant-specific web app manifest

Operators manage all three from `/app/<tenant-slug>/deploy`.

## Public Chat Link

Share the tenant URL directly:

```html
https://assembl.co.nz/c/<tenant-slug>
```

The route loads tenant branding from `tenants.logo_url`, `tenants.brand_color`, and `tenants.name`, then routes each message through the tenant's active kete endpoint.

## Embed Widget

Paste the script before the closing `</body>` tag on the tenant website:

```html
<script
  async
  src="https://assembl.co.nz/widget.js"
  data-tenant="<tenant-slug>"
  data-kete="<kete-slug>"
  data-brand-color="#2B6B57"
></script>
```

The script is dependency-free JavaScript. It injects a bottom-right chat bubble, opens `/c/<tenant-slug>/embed` in an iframe, and listens for `postMessage` resize and close events from the iframe.

## Installable App

Each tenant has a dynamic manifest:

```html
https://assembl.co.nz/c/<tenant-slug>/manifest.json
```

The manifest uses the tenant name, logo, brand colour, and `/c/<tenant-slug>` start URL. Mobile users can open the public chat link and choose Add to Home Screen. Desktop users can install from supported browser menus.

## Guardrails

Public chat goes through `/api/public-chat` before an agent endpoint is called.

- Anonymous sessions are capped at 20 messages.
- Anonymous sessions are capped at an estimated 10,000 tokens.
- Tenant monthly spend is checked against `tenants.credit_nzd` when a tenant credit cap is set.
- Over-cap traffic receives: `Our chat is taking a short break. Please email <tenant.contact_email>.`
- Public invocations are logged to analytics with the `public-widget` channel marker where the deployed schema supports it, with a compatible fallback for the existing analytics tables.

All agent replies remain draft-oriented and route through the existing kete endpoints. No per-kete endpoint internals are modified by the deployment surfaces.
