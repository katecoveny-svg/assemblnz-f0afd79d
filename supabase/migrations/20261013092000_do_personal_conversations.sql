-- Kept conversations: owner-chosen transcripts with revision CAS, 30-day rolling retention,
-- content-free tombstones and service-only write RPCs. Same storage pattern as
-- do_personal_memory, kept as a separate table so memory, preferences and tasks stay
-- distinct. Proof: scripts/test-do-conversations-sql.cjs. Gate: DO_PERSONAL_CONVERSATIONS_ENABLED.
create table public.do_personal_conversations (
 owner_id uuid not null references auth.users(id) on delete cascade,
 id uuid not null,
 revision integer not null check (revision>0),
 record jsonb,
 expires_at timestamptz,
 primary key(owner_id,id),
 check ((record is null and expires_at is null) or (record is not null and expires_at is not null)),
 check (record is null or (
  jsonb_typeof(record)='object'
  and record ?& array['id','title','turns','revision','createdAt','updatedAt','expiresAt','noticeVersion','use']
  and jsonb_typeof(record->'id')='string' and jsonb_typeof(record->'title')='string'
  and jsonb_typeof(record->'turns')='array' and jsonb_array_length(record->'turns') between 1 and 40
  and jsonb_typeof(record->'revision')='number' and jsonb_typeof(record->'noticeVersion')='number'
  and jsonb_typeof(record->'createdAt')='string' and jsonb_typeof(record->'updatedAt')='string' and jsonb_typeof(record->'expiresAt')='string'
  and record->>'id'=id::text and record->>'use'='owner_review_only' and record->>'noticeVersion'='1'
  and length(record->>'title') between 1 and 120
  and record->>'revision'=revision::text
  and octet_length(record::text) <= 65536
  and (record->>'expiresAt')::timestamptz=expires_at
  and expires_at>(record->>'updatedAt')::timestamptz
  and expires_at <= (record->>'updatedAt')::timestamptz + interval '30 days'
  and (record->>'createdAt')::timestamptz <= (record->>'updatedAt')::timestamptz
  and (record - array['id','title','turns','revision','createdAt','updatedAt','expiresAt','noticeVersion','use'])='{}'::jsonb
  -- Per-turn shape via jsonpath: CHECK constraints cannot run subqueries.
  and not jsonb_path_exists(record->'turns','$[*] ? (@.type() != "object")')
  and not jsonb_path_exists(record->'turns','$[*] ? (!exists(@.role) || (@.role != "user" && @.role != "assistant"))')
  and not jsonb_path_exists(record->'turns','$[*] ? (!exists(@.text) || @.text.type() != "string")')
  and not jsonb_path_exists(record->'turns','$[*] ? (!exists(@.at) || @.at.type() != "string")')
  and not jsonb_path_exists(record->'turns','$[*].keyvalue() ? (@.key != "role" && @.key != "text" && @.key != "at" && @.key != "draft" && @.key != "label")')
 ))
);
create index do_personal_conversations_expiry on public.do_personal_conversations(expires_at) where record is not null;
alter table public.do_personal_conversations enable row level security;
revoke all on public.do_personal_conversations from public,anon,authenticated;
grant select on public.do_personal_conversations to authenticated;
grant all on public.do_personal_conversations to service_role;
create policy do_conversations_owner on public.do_personal_conversations for select to authenticated
 using ((select auth.uid())=owner_id and coalesce((select auth.jwt()->>'is_anonymous'),'false')='false' and expires_at>now());

create function public.do_personal_conversation_change(p_owner uuid,p_id uuid,p_expected_revision integer,p_record jsonb)
returns boolean language plpgsql security invoker set search_path='' as $$
declare v_current integer; v_record jsonb; v_expiry timestamptz; v_now timestamptz;
begin
 if p_owner is null or p_id is null or p_expected_revision is null or p_expected_revision<0 then raise exception 'conversation_invalid'; end if;
 perform pg_advisory_xact_lock(hashtextextended(p_owner::text,3028));
 if not exists(select 1 from auth.users where id=p_owner and not is_anonymous) then raise exception 'owner_required'; end if;
 select revision,record,expires_at into v_current,v_record,v_expiry from public.do_personal_conversations where owner_id=p_owner and id=p_id for update;
 v_now:=clock_timestamp();
 if v_current is null and p_record is null then raise exception 'conversation_not_found'; end if;
 if coalesce(v_current,0)<>p_expected_revision then raise exception 'conversation_conflict'; end if;
 if v_current is not null and v_record is null then raise exception 'conversation_conflict'; end if;
 if v_expiry<=v_now then
  -- Return false after committing erasure: raising here would roll back the tombstone.
  update public.do_personal_conversations set record=null,expires_at=null,revision=revision+1 where owner_id=p_owner and id=p_id;
  return false;
 end if;
 if p_record is null then
  update public.do_personal_conversations set record=null,expires_at=null,revision=revision+1 where owner_id=p_owner and id=p_id;
  return true;
 end if;
 if jsonb_typeof(p_record)<>'object' or not (p_record ?& array['id','revision','expiresAt','turns']) then raise exception 'conversation_invalid'; end if;
 if jsonb_typeof(p_record->'id')<>'string' or jsonb_typeof(p_record->'revision')<>'number' or jsonb_typeof(p_record->'expiresAt')<>'string' or jsonb_typeof(p_record->'turns')<>'array' then raise exception 'conversation_invalid'; end if;
 if p_record->>'id'<>p_id::text or p_record->>'revision'<>(p_expected_revision+1)::text then raise exception 'conversation_conflict'; end if;
 if (p_record->>'createdAt')::timestamptz>v_now or (p_record->>'updatedAt')::timestamptz>v_now then raise exception 'conversation_future_provenance'; end if;
 if (p_record->>'expiresAt')::timestamptz<=v_now then raise exception 'conversation_expired'; end if;
 -- A kept conversation only grows; a stale device never drops turns another device added.
 if v_record is not null and jsonb_array_length(p_record->'turns')<jsonb_array_length(v_record->'turns') then raise exception 'conversation_conflict'; end if;
 if v_current is null and (select count(*) from public.do_personal_conversations where owner_id=p_owner and record is not null)>=50 then raise exception 'conversation_limit'; end if;
 insert into public.do_personal_conversations(owner_id,id,revision,record,expires_at) values(p_owner,p_id,p_expected_revision+1,p_record,(p_record->>'expiresAt')::timestamptz)
 on conflict(owner_id,id) do update set record=excluded.record,revision=excluded.revision,expires_at=excluded.expires_at;
 return true;
end $$;
create function public.do_personal_conversation_purge(p_owner uuid)
returns integer language plpgsql security invoker set search_path='' as $$
declare v_count integer; v_now timestamptz;
begin
 if p_owner is null then raise exception 'owner_required'; end if;
 perform pg_advisory_xact_lock(hashtextextended(p_owner::text,3028));
 v_now:=clock_timestamp();
 with due as (select owner_id,id from public.do_personal_conversations where owner_id=p_owner and record is not null and expires_at<=v_now order by expires_at for update skip locked limit 100)
 update public.do_personal_conversations m set record=null,expires_at=null,revision=revision+1 from due where m.owner_id=due.owner_id and m.id=due.id;
 get diagnostics v_count=row_count;
 return v_count;
end $$;
-- Scheduled caller records batch counts only; no scheduler is enabled here.
create function public.do_personal_conversation_expire_batch(p_limit integer default 100)
returns integer language plpgsql security invoker set search_path='' as $$
declare v_count integer; v_now timestamptz;
begin
 if p_limit is null or p_limit<1 or p_limit>100 then raise exception 'conversation_invalid_batch'; end if;
 v_now:=clock_timestamp();
 with due as (select owner_id,id from public.do_personal_conversations where record is not null and expires_at<=v_now order by expires_at for update skip locked limit p_limit)
 update public.do_personal_conversations m set record=null,expires_at=null,revision=revision+1 from due where m.owner_id=due.owner_id and m.id=due.id;
 get diagnostics v_count=row_count;
 return v_count;
end $$;
revoke all on function public.do_personal_conversation_change(uuid,uuid,integer,jsonb),public.do_personal_conversation_purge(uuid),public.do_personal_conversation_expire_batch(integer) from public,anon,authenticated;
grant execute on function public.do_personal_conversation_change(uuid,uuid,integer,jsonb),public.do_personal_conversation_purge(uuid),public.do_personal_conversation_expire_batch(integer) to service_role;
