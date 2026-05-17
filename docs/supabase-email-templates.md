# Supabase email templates — branded header

The launch pack ships an email header that lives at
`https://www.assembl.co.nz/img/email/header.png` (600 × 200, paper background,
pounamu wordmark). Wrap every Supabase email template with this header so
magic-link and notification emails feel like the marketing site.

## HTML wrapper

Paste this snippet at the top of each template body in the Supabase dashboard
(Auth → Email Templates):

```html
<img src="https://www.assembl.co.nz/img/email/header.png"
     alt="assembl"
     width="600"
     height="200"
     style="display:block;width:100%;max-width:600px;height:auto;margin:0 auto 24px;" />
```

## Templates to update

There are 5 templates in the Supabase dashboard. Add the header to each:

1. Confirm signup
2. Invite user
3. Magic link
4. Change email address
5. Reset password

## Why this is a manual step

Email templates live in the Supabase project config, not in source control.
Apply this once via the dashboard after the asset deploys to production. The
header asset is already in the repo at `public/img/email/header.png` and will
be served at the URL above as soon as the next Vercel deploy lands.
