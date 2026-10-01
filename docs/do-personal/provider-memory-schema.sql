-- UNAPPLIED review proposal. Requires existing personal responsibilities/runs schema.
-- No migration, cron or provider activation. Service caller supplies verified owner.
create function public.do_provider_utf16_length(p_value text) returns integer
language sql immutable strict set search_path='' as $$select coalesce(sum(case when ascii(ch)>65535 then 2 else 1 end),0)::integer from regexp_split_to_table(p_value,'') ch$$;
create table public.do_provider_context (
 owner_id uuid not null references auth.users(id) on delete cascade,
 id uuid not null, revision integer not null check(revision>0),
 kind text check(kind in ('goal','preference','constraint')), body text,
 observed_at timestamptz, confirmed_at timestamptz, expires_at timestamptz,
 retention_days integer check(retention_days in (7,30,90)),
 primary key(owner_id,id),
 check((body is null and kind is null and observed_at is null and confirmed_at is null and expires_at is null and retention_days is null)
 or (body is not null and kind is not null and observed_at is not null and confirmed_at is not null and expires_at is not null and retention_days is not null
 and public.do_provider_utf16_length(body) between 1 and 1200 and body !~ '[[:cntrl:]]' and isfinite(observed_at) and isfinite(confirmed_at) and isfinite(expires_at) and observed_at<=confirmed_at and expires_at>confirmed_at
 and expires_at<=confirmed_at+retention_days*interval '1 day'))
);
create index do_provider_context_expiry on public.do_provider_context(expires_at) where body is not null;
create table public.do_provider_context_consent (
 owner_id uuid not null references auth.users(id) on delete cascade,
 id uuid not null, revision integer not null check(revision>0),
 scope jsonb, selections jsonb, consented_at timestamptz, expires_at timestamptz,
 primary key(owner_id,id),
 check((scope is null and selections is null and consented_at is null and expires_at is null)
 or(scope is not null and selections is not null and consented_at is not null and expires_at is not null
 and jsonb_typeof(scope)='object' and jsonb_typeof(selections)='array' and jsonb_array_length(selections) between 1 and 8
 and isfinite(consented_at) and isfinite(expires_at) and expires_at>consented_at and expires_at<=consented_at+interval '7 days'))
);
create index do_provider_consent_expiry on public.do_provider_context_consent(expires_at) where scope is not null;
create table public.do_provider_preparation_policy (
 owner_id uuid not null, responsibility_id uuid not null, revision integer not null check(revision>0),
 timezone text not null, quiet_start integer not null check(quiet_start between 0 and 23), quiet_end integer not null check(quiet_end between 0 and 23),
 cooldown_hours integer not null check(cooldown_hours between 1 and 168), paused boolean not null,
 primary key(owner_id,responsibility_id),
 foreign key(responsibility_id,owner_id) references public.do_personal_responsibilities(id,owner_id) on delete cascade
);
-- Content-free dedup ledger survives deleting individual jobs; account deletion cascades.
create table public.do_provider_preparation_reservation (
 owner_id uuid not null references auth.users(id) on delete cascade, novelty_key text not null check(novelty_key ~ '^[a-zA-Z0-9:_-]{1,160}$'),
 run_id uuid references public.do_personal_runs(id) on delete set null, consent_id uuid not null, consent_revision integer not null, policy_revision integer not null, expires_at timestamptz not null,
 status text not null check(status in ('reserved','prepared_draft','dismissed','failed')),
 created_at timestamptz not null default clock_timestamp(), dismissed_until timestamptz,
 primary key(owner_id,novelty_key)
);
create unique index do_provider_reservation_run on public.do_provider_preparation_reservation(run_id) where run_id is not null;
alter table public.do_provider_context enable row level security;
alter table public.do_provider_context_consent enable row level security;
alter table public.do_provider_preparation_policy enable row level security;
alter table public.do_provider_preparation_reservation enable row level security;
revoke all on public.do_provider_context,public.do_provider_context_consent,public.do_provider_preparation_policy,public.do_provider_preparation_reservation from public,anon,authenticated;
grant all on public.do_provider_context,public.do_provider_context_consent,public.do_provider_preparation_policy,public.do_provider_preparation_reservation to service_role;
-- No direct client reads; server review API must use owner-bound RPCs.
create function public.do_provider_invalidate_outputs(p_owner uuid,p_consent uuid,p_context uuid) returns void
language plpgsql security invoker set search_path='' as $$
begin
 -- Called inside owner-serialised CAS. Remove derived output/evidence, including reviewed drafts.
 update public.do_personal_runs r set status='cancelled',output=null,evidence='{"error":"context_changed"}',finished_at=clock_timestamp()
 where r.owner_id=p_owner and exists(select 1 from public.do_provider_preparation_reservation q where q.owner_id=p_owner and q.run_id=r.id
 and (q.consent_id=p_consent or exists(select 1 from public.do_provider_context_consent c where c.owner_id=p_owner and c.id=q.consent_id and c.selections @> jsonb_build_array(jsonb_build_object('recordId',p_context)))));
 update public.do_provider_preparation_reservation q set status='failed' where q.owner_id=p_owner and q.status in ('reserved','prepared_draft')
 and (q.consent_id=p_consent or exists(select 1 from public.do_provider_context_consent c where c.owner_id=p_owner and c.id=q.consent_id and c.selections @> jsonb_build_array(jsonb_build_object('recordId',p_context))));
end $$;
create function public.do_provider_scope_current(p_owner uuid,p_scope jsonb) returns boolean
language plpgsql security invoker set search_path='' as $$
begin
 if not exists(select 1 from auth.users where id=p_owner and not is_anonymous) then return false; end if;
 if p_scope='{"kind":"assistant"}'::jsonb then return true; end if;
 if jsonb_typeof(p_scope) is distinct from 'object' or p_scope->>'kind' is distinct from 'responsibility' or (select count(*) from jsonb_object_keys(p_scope))<>3
 or jsonb_typeof(p_scope->'responsibilityId') is distinct from 'string' or jsonb_typeof(p_scope->'responsibilityRevision') is distinct from 'number' then return false; end if;
 return exists(select 1 from public.do_personal_responsibilities where owner_id=p_owner and id=(p_scope->>'responsibilityId')::uuid and revision=(p_scope->>'responsibilityRevision')::integer and active and consent_until>clock_timestamp());
exception when others then return false;
end $$;
create function public.do_provider_context_change(p_owner uuid,p_id uuid,p_expected integer,p_kind text,p_body text,p_observed timestamptz,p_retention integer)
returns boolean language plpgsql security invoker set search_path='' as $$
declare r public.do_provider_context; v_now timestamptz;
begin
 if not public.do_provider_scope_current(p_owner,'{"kind":"assistant"}') or p_id is null or p_expected is null or p_expected<0 then raise exception 'context_denied'; end if;
 perform pg_advisory_xact_lock(hashtextextended(p_owner::text,3028));
 select * into r from public.do_provider_context where owner_id=p_owner and id=p_id for update;
 v_now:=clock_timestamp();
 if coalesce(r.revision,0)<>p_expected or (r.revision is not null and r.body is null) then raise exception 'context_conflict'; end if;
 if r.revision is not null then perform public.do_provider_invalidate_outputs(p_owner,null,p_id); end if;
 if r.expires_at<=v_now then
  update public.do_provider_context set revision=revision+1,kind=null,body=null,observed_at=null,confirmed_at=null,expires_at=null,retention_days=null where owner_id=p_owner and id=p_id;
  return false;
 end if;
 if p_body is null then
  if r.revision is null then raise exception 'context_conflict'; end if;
  update public.do_provider_context set revision=revision+1,kind=null,body=null,observed_at=null,confirmed_at=null,expires_at=null,retention_days=null where owner_id=p_owner and id=p_id;
  return true;
 end if;
 if p_kind is null or p_retention is null or p_observed is null or not isfinite(p_observed) or p_observed>v_now then raise exception 'context_invalid'; end if;
 if r.revision is null and (select count(*) from public.do_provider_context where owner_id=p_owner and body is not null)>=30 then raise exception 'context_limit'; end if;
 insert into public.do_provider_context values(p_owner,p_id,p_expected+1,p_kind,p_body,p_observed,v_now,v_now+p_retention*interval '1 day',p_retention)
 on conflict(owner_id,id) do update set revision=excluded.revision,kind=excluded.kind,body=excluded.body,observed_at=excluded.observed_at,confirmed_at=excluded.confirmed_at,expires_at=excluded.expires_at,retention_days=excluded.retention_days;
 return true;
end $$;
create function public.do_provider_consent_change(p_owner uuid,p_id uuid,p_expected integer,p_scope jsonb,p_selections jsonb,p_expires timestamptz)
returns boolean language plpgsql security invoker set search_path='' as $$
declare r public.do_provider_context_consent; v_now timestamptz; s jsonb; v_count integer; v_chars integer;
begin
 if not public.do_provider_scope_current(p_owner,'{"kind":"assistant"}') or p_id is null or p_expected is null or p_expected<0 then raise exception 'context_denied'; end if;
 perform pg_advisory_xact_lock(hashtextextended(p_owner::text,3028));
 select * into r from public.do_provider_context_consent where owner_id=p_owner and id=p_id for update;
 v_now:=clock_timestamp();
 if coalesce(r.revision,0)<>p_expected or (r.revision is not null and r.scope is null) then raise exception 'context_conflict'; end if;
 if r.revision is not null then perform public.do_provider_invalidate_outputs(p_owner,p_id,null); end if;
 if r.expires_at<=v_now or p_scope is null then
  if r.revision is null then raise exception 'context_conflict'; end if;
  update public.do_provider_context_consent set revision=revision+1,scope=null,selections=null,consented_at=null,expires_at=null where owner_id=p_owner and id=p_id;
  return p_scope is null;
 end if;
 if not public.do_provider_scope_current(p_owner,p_scope) or p_selections is null or jsonb_typeof(p_selections)<>'array' or jsonb_array_length(p_selections) not between 1 and 8 or p_expires is null or not isfinite(p_expires) or p_expires<=v_now or p_expires>v_now+interval '7 days' then raise exception 'context_invalid'; end if;
 if p_scope->>'kind'='responsibility' then p_scope:=jsonb_build_object('kind','responsibility','responsibilityId',(p_scope->>'responsibilityId')::uuid,'responsibilityRevision',(p_scope->>'responsibilityRevision')::integer); end if;
 for s in select value from jsonb_array_elements(p_selections) loop
  if jsonb_typeof(s)<>'object' or (select count(*) from jsonb_object_keys(s))<>2 or jsonb_typeof(s->'recordId') is distinct from 'string' or jsonb_typeof(s->'revision') is distinct from 'number'
  or not exists(select 1 from public.do_provider_context where owner_id=p_owner and id=(s->>'recordId')::uuid and revision=(s->>'revision')::integer and body is not null and expires_at>=p_expires) then raise exception 'context_invalid'; end if;
 end loop;
 select count(distinct (value->>'recordId')::uuid) into v_count from jsonb_array_elements(p_selections);
 if v_count<>jsonb_array_length(p_selections) then raise exception 'context_invalid'; end if;
 select jsonb_agg(jsonb_build_object('recordId',(value->>'recordId')::uuid,'revision',(value->>'revision')::integer) order by ordinal) into p_selections from jsonb_array_elements(p_selections) with ordinality items(value,ordinal);
 select sum(public.do_provider_utf16_length(c.body)) into v_chars from public.do_provider_context c join jsonb_array_elements(p_selections) selection on c.id=(selection->>'recordId')::uuid where c.owner_id=p_owner;
 if v_chars>6000 then raise exception 'context_limit'; end if;
 if r.revision is null and (select count(*) from public.do_provider_context_consent where owner_id=p_owner and scope is not null)>=30 then raise exception 'context_limit'; end if;
 insert into public.do_provider_context_consent values(p_owner,p_id,p_expected+1,p_scope,p_selections,v_now,p_expires)
 on conflict(owner_id,id) do update set revision=excluded.revision,scope=excluded.scope,selections=excluded.selections,consented_at=excluded.consented_at,expires_at=excluded.expires_at;
 return true;
end $$;
create function public.do_provider_context_snapshot(p_owner uuid,p_id uuid,p_scope jsonb) returns jsonb
language plpgsql security invoker set search_path='' as $$
declare c public.do_provider_context_consent; v_records jsonb; v_now timestamptz;
begin
 perform pg_advisory_xact_lock(hashtextextended(p_owner::text,3028)); v_now:=clock_timestamp();
 if not public.do_provider_scope_current(p_owner,p_scope) then raise exception 'context_denied'; end if;
 if p_scope->>'kind'='responsibility' then p_scope:=jsonb_build_object('kind','responsibility','responsibilityId',(p_scope->>'responsibilityId')::uuid,'responsibilityRevision',(p_scope->>'responsibilityRevision')::integer); end if;
 select * into c from public.do_provider_context_consent where owner_id=p_owner and id=p_id and scope=p_scope and expires_at>v_now;
 if c.id is null then raise exception 'context_denied'; end if;
 select jsonb_agg(jsonb_build_object('id',r.id,'ownerId',r.owner_id,'revision',r.revision,'subject','self','kind',r.kind,'text',r.body,'source','owner_entered','confirmedAt',r.confirmed_at,'observedAt',r.observed_at,'expiresAt',r.expires_at,'active',true,'nonSensitive',true,'use','explicit_provider_context')) into v_records
 from public.do_provider_context r join jsonb_array_elements(c.selections) s on r.id=(s->>'recordId')::uuid and r.revision=(s->>'revision')::integer
 where r.owner_id=p_owner and r.body is not null and r.expires_at>v_now and r.expires_at>=c.expires_at;
 if coalesce(jsonb_array_length(v_records),0)<>jsonb_array_length(c.selections) then raise exception 'context_denied'; end if;
 return jsonb_build_object('consent',jsonb_build_object('id',c.id,'ownerId',c.owner_id,'revision',c.revision,'noticeVersion',1,'providers',jsonb_build_array('openai','typesafe'),'scope',c.scope,'selections',c.selections,'consentedAt',c.consented_at,'expiresAt',c.expires_at,'revokedAt',null),'records',v_records);
end $$;
create function public.do_provider_policy_change(p_owner uuid,p_task uuid,p_expected integer,p_timezone text,p_start integer,p_end integer,p_cooldown integer,p_paused boolean)
returns boolean language plpgsql security invoker set search_path='' as $$
declare v_revision integer;
begin
 perform pg_advisory_xact_lock(hashtextextended(p_owner::text,3028));
 if not public.do_provider_scope_current(p_owner,'{"kind":"assistant"}') or not exists(select 1 from public.do_personal_responsibilities where owner_id=p_owner and id=p_task)
 or p_expected is null or p_expected<0 or not exists(select 1 from pg_timezone_names where name=p_timezone) then raise exception 'context_denied'; end if;
 select revision into v_revision from public.do_provider_preparation_policy where owner_id=p_owner and responsibility_id=p_task for update;
 if coalesce(v_revision,0)<>p_expected then raise exception 'context_conflict'; end if;
 insert into public.do_provider_preparation_policy values(p_owner,p_task,p_expected+1,p_timezone,p_start,p_end,p_cooldown,p_paused)
 on conflict(owner_id,responsibility_id) do update set revision=excluded.revision,timezone=excluded.timezone,quiet_start=excluded.quiet_start,quiet_end=excluded.quiet_end,cooldown_hours=excluded.cooldown_hours,paused=excluded.paused;
 return true;
end $$;
create function public.do_provider_prepare_reserve(p_owner uuid,p_run uuid,p_consent uuid,p_consent_revision integer,p_key text,p_policy_revision integer)
returns boolean language plpgsql security invoker set search_path='' as $$
declare r public.do_personal_runs; p public.do_provider_preparation_policy; c public.do_provider_context_consent; v_now timestamptz; v_hour integer; v_scope jsonb;
begin
 perform pg_advisory_xact_lock(hashtextextended(p_owner::text,3028));
 select * into r from public.do_personal_runs where owner_id=p_owner and id=p_run for update;
 if r.id is null or r.status<>'running' or r.started_at<=clock_timestamp()-interval '10 minutes' then raise exception 'preparation_denied'; end if;
 v_scope:=jsonb_build_object('kind','responsibility','responsibilityId',r.responsibility_id,'responsibilityRevision',r.revision);
 perform public.do_provider_context_snapshot(p_owner,p_consent,v_scope);
 select * into c from public.do_provider_context_consent where owner_id=p_owner and id=p_consent;
 if p_consent_revision is null or c.revision<>p_consent_revision then raise exception 'preparation_denied'; end if;
 select * into p from public.do_provider_preparation_policy where owner_id=p_owner and responsibility_id=r.responsibility_id;
 v_now:=clock_timestamp();
 if c.expires_at<=v_now or p.revision is null or p_policy_revision is null or p.revision<>p_policy_revision or p.paused or p_key is null or p_key !~ '^[a-zA-Z0-9:_-]{1,160}$' then return false; end if;
 v_hour:=extract(hour from v_now at time zone p.timezone);
 if (p.quiet_start<p.quiet_end and v_hour>=p.quiet_start and v_hour<p.quiet_end) or (p.quiet_start>p.quiet_end and (v_hour>=p.quiet_start or v_hour<p.quiet_end)) then return false; end if;
 if exists(select 1 from public.do_provider_preparation_reservation where owner_id=p_owner and (novelty_key=p_key or run_id=p_run))
 or exists(select 1 from public.do_provider_preparation_reservation where owner_id=p_owner and created_at>v_now-p.cooldown_hours*interval '1 hour') then return false; end if;
 if (select count(*) from public.do_provider_preparation_reservation where owner_id=p_owner)>=1000 then raise exception 'preparation_limit'; end if;
 insert into public.do_provider_preparation_reservation(owner_id,novelty_key,run_id,consent_id,consent_revision,policy_revision,expires_at,status) values(p_owner,p_key,p_run,p_consent,p_consent_revision,p_policy_revision,c.expires_at,'reserved');
 return true;
end $$;
create function public.do_provider_prepare_state(p_owner uuid,p_key text,p_status text,p_until timestamptz default null) returns boolean
language plpgsql security invoker set search_path='' as $$
declare q public.do_provider_preparation_reservation;
begin
 perform pg_advisory_xact_lock(hashtextextended(p_owner::text,3028));
 if not public.do_provider_scope_current(p_owner,'{"kind":"assistant"}') or p_status is null or p_status not in ('dismissed','failed') or (p_until is not null and (not isfinite(p_until) or p_status<>'dismissed' or p_until<=clock_timestamp() or p_until>clock_timestamp()+interval '90 days')) then raise exception 'preparation_invalid'; end if;
 -- Only atomic publication creates a prepared receipt.
 select * into q from public.do_provider_preparation_reservation where owner_id=p_owner and novelty_key=p_key for update;
 if q.owner_id is null then return false; end if;
 update public.do_provider_preparation_reservation item set status=p_status,dismissed_until=p_until where item.owner_id=p_owner and item.novelty_key=p_key
 and ((item.status='reserved' and p_status='failed') or (item.status='prepared_draft' and p_status='dismissed'));
 return found;
end $$;
create function public.do_provider_context_expire(p_limit integer default 100) returns integer
language plpgsql security invoker set search_path='' as $$
declare v_count integer; v_more integer; v_jobs integer; v_now timestamptz:=clock_timestamp();
begin
 if p_limit is null or p_limit not between 1 and 100 then raise exception 'context_invalid_batch'; end if;
 with due as(select owner_id,id from public.do_provider_context where body is not null and expires_at<=v_now order by expires_at for update skip locked limit p_limit)
 update public.do_provider_context c set revision=revision+1,body=null,kind=null,observed_at=null,confirmed_at=null,expires_at=null,retention_days=null from due where c.owner_id=due.owner_id and c.id=due.id;
 get diagnostics v_count=row_count;
 with due as(select owner_id,id from public.do_provider_context_consent where scope is not null and expires_at<=v_now order by expires_at for update skip locked limit p_limit)
 update public.do_provider_context_consent c set revision=revision+1,scope=null,selections=null,consented_at=null,expires_at=null from due where c.owner_id=due.owner_id and c.id=due.id;
 get diagnostics v_more=row_count;
 with due as(select r.id from public.do_personal_runs r join public.do_provider_preparation_reservation q on q.run_id=r.id and q.owner_id=r.owner_id where q.expires_at<=v_now and (r.output is not null or r.evidence<>'{}'::jsonb or r.status='running') order by q.expires_at for update of r skip locked limit p_limit)
 update public.do_personal_runs r set status='cancelled',output=null,evidence='{}',finished_at=v_now from due where r.id=due.id;
 get diagnostics v_jobs=row_count;
 return v_count+v_more+v_jobs;
end $$;
create function public.do_provider_context_review(p_owner uuid) returns jsonb
language plpgsql security invoker set search_path='' as $$
declare v_now timestamptz:=clock_timestamp();
begin
 if not public.do_provider_scope_current(p_owner,'{"kind":"assistant"}') then raise exception 'context_denied'; end if;
 return jsonb_build_object('contexts',coalesce((select jsonb_agg(jsonb_build_object('id',id,'revision',revision,'kind',kind,'text',body,'observedAt',observed_at,'confirmedAt',confirmed_at,'expiresAt',expires_at,'retentionDays',retention_days)) from public.do_provider_context where owner_id=p_owner and body is not null and expires_at>v_now),'[]'::jsonb),
 'consents',coalesce((select jsonb_agg(jsonb_build_object('id',id,'revision',revision,'scope',scope,'selections',selections,'consentedAt',consented_at,'expiresAt',expires_at)) from public.do_provider_context_consent where owner_id=p_owner and scope is not null and expires_at>v_now),'[]'::jsonb));
end $$;
revoke all on function public.do_provider_context_review(uuid) from public,anon,authenticated;
grant execute on function public.do_provider_context_review(uuid) to service_role;
revoke all on function public.do_provider_invalidate_outputs(uuid,uuid,uuid) from public,anon,authenticated;
grant execute on function public.do_provider_invalidate_outputs(uuid,uuid,uuid) to service_role;
create function public.do_provider_prepare_get(p_owner uuid,p_key text) returns jsonb
language plpgsql security invoker set search_path='' as $$
begin
 if not public.do_provider_scope_current(p_owner,'{"kind":"assistant"}') then raise exception 'context_denied'; end if;
 return (select jsonb_build_object('noveltyKey',q.novelty_key,'status',case when q.expires_at<=clock_timestamp() then 'failed' else q.status end,'runId',q.run_id,'createdAt',q.created_at,'expiresAt',q.expires_at,'dismissedUntil',q.dismissed_until) from public.do_provider_preparation_reservation q where q.owner_id=p_owner and q.novelty_key=p_key);
end $$;
revoke all on function public.do_provider_prepare_get(uuid,text) from public,anon,authenticated;
grant execute on function public.do_provider_prepare_get(uuid,text) to service_role;
create function public.do_provider_prepare_publish(p_owner uuid,p_key text,p_output text,p_evidence jsonb) returns boolean
language plpgsql security invoker set search_path='' as $$
declare q public.do_provider_preparation_reservation; r public.do_personal_runs; t public.do_personal_responsibilities; c public.do_provider_context_consent;
begin
 perform pg_advisory_xact_lock(hashtextextended(p_owner::text,3028));
 if not public.do_provider_scope_current(p_owner,'{"kind":"assistant"}') or p_output is null or public.do_provider_utf16_length(p_output) not between 1 and 20000
 or p_evidence is null or jsonb_typeof(p_evidence)<>'object' or public.do_provider_utf16_length(p_evidence::text)>32000 then raise exception 'preparation_invalid'; end if;
 select * into q from public.do_provider_preparation_reservation where owner_id=p_owner and novelty_key=p_key for update;
 if q.owner_id is null or q.status<>'reserved' then return false; end if;
 -- Match existing finish lock order; pause/edit cannot race publication.
 select task.* into t from public.do_personal_responsibilities task join public.do_personal_runs run on run.responsibility_id=task.id and run.owner_id=task.owner_id where task.owner_id=p_owner and run.id=q.run_id for update of task;
 select * into r from public.do_personal_runs where owner_id=p_owner and id=q.run_id for update;
 if r.id is null or r.status<>'running' or r.started_at<=clock_timestamp()-interval '10 minutes' or q.expires_at<=clock_timestamp() then return false; end if;
 perform public.do_provider_context_snapshot(p_owner,q.consent_id,jsonb_build_object('kind','responsibility','responsibilityId',r.responsibility_id,'responsibilityRevision',r.revision));
 select * into c from public.do_provider_context_consent where owner_id=p_owner and id=q.consent_id;
 if c.revision<>q.consent_revision or c.expires_at<=clock_timestamp() or not exists(select 1 from public.do_provider_preparation_policy where owner_id=p_owner and responsibility_id=r.responsibility_id and revision=q.policy_revision and not paused) then return false; end if;
 if not public.do_personal_finish(r.id,p_output,p_evidence,false) then return false; end if;
 update public.do_provider_preparation_reservation set status='prepared_draft' where owner_id=p_owner and novelty_key=p_key;
 return true;
end $$;
revoke all on function public.do_provider_prepare_publish(uuid,text,text,jsonb),public.do_provider_utf16_length(text) from public,anon,authenticated;
grant execute on function public.do_provider_prepare_publish(uuid,text,text,jsonb),public.do_provider_utf16_length(text) to service_role;
revoke all on function public.do_provider_scope_current(uuid,jsonb),public.do_provider_context_change(uuid,uuid,integer,text,text,timestamptz,integer),public.do_provider_consent_change(uuid,uuid,integer,jsonb,jsonb,timestamptz),public.do_provider_context_snapshot(uuid,uuid,jsonb),public.do_provider_policy_change(uuid,uuid,integer,text,integer,integer,integer,boolean),public.do_provider_prepare_reserve(uuid,uuid,uuid,integer,text,integer),public.do_provider_prepare_state(uuid,text,text,timestamptz),public.do_provider_context_expire(integer) from public,anon,authenticated;
grant execute on function public.do_provider_scope_current(uuid,jsonb),public.do_provider_context_change(uuid,uuid,integer,text,text,timestamptz,integer),public.do_provider_consent_change(uuid,uuid,integer,jsonb,jsonb,timestamptz),public.do_provider_context_snapshot(uuid,uuid,jsonb),public.do_provider_policy_change(uuid,uuid,integer,text,integer,integer,integer,boolean),public.do_provider_prepare_reserve(uuid,uuid,uuid,integer,text,integer),public.do_provider_prepare_state(uuid,text,text,timestamptz),public.do_provider_context_expire(integer) to service_role;
