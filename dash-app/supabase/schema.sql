-- Dash database schema. Paste into Supabase > SQL Editor and run.
-- Append-only ledger: never UPDATE a balance, only INSERT rows and sum them.

create table if not exists app_users (
  id uuid primary key default gen_random_uuid(),
  auth_id uuid references auth.users(id),
  opted_in boolean not null default false,
  reward_destination text not null default 'charity', -- charity | kiwisaver | airpoints | everyday | cash
  created_at timestamptz default now()
);

create table if not exists hosts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  branding_mode text not null default 'dash',     -- dash | cobrand | whitelabel
  revenue_share numeric not null default 0.40,
  api_key text unique not null default encode(gen_random_bytes(16), 'hex'),
  created_at timestamptz default now()
);

create table if not exists campaigns (
  id uuid primary key default gen_random_uuid(),
  advertiser text not null,
  ad_line text not null,
  reward_text text,
  bid_cents int not null default 0,               -- per 1000 views
  status text not null default 'active',
  created_at timestamptz default now()
);

create table if not exists impressions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references app_users(id),
  host_id uuid references hosts(id),
  campaign_id uuid references campaigns(id),
  context text,                                    -- 'spinner' | 'agent_working' | 'completion'
  viewed_seconds numeric default 0,
  clicked boolean default false,
  device_hash text,
  created_at timestamptz default now()
);

create table if not exists wallet_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references app_users(id) not null,
  amount_cents int not null,                       -- + earned, - redeemed
  reason text not null,                            -- 'impression' | 'click' | 'redemption'
  ref_id uuid,
  created_at timestamptz default now()
);

create table if not exists redemptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references app_users(id) not null,
  amount_cents int not null,
  destination text not null,
  status text not null default 'pending',          -- pending | paid | failed
  created_at timestamptz default now()
);

-- balance = sum of the ledger
create or replace view wallet_balances as
select user_id, coalesce(sum(amount_cents), 0)::int as balance_cents
from wallet_entries
group by user_id;

-- a starter campaign so serve-slot returns something
insert into campaigns (advertiser, ad_line, reward_text, bid_cents)
values ('Z Energy', 'fuel up & earn on the way home', '+ rewards while you wait', 120)
on conflict do nothing;

-- Atomic redemption: checks balance, writes the redemption + matching negative ledger row together.
-- Call from the app with: supabase.rpc('redeem', { p_user, p_amount, p_destination })
create or replace function redeem(p_user uuid, p_amount int, p_destination text)
returns void language plpgsql as $$
declare bal int;
begin
  select coalesce(sum(amount_cents), 0) into bal from wallet_entries where user_id = p_user;
  if p_amount < 500 then raise exception 'below minimum (500c)'; end if;
  if p_amount > bal then raise exception 'insufficient balance'; end if;
  insert into redemptions(user_id, amount_cents, destination) values (p_user, p_amount, p_destination);
  insert into wallet_entries(user_id, amount_cents, reason) values (p_user, -p_amount, 'redemption');
end; $$;

-- TODO: enable Row Level Security (RLS) before going live.
-- See dash-build-checklist.md task 1.3. Example:
-- alter table app_users enable row level security;
-- create policy "own_user" on app_users for select using (auth.uid() = auth_id);
