-- PROPOSAL ONLY. Schema owner must generate an UNAPPLIED migration after review.
create table public.do_personal_memory (
 owner_id uuid not null references auth.users(id) on delete cascade,
 id uuid not null,
 revision integer not null check (revision>0),
 record jsonb,
 expires_at timestamptz,
 primary key(owner_id,id),
 check ((record is null and expires_at is null) or (record is not null and expires_at is not null)),
 check (record is null or (
  jsonb_typeof(record)='object'
  and record ?& array['id','subject','kind','text','source','observedAt','retentionDays','active','revision','consentedAt','reviewedAt','updatedAt','expiresAt','noticeVersion','use']
  and jsonb_typeof(record->'id')='string' and jsonb_typeof(record->'subject')='string'
  and jsonb_typeof(record->'kind')='string' and jsonb_typeof(record->'text')='string'
  and jsonb_typeof(record->'source')='string' and jsonb_typeof(record->'use')='string'
  and jsonb_typeof(record->'observedAt')='string' and jsonb_typeof(record->'consentedAt')='string'
  and jsonb_typeof(record->'reviewedAt')='string' and jsonb_typeof(record->'updatedAt')='string'
  and jsonb_typeof(record->'expiresAt')='string' and jsonb_typeof(record->'active')='boolean'
  and jsonb_typeof(record->'retentionDays')='number' and jsonb_typeof(record->'revision')='number'
  and jsonb_typeof(record->'noticeVersion')='number'
  and record->>'id'=id::text and record->>'subject'='self' and record->>'source'='owner_entered' and record->>'use'='owner_review_only'
  and record->>'kind' in ('preference','routine','ongoing_context')
  and record->>'noticeVersion'='1' and length(record->>'text') between 1 and 1200
  and record->>'revision'=revision::text and record->>'retentionDays' in ('7','30','90')
  and (record->>'expiresAt')::timestamptz=expires_at
  and expires_at>(record->>'updatedAt')::timestamptz
  and expires_at <= (record->>'consentedAt')::timestamptz + make_interval(days=>(record->>'retentionDays')::integer)
  and (record->>'observedAt')::timestamptz <= (record->>'consentedAt')::timestamptz
  and (record->>'consentedAt')::timestamptz <= (record->>'updatedAt')::timestamptz
  and (record->>'reviewedAt')::timestamptz <= (record->>'updatedAt')::timestamptz
  and (record - array['id','subject','kind','text','source','observedAt','retentionDays','active','revision','consentedAt','reviewedAt','updatedAt','expiresAt','noticeVersion','use'])='{}'::jsonb
 ))
);
create index do_personal_memory_expiry on public.do_personal_memory(expires_at) where record is not null;
alter table public.do_personal_memory enable row level security;
revoke all on public.do_personal_memory from public,anon,authenticated;
grant select on public.do_personal_memory to authenticated;
grant all on public.do_personal_memory to service_role;
create policy do_memory_owner on public.do_personal_memory for select to authenticated
 using ((select auth.uid())=owner_id and coalesce((select auth.jwt()->>'is_anonymous'),'false')='false' and expires_at>now());
create function public.do_personal_memory_change(p_owner uuid,p_id uuid,p_expected_revision integer,p_record jsonb)
returns boolean language plpgsql security invoker set search_path='' as $$
declare v_current integer; v_record jsonb; v_expiry timestamptz; v_now timestamptz;
begin
 if p_owner is null or p_id is null or p_expected_revision is null or p_expected_revision<0 then raise exception 'memory_invalid'; end if;
 perform pg_advisory_xact_lock(hashtextextended(p_owner::text,3027));
 if not exists(select 1 from auth.users where id=p_owner and not is_anonymous) then raise exception 'owner_required'; end if;
 select revision,record,expires_at into v_current,v_record,v_expiry from public.do_personal_memory where owner_id=p_owner and id=p_id for update;
 v_now:=clock_timestamp();
 if v_current is null and p_record is null then raise exception 'memory_not_found'; end if;
 if coalesce(v_current,0)<>p_expected_revision then raise exception 'memory_conflict'; end if;
 if v_current is not null and v_record is null then raise exception 'memory_conflict'; end if;
 if v_expiry<=v_now then
  -- Return false after committing erasure: raising here would roll back the tombstone.
  update public.do_personal_memory set record=null,expires_at=null,revision=revision+1 where owner_id=p_owner and id=p_id;
  return false;
 end if;
 if p_record is null then
  update public.do_personal_memory set record=null,expires_at=null,revision=revision+1 where owner_id=p_owner and id=p_id;
  return true;
 end if;
 if jsonb_typeof(p_record)<>'object' or not (p_record ?& array['id','revision','expiresAt']) then raise exception 'memory_invalid'; end if;
 if jsonb_typeof(p_record->'id')<>'string' or jsonb_typeof(p_record->'revision')<>'number' or jsonb_typeof(p_record->'expiresAt')<>'string' then raise exception 'memory_invalid'; end if;
 if p_record->>'id'<>p_id::text or p_record->>'revision'<>(p_expected_revision+1)::text then raise exception 'memory_conflict'; end if;
 if (p_record->>'consentedAt')::timestamptz>v_now or (p_record->>'updatedAt')::timestamptz>v_now or (p_record->>'reviewedAt')::timestamptz>v_now or (p_record->>'observedAt')::timestamptz>v_now then raise exception 'memory_future_provenance'; end if;
 if (p_record->>'expiresAt')::timestamptz<=v_now then raise exception 'memory_expired'; end if;
 if v_current is null and (select count(*) from public.do_personal_memory where owner_id=p_owner and record is not null)>=30 then raise exception 'memory_limit'; end if;
 insert into public.do_personal_memory(owner_id,id,revision,record,expires_at) values(p_owner,p_id,p_expected_revision+1,p_record,(p_record->>'expiresAt')::timestamptz)
 on conflict(owner_id,id) do update set record=excluded.record,revision=excluded.revision,expires_at=excluded.expires_at;
 return true;
end $$;
create function public.do_personal_memory_purge(p_owner uuid)
returns integer language plpgsql security invoker set search_path='' as $$
declare v_count integer; v_now timestamptz;
begin
 if p_owner is null then raise exception 'owner_required'; end if;
 perform pg_advisory_xact_lock(hashtextextended(p_owner::text,3027));
 v_now:=clock_timestamp();
 with due as (select owner_id,id from public.do_personal_memory where owner_id=p_owner and record is not null and expires_at<=v_now order by expires_at for update skip locked limit 100)
 update public.do_personal_memory m set record=null,expires_at=null,revision=revision+1 from due where m.owner_id=due.owner_id and m.id=due.id;
 get diagnostics v_count=row_count;
 return v_count;
end $$;
-- Scheduled caller must record batch count, failures and oldest overdue expiry; no scheduler enabled here.
create function public.do_personal_memory_expire_batch(p_limit integer default 100)
returns integer language plpgsql security invoker set search_path='' as $$
declare v_count integer; v_now timestamptz;
begin
 if p_limit is null or p_limit<1 or p_limit>100 then raise exception 'memory_invalid_batch'; end if;
 v_now:=clock_timestamp();
 with due as (select owner_id,id from public.do_personal_memory where record is not null and expires_at<=v_now order by expires_at for update skip locked limit p_limit)
 update public.do_personal_memory m set record=null,expires_at=null,revision=revision+1 from due where m.owner_id=due.owner_id and m.id=due.id;
 get diagnostics v_count=row_count;
 return v_count;
end $$;
revoke all on function public.do_personal_memory_change(uuid,uuid,integer,jsonb),public.do_personal_memory_purge(uuid),public.do_personal_memory_expire_batch(integer) from public,anon,authenticated;
grant execute on function public.do_personal_memory_change(uuid,uuid,integer,jsonb),public.do_personal_memory_purge(uuid),public.do_personal_memory_expire_batch(integer) to service_role;
-- Activation blocked pending monitored purge scheduling and backup/metadata retention review.

-- Aggregate operational metadata, service-only; never context, user IDs or record IDs.
create table public.do_personal_memory_maintenance (
 id boolean primary key default true check(id),
 last_attempt_at timestamptz,
 last_completed_at timestamptz,
 status text check(status in ('completed','backlog','deadline','failed')),
 purged integer not null default 0 check(purged between 0 and 300)
);
insert into public.do_personal_memory_maintenance(id) values(true);
alter table public.do_personal_memory_maintenance enable row level security;
revoke all on public.do_personal_memory_maintenance from public,anon,authenticated;
grant all on public.do_personal_memory_maintenance to service_role;
create function public.do_personal_memory_record_maintenance(p_status text,p_purged integer,p_started timestamptz)
returns void language plpgsql security invoker set search_path='' as $$
begin
 if p_status is null or p_purged is null or p_started is null or p_started>clock_timestamp() then raise exception 'maintenance_invalid'; end if;
 update public.do_personal_memory_maintenance set last_attempt_at=p_started,
 last_completed_at=case when p_status='completed' then clock_timestamp() else last_completed_at end,
 status=p_status,purged=p_purged where id=true and (last_attempt_at is null or last_attempt_at<=p_started);
end $$;
create function public.do_personal_memory_maintenance_health()
returns jsonb language plpgsql security invoker set search_path='' as $$
declare v_now timestamptz:=clock_timestamp();
begin
 return (select jsonb_build_object('lastAttemptAt',h.last_attempt_at,'lastCompletedAt',h.last_completed_at,'status',h.status,'purged',h.purged,
 'sampledOverdue',(select count(*) from (select 1 from public.do_personal_memory where record is not null and expires_at<=v_now limit 1001) q),
 'oldestOverdueAt',(select expires_at from public.do_personal_memory where record is not null and expires_at<=v_now order by expires_at limit 1))
 from public.do_personal_memory_maintenance h where id=true);
end $$;
revoke all on function public.do_personal_memory_record_maintenance(text,integer,timestamptz),public.do_personal_memory_maintenance_health() from public,anon,authenticated;
grant execute on function public.do_personal_memory_record_maintenance(text,integer,timestamptz),public.do_personal_memory_maintenance_health() to service_role;
