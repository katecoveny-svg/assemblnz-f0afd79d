-- Demo magic links: one signed link per prospect, revocable, tracked.
--
-- Each row is one invite — one link, one recipient, one pilot demo. The raw
-- signed token only ever exists inside the URL Kate copies; the table stores
-- a SHA-256 of it (token_hash) so a DB leak never leaks working links.
--
-- Access model: NO RLS policies on purpose. RLS is enabled with zero
-- policies, so anon/authenticated see nothing; the only readers/writers are
-- the service-role key (middleware + /admin server actions, both behind
-- their own gates). Nothing public ever reads this table.

create table if not exists public.demo_invites (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  demo text not null,
  recipient_name text not null,
  recipient_company text not null,
  recipient_email text,
  token_hash text not null,
  -- 'name' → "kia ora Liana" · 'company' → "welcome, Aironaut Customs Brokers"
  greeting_mode text not null default 'name'
    check (greeting_mode in ('name', 'company')),
  notes text,
  created_at timestamptz not null default now(),
  last_opened_at timestamptz,
  open_count integer not null default 0,
  revoked_at timestamptz
);

alter table public.demo_invites enable row level security;

create index if not exists demo_invites_demo_idx on public.demo_invites (demo);

-- Atomic open-tracking + validity read for the middleware: one round trip
-- returns the personalisation fields and bumps the counters — but never
-- bumps a revoked invite (a dead link must not look "recently viewed").
create or replace function public.touch_demo_invite(p_slug text)
returns table (
  demo text,
  recipient_name text,
  recipient_company text,
  greeting_mode text,
  revoked boolean
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v public.demo_invites%rowtype;
begin
  select * into v from public.demo_invites di where di.slug = p_slug;
  if not found then
    return;
  end if;

  if v.revoked_at is not null then
    return query select v.demo, v.recipient_name, v.recipient_company, v.greeting_mode, true;
    return;
  end if;

  update public.demo_invites di
     set open_count = di.open_count + 1,
         last_opened_at = now()
   where di.slug = p_slug;

  return query select v.demo, v.recipient_name, v.recipient_company, v.greeting_mode, false;
end;
$$;

-- Service-role only — the public roles can neither call the function nor
-- see the table it reads.
revoke all on function public.touch_demo_invite(text) from public;
revoke all on function public.touch_demo_invite(text) from anon;
revoke all on function public.touch_demo_invite(text) from authenticated;
