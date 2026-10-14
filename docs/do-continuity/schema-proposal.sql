-- REVIEW PROPOSAL ONLY. Outside supabase/migrations; never installed automatically.
-- Isolated test install is authorised. Production installation/grants require root review.
-- Functions are the only write path so owner, CAS, expiry and idempotency checks
-- cannot be bypassed through direct table updates. SECURITY DEFINER is deliberate.
begin;
create schema if not exists do_continuity_private;
revoke all on schema do_continuity_private from public, anon, authenticated, service_role;
alter default privileges in schema do_continuity_private revoke all on tables from public, anon, authenticated, service_role;
alter default privileges in schema do_continuity_private revoke all on functions from public, anon, authenticated, service_role;
-- PostgreSQL length counts Unicode codepoints; web/Zod counts UTF-16 units.
-- Astral codepoints consume two units in the shared transport contract.
create function do_continuity_private.utf16_length(p_text text) returns integer
language sql immutable strict security invoker set search_path = '' as $$
  select 2*char_length(p_text)-char_length(regexp_replace(p_text,U&'[\+010000-\+10FFFF]','','g'));
$$;
revoke all on function do_continuity_private.utf16_length(text) from public, anon, authenticated, service_role;
create table do_continuity_private.owner_access (
  owner_id uuid not null references auth.users(id) on delete cascade,
  scope text not null check(scope in ('personal','work')),
  enabled boolean not null default false,
  expires_at timestamptz not null,
  primary key(owner_id,scope)
);
alter table do_continuity_private.owner_access enable row level security;
alter table do_continuity_private.owner_access force row level security;
revoke all on do_continuity_private.owner_access from public, anon, authenticated, service_role;
-- No access rows inserted. Only a separately approved trusted administrator can
-- admit an owner/scope. Granting RPC execution never enrols all account holders.
create function do_continuity_private.owner_enabled(p_owner uuid,p_scope text) returns boolean
language sql volatile security invoker set search_path = '' as $$
  select exists(select 1 from do_continuity_private.owner_access
    where owner_id=p_owner and scope=p_scope and enabled and expires_at>clock_timestamp());
$$;
revoke all on function do_continuity_private.owner_enabled(uuid,text) from public, anon, authenticated, service_role;
create table do_continuity_private.tasks (
  owner_id uuid not null references auth.users(id) on delete cascade,
  id uuid not null, scope text not null check(scope in ('personal','work')),
  request text not null check(do_continuity_private.utf16_length(request) <= 4000),
  context jsonb not null check(jsonb_typeof(context) = 'array' and jsonb_array_length(context) <= 3),
  save_fingerprint text not null,
  revision integer not null default 1 check(revision > 0),
  status text not null default 'waiting' check(status in ('waiting','needs_review','cancelled','revoked','expired')),
  consent_version text not null check(consent_version = 'do-continuity-v1'),
  consent_until timestamptz not null default clock_timestamp() + interval '24 hours',
  expires_at timestamptz not null default clock_timestamp() + interval '7 days',
  created_at timestamptz not null default clock_timestamp(), updated_at timestamptz not null default clock_timestamp(),
  result text check(do_continuity_private.utf16_length(result) <= 16000), executor text check(executor = 'worksheet-v1'),
  primary key(owner_id,id)
);
alter table do_continuity_private.tasks enable row level security;
alter table do_continuity_private.tasks force row level security;
revoke all on do_continuity_private.tasks from public, anon, authenticated, service_role;
-- No client table grants or policies: only the explicitly guarded RPC owner can
-- access it. The function owner must be the isolated/reviewed migration owner.

create function do_continuity_private.visible(t do_continuity_private.tasks, p_now timestamptz default clock_timestamp()) returns jsonb
language sql volatile security invoker set search_path = '' as $$
  select jsonb_build_object(
    'id',t.id,'ownerId',t.owner_id,'scope',t.scope,
    'request',case when t.expires_at <= p_now then '' else t.request end,
    'context',case when t.consent_until <= p_now or t.expires_at <= p_now then '[]'::jsonb else t.context end,
    'revision',t.revision,'status',case when t.expires_at <= p_now or
       (t.consent_until <= p_now and t.status not in ('cancelled','revoked')) then 'expired' else t.status end,
    'consentVersion',t.consent_version,
    'consentUntil',to_char(t.consent_until at time zone 'UTC','YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
    'expiresAt',to_char(t.expires_at at time zone 'UTC','YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
    'createdAt',to_char(t.created_at at time zone 'UTC','YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
    'updatedAt',to_char(t.updated_at at time zone 'UTC','YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
    'result',case when t.consent_until <= p_now or t.expires_at <= p_now then null else t.result end,
    'executor',t.executor);
$$;
revoke all on function do_continuity_private.visible(do_continuity_private.tasks,timestamptz) from public, anon, authenticated, service_role;

create function public.do_continuity_read(p_scope text, p_id uuid default null) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare v_owner uuid := auth.uid(); v_result jsonb;
begin
  if v_owner is null or coalesce((auth.jwt()->>'is_anonymous')::boolean,false) then raise exception 'continuity_not_found'; end if;
  if p_scope not in ('personal','work') or p_scope is null then raise exception 'continuity_not_found'; end if;
  if not do_continuity_private.owner_enabled(v_owner,p_scope) then raise exception 'continuity_storage_unavailable'; end if;
  select coalesce(jsonb_agg(do_continuity_private.visible(t)), '[]'::jsonb) into v_result
    from (select * from do_continuity_private.tasks where owner_id=v_owner and scope=p_scope
      and (p_id is null or id=p_id) and (p_id is not null or expires_at>clock_timestamp()) order by updated_at desc limit 40) t;
  return v_result;
end;
$$;
revoke all on function public.do_continuity_read(text,uuid) from public, anon, authenticated, service_role;

create function public.do_continuity_mutate(p_input jsonb) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare v_owner uuid := auth.uid(); v_id uuid; v_scope text; v_action text;
  v_task do_continuity_private.tasks; v_context jsonb; v_fingerprint text; v_notes text; v_result text;
  v_now timestamptz; v_bytes bigint;
begin
  if v_owner is null or coalesce((auth.jwt()->>'is_anonymous')::boolean,false) then raise exception 'continuity_not_found'; end if;
  if jsonb_typeof(p_input) <> 'object' or octet_length(p_input::text) > 65536 then raise exception 'continuity_conflict'; end if;
  v_id := (p_input->>'id')::uuid; v_scope := p_input->>'scope'; v_action := p_input->>'action';
  if v_id is null or v_scope is null or v_scope not in ('personal','work') then raise exception 'continuity_not_found'; end if;
  if not do_continuity_private.owner_enabled(v_owner,v_scope) then raise exception 'continuity_storage_unavailable'; end if;
  -- Serialize owner mutations as well as row edits: concurrent different-ID
  -- inserts and output growth cannot bypass count/byte quotas.
  perform pg_advisory_xact_lock(hashtextextended(v_owner::text,0));
  if not do_continuity_private.owner_enabled(v_owner,v_scope) then raise exception 'continuity_storage_unavailable'; end if;
  if v_action = 'save' then
    if p_input - array['id','scope','action','request','context','consent','consentVersion'] <> '{}'::jsonb
      or p_input->'consent' is distinct from 'true'::jsonb or p_input->>'consentVersion' is distinct from 'do-continuity-v1'
      or jsonb_typeof(p_input->'request') is distinct from 'string'
      or do_continuity_private.utf16_length(btrim(p_input->>'request')) not between 8 and 4000 then raise exception 'continuity_conflict'; end if;
    v_context := p_input->'context';
    if jsonb_typeof(v_context) is distinct from 'array' or jsonb_array_length(v_context)>3 then raise exception 'continuity_conflict'; end if;
    if exists(select 1 from jsonb_array_elements(v_context) c where
      jsonb_typeof(c) <> 'object' or c - array['id','label','text','source'] <> '{}'::jsonb
      or c->>'source' is distinct from 'user_selected' or jsonb_typeof(c->'label') is distinct from 'string'
      or do_continuity_private.utf16_length(btrim(c->>'label')) not between 1 and 80 or jsonb_typeof(c->'text') is distinct from 'string'
      or do_continuity_private.utf16_length(btrim(c->>'text')) not between 1 and 2000 or jsonb_typeof(c->'id') is distinct from 'string'
    ) then raise exception 'continuity_conflict'; end if;
    perform (c->>'id')::uuid from jsonb_array_elements(v_context) c;
    v_fingerprint := md5(jsonb_build_object('scope',v_scope,'request',btrim(p_input->>'request'),'context',v_context)::text);
    select * into v_task from do_continuity_private.tasks where owner_id=v_owner and id=v_id for update;
    if found then
      if v_task.scope <> v_scope then raise exception 'continuity_not_found'; end if;
      if v_task.save_fingerprint <> v_fingerprint then raise exception 'continuity_id_reused'; end if;
      if not do_continuity_private.owner_enabled(v_owner,v_scope) then raise exception 'continuity_storage_unavailable'; end if;
      return do_continuity_private.visible(v_task);
    end if;
    v_now := clock_timestamp();
    if not do_continuity_private.owner_enabled(v_owner,v_scope) then raise exception 'continuity_storage_unavailable'; end if;
    if (select count(*) from do_continuity_private.tasks where owner_id=v_owner and expires_at>v_now)>=40
      or (select count(*) from do_continuity_private.tasks where owner_id=v_owner)>=2048 then raise exception 'continuity_quota_exhausted'; end if;
    select coalesce(sum(octet_length(request)+octet_length(context::text)+coalesce(octet_length(result),0)),0) into v_bytes
      from do_continuity_private.tasks where owner_id=v_owner;
    if v_bytes+octet_length(btrim(p_input->>'request'))+octet_length(v_context::text)>262144 then raise exception 'continuity_quota_exhausted'; end if;
    -- Stable IDs remain as content-free sentinels until account deletion. An old
    -- retry can never create fresh consent, including after day 90.
    insert into do_continuity_private.tasks(owner_id,id,scope,request,context,save_fingerprint,consent_version,
      consent_until,expires_at,created_at,updated_at)
      values(v_owner,v_id,v_scope,btrim(p_input->>'request'),v_context,v_fingerprint,'do-continuity-v1',
      v_now+interval '24 hours',v_now+interval '7 days',v_now,v_now) returning * into v_task;
  else
    if p_input - array['id','scope','action','expectedRevision','result'] <> '{}'::jsonb
      or v_action is null or v_action not in ('prepare','edit','cancel','revoke')
      or jsonb_typeof(p_input->'expectedRevision') is distinct from 'number'
      or (v_action <> 'edit' and p_input ? 'result') then raise exception 'continuity_conflict'; end if;
    select * into v_task from do_continuity_private.tasks where owner_id=v_owner and id=v_id and scope=v_scope for update;
    if not found then raise exception 'continuity_not_found'; end if;
    -- Capture wall time after every potentially blocking owner/row lock.
    v_now := clock_timestamp();
    if not do_continuity_private.owner_enabled(v_owner,v_scope) then raise exception 'continuity_storage_unavailable'; end if;
    if v_task.revision <> (p_input->>'expectedRevision')::integer then raise exception 'continuity_conflict'; end if;
    if v_action in ('cancel','revoke') then
      update do_continuity_private.tasks set revision=revision+1,status=case when v_action='cancel' then 'cancelled' else 'revoked' end,
        consent_until=v_now,context='[]',result=null,updated_at=v_now where owner_id=v_owner and id=v_id returning * into v_task;
    else
      if v_task.status in ('cancelled','revoked') then raise exception 'continuity_stopped'; end if;
      if v_task.consent_until<=v_now or v_task.expires_at<=v_now then raise exception 'continuity_permission_expired'; end if;
      if v_action='prepare' and v_task.status='needs_review' then return do_continuity_private.visible(v_task); end if;
      if v_action='prepare' then
        -- Inert deterministic worksheet only, inside this transaction. Future
        -- provider work needs a separate durable admission/claim design review.
        select string_agg((c->>'label')||': '||(c->>'text'), E'\n' order by n) into v_notes from jsonb_array_elements(v_task.context) with ordinality as a(c,n);
        v_result := 'Editable EA worksheet · no model called'||E'\n\nRequest\n'||v_task.request||E'\n\nSelected context\n'||
          coalesce(v_notes,'No additional context selected.')||E'\n\nNext steps to review\n1. Confirm dates, people and missing details.\n2. Draft the next message or checklist below.\n3. Review before taking any external action.\n\nDraft\n[Write or edit your draft here.]\n\nPreparation only. Nothing sent, booked or changed outside DO.';
      else
        if v_task.status <> 'needs_review' or jsonb_typeof(p_input->'result') is distinct from 'string'
          or do_continuity_private.utf16_length(p_input->>'result')>16000 then raise exception 'continuity_conflict'; end if;
        v_result := p_input->>'result';
      end if;
      select coalesce(sum(octet_length(request)+octet_length(context::text)+coalesce(octet_length(result),0)),0) into v_bytes
        from do_continuity_private.tasks where owner_id=v_owner;
      if v_bytes-coalesce(octet_length(v_task.result),0)+octet_length(v_result)>262144 then raise exception 'continuity_quota_exhausted'; end if;
      if v_task.consent_until<=clock_timestamp() or v_task.expires_at<=clock_timestamp() then raise exception 'continuity_permission_expired'; end if;
      if not do_continuity_private.owner_enabled(v_owner,v_scope) then raise exception 'continuity_storage_unavailable'; end if;
      update do_continuity_private.tasks set revision=revision+1,status='needs_review',result=v_result,
        executor='worksheet-v1',updated_at=clock_timestamp() where owner_id=v_owner and id=v_id returning * into v_task;
    end if;
  end if;
  return do_continuity_private.visible(v_task);
end;
$$;
revoke all on function public.do_continuity_mutate(jsonb) from public, anon, authenticated, service_role;
-- Proposal maintenance hook only; no cron installed. Remove retained content at
-- day 7. Keep bounded content-free IDs until account deletion for all late retries.
create function do_continuity_private.prune() returns void
language sql security invoker set search_path = '' as $$
  update do_continuity_private.tasks set request='',context='[]',result=null,
    save_fingerprint='expired',status='expired',revision=revision+1,updated_at=clock_timestamp()
    where expires_at<=clock_timestamp() and status<>'expired';
$$;
revoke all on function do_continuity_private.prune() from public, anon, authenticated, service_role;
-- Approval-stage installation must explicitly grant RPC EXECUTE to authenticated
-- only, then run SQL/RPC/Auth proof before changing activation.ts. No grants here.
commit;
