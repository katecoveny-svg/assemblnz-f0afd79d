-- Public-source trial only. No client knowledge, credentials or billing data.
create table if not exists public.pursuit_public_policy (
  id boolean primary key default true check (id),
  enabled boolean not null default false,
  typesafe_enabled boolean not null default false,
  global_daily_limit integer not null default 20 check (global_daily_limit between 0 and 100),
  client_daily_limit integer not null default 2 check (client_daily_limit between 0 and 5)
);
insert into public.pursuit_public_policy(id) values(true) on conflict do nothing;
create table if not exists public.pursuit_public_runs (
  id uuid primary key,
  principal_hash text not null check(length(principal_hash)=64),
  input_hash text not null check(length(input_hash)=64),
  state text not null default 'pending' check(state in ('pending','complete','failed')),
  created_at timestamptz not null default now(),
  completed_at timestamptz,
  result jsonb,
  trace jsonb not null default '{}'::jsonb
);
create index if not exists pursuit_public_runs_day on public.pursuit_public_runs(created_at);
create index if not exists pursuit_public_runs_principal on public.pursuit_public_runs(principal_hash,created_at);
create table if not exists public.assembl_public_tool_counts (
  day date not null,
  tool text not null,
  calls bigint not null default 0,
  primary key(day,tool)
);
alter table public.pursuit_public_policy enable row level security;
alter table public.pursuit_public_runs enable row level security;
alter table public.assembl_public_tool_counts enable row level security;
revoke all on public.pursuit_public_policy,public.pursuit_public_runs,public.assembl_public_tool_counts from anon,authenticated;
grant select,insert,update,delete on public.pursuit_public_policy,public.pursuit_public_runs,public.assembl_public_tool_counts to service_role;

create or replace function public.reserve_public_pursuit(p_id uuid,p_principal text,p_input_hash text)
returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
declare p public.pursuit_public_policy; r public.pursuit_public_runs; day_start timestamptz; n integer;
begin
  if length(p_principal)<>64 or length(p_input_hash)<>64 then raise exception 'invalid_request_hash'; end if;
  -- One transaction serialises the small trial budget across every server instance.
  perform pg_advisory_xact_lock(183009182026);
  select * into p from public.pursuit_public_policy where id=true;
  if not found or not p.enabled then return jsonb_build_object('status','disabled'); end if;
  select * into r from public.pursuit_public_runs where id=p_id;
  if found then
    if r.principal_hash<>p_principal or r.input_hash<>p_input_hash then return jsonb_build_object('status','conflict'); end if;
    if r.state='complete' then return jsonb_build_object('status','replay','result',r.result); end if;
    return jsonb_build_object('status',r.state);
  end if;
  day_start=date_trunc('day',now() at time zone 'UTC') at time zone 'UTC';
  select count(*) into n from public.pursuit_public_runs where created_at>=day_start;
  if n>=p.global_daily_limit then return jsonb_build_object('status','daily_limit'); end if;
  select count(*) into n from public.pursuit_public_runs where created_at>=day_start and principal_hash=p_principal;
  if n>=p.client_daily_limit then return jsonb_build_object('status','client_limit'); end if;
  delete from public.pursuit_public_runs where created_at < now()-interval '7 days';
  insert into public.pursuit_public_runs(id,principal_hash,input_hash) values(p_id,p_principal,p_input_hash);
  return jsonb_build_object('status','reserved','typesafeEnabled',p.typesafe_enabled);
end $$;
revoke all on function public.reserve_public_pursuit(uuid,text,text) from public,anon,authenticated;
grant execute on function public.reserve_public_pursuit(uuid,text,text) to service_role;

create or replace function public.count_public_tool(p_tool text)
returns void language plpgsql security definer set search_path=public,pg_temp as $$
begin
  if p_tool not in ('knowledge_search','mcp_initialize','mcp_tools_list','mcp_knowledge_search','public_pursuit_complete','public_pursuit_failed') then raise exception 'unsupported_counter'; end if;
  insert into public.assembl_public_tool_counts(day,tool,calls) values((now() at time zone 'UTC')::date,p_tool,1)
  on conflict(day,tool) do update set calls=public.assembl_public_tool_counts.calls+1;
end $$;
revoke all on function public.count_public_tool(text) from public,anon,authenticated;
grant execute on function public.count_public_tool(text) to service_role;
