-- Review only. Apply after operator configuration, price and rollout approval.
create table public.personal_do_billing_accounts (
 owner_id uuid primary key references auth.users(id) on delete cascade,
 stripe_customer_id text not null unique,
 created_at timestamptz not null default now()
);
create table public.personal_do_subscriptions (
 stripe_subscription_id text primary key,
 owner_id uuid not null references public.personal_do_billing_accounts(owner_id) on delete cascade,
 price_id text not null, status text not null, period_end timestamptz not null,
 cancel_at_period_end boolean not null default false,
 last_event_created bigint not null default 0,
 updated_at timestamptz not null default now()
);
create index personal_do_subscriptions_owner on public.personal_do_subscriptions(owner_id);
create table public.personal_do_webhook_receipts (event_id text primary key, processed_at timestamptz not null default now());
create table public.personal_do_usage (
 owner_id uuid not null references auth.users(id) on delete cascade,
 request_id uuid not null, input_digest text not null,
 status text not null check(status in ('pending','succeeded','failed')),
 token_usage jsonb,
 reserved_cost_cents bigint not null check(reserved_cost_cents > 0),
 started_at timestamptz not null default now(), expires_at timestamptz not null,
 primary key(owner_id, request_id)
);
create index personal_do_usage_month on public.personal_do_usage(started_at, owner_id);
alter table public.personal_do_billing_accounts enable row level security;
alter table public.personal_do_subscriptions enable row level security;
alter table public.personal_do_webhook_receipts enable row level security;
alter table public.personal_do_usage enable row level security;
-- Clients cannot grant themselves subscriptions, credit, retries or budget. All access is server/service role.
revoke all on public.personal_do_billing_accounts, public.personal_do_subscriptions, public.personal_do_webhook_receipts, public.personal_do_usage from anon, authenticated;
grant all on public.personal_do_billing_accounts, public.personal_do_subscriptions, public.personal_do_webhook_receipts, public.personal_do_usage to service_role;

create function public.admit_personal_do_request(
 p_owner uuid, p_request uuid, p_digest text, p_price text,
 p_daily integer, p_monthly integer, p_reserve bigint, p_owner_budget bigint, p_global_budget bigint
) returns text language plpgsql security definer set search_path = public, pg_temp as $$
declare month_start timestamptz := date_trunc('month', now() at time zone 'UTC') at time zone 'UTC';
 day_start timestamptz := date_trunc('day', now() at time zone 'UTC') at time zone 'UTC';
 previous public.personal_do_usage; daily_count bigint; monthly_count bigint; owner_cost bigint; global_cost bigint;
begin
 if p_daily <= 0 or p_monthly <= 0 or p_reserve <= 0 or p_owner_budget < p_reserve or p_global_budget < p_owner_budget then return 'invalid_configuration'; end if;
 -- Same lock order for every admission. Serializes global budget and owner concurrency across replicas.
 perform pg_advisory_xact_lock(724091225);
 perform pg_advisory_xact_lock(hashtextextended(p_owner::text, 724091225));
 select * into previous from public.personal_do_usage where owner_id=p_owner and request_id=p_request;
 if found then
  if previous.input_digest <> p_digest then return 'idempotency_conflict'; end if;
  return 'already_' || previous.status;
 end if;
 if not exists(select 1 from public.personal_do_subscriptions where owner_id=p_owner and price_id=p_price and status in ('active','trialing') and period_end > now()) then return 'entitlement_required'; end if;
 -- A dead worker frees concurrency, never refunds potentially incurred provider cost.
 update public.personal_do_usage set status='failed' where status='pending' and expires_at <= now();
 if exists(select 1 from public.personal_do_usage where owner_id=p_owner and status='pending') then return 'request_in_progress'; end if;
 select count(*) filter(where started_at>=day_start and status in ('pending','succeeded')),
 count(*) filter(where status in ('pending','succeeded')), coalesce(sum(reserved_cost_cents),0)
 into daily_count,monthly_count,owner_cost from public.personal_do_usage where owner_id=p_owner and started_at>=month_start;
 select coalesce(sum(reserved_cost_cents),0) into global_cost from public.personal_do_usage where started_at>=month_start;
 if daily_count>=p_daily or monthly_count>=p_monthly then return 'usage_limit'; end if;
 if owner_cost+p_reserve>p_owner_budget or global_cost+p_reserve>p_global_budget then return 'cost_limit'; end if;
 insert into public.personal_do_usage(owner_id,request_id,input_digest,status,reserved_cost_cents,expires_at)
 values(p_owner,p_request,p_digest,'pending',p_reserve,now()+interval '120 seconds');
 return 'admitted';
end $$;
revoke all on function public.admit_personal_do_request(uuid,uuid,text,text,integer,integer,bigint,bigint,bigint) from public, anon, authenticated;
grant execute on function public.admit_personal_do_request(uuid,uuid,text,text,integer,integer,bigint,bigint,bigint) to service_role;

-- Subscription write and durable acknowledgement happen in one transaction. Retry is safe after any error.
create function public.sync_personal_do_subscription(p_event text,p_customer text,p_subscription text,p_price text,p_status text,p_period_end timestamptz,p_cancel boolean,p_event_created bigint)
returns text language plpgsql security definer set search_path=public,pg_temp as $$
declare v_owner uuid;
begin
 perform pg_advisory_xact_lock(hashtextextended(p_subscription,724091226));
 if exists(select 1 from public.personal_do_webhook_receipts where event_id=p_event) then return 'already_processed'; end if;
 select owner_id into v_owner from public.personal_do_billing_accounts where stripe_customer_id=p_customer;
 if v_owner is null then raise exception 'Consumer customer mapping unavailable'; end if;
 insert into public.personal_do_subscriptions(stripe_subscription_id,owner_id,price_id,status,period_end,cancel_at_period_end,last_event_created)
 values(p_subscription,v_owner,p_price,p_status,p_period_end,p_cancel,p_event_created)
 on conflict(stripe_subscription_id) do update set owner_id=excluded.owner_id,price_id=excluded.price_id,status=excluded.status,period_end=excluded.period_end,cancel_at_period_end=excluded.cancel_at_period_end,last_event_created=excluded.last_event_created,updated_at=now()
 where public.personal_do_subscriptions.last_event_created <= excluded.last_event_created and public.personal_do_subscriptions.status <> 'canceled';
 insert into public.personal_do_webhook_receipts(event_id) values(p_event);
 return 'processed';
end $$;
revoke all on function public.sync_personal_do_subscription(text,text,text,text,text,timestamptz,boolean,bigint) from public,anon,authenticated;
grant execute on function public.sync_personal_do_subscription(text,text,text,text,text,timestamptz,boolean,bigint) to service_role;

create table public.personal_do_checkout_attempts (
 owner_id uuid primary key references public.personal_do_billing_accounts(owner_id) on delete cascade,
 attempt_id uuid not null default gen_random_uuid(), expires_at timestamptz not null
);
alter table public.personal_do_checkout_attempts enable row level security;
revoke all on public.personal_do_checkout_attempts from anon,authenticated;
grant all on public.personal_do_checkout_attempts to service_role;
create function public.personal_do_checkout_attempt(p_owner uuid) returns public.personal_do_checkout_attempts
language plpgsql security definer set search_path=public,pg_temp as $$
declare attempt public.personal_do_checkout_attempts;
begin
 perform pg_advisory_xact_lock(hashtextextended(p_owner::text,724091227));
 insert into public.personal_do_checkout_attempts(owner_id,expires_at) values(p_owner,now()+interval '1 hour')
 on conflict(owner_id) do update set attempt_id=gen_random_uuid(),expires_at=now()+interval '1 hour'
 where public.personal_do_checkout_attempts.expires_at <= now()+interval '1 minute';
 select * into attempt from public.personal_do_checkout_attempts where owner_id=p_owner;
 return attempt;
end $$;
revoke all on function public.personal_do_checkout_attempt(uuid) from public,anon,authenticated;
grant execute on function public.personal_do_checkout_attempt(uuid) to service_role;
