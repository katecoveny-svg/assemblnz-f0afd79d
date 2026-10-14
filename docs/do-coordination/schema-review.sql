-- REVIEW PROPOSAL ONLY. Never add to automatic migrations or run on production.
-- Requires Supabase auth.uid()/auth.jwt(). Pairing rows are pre-provisioned by a
-- separately verified pairing process; this proposal exposes no pairing creation.
begin;
create schema do_ea_private;
revoke all on schema do_ea_private from public,anon,authenticated,service_role;
create table do_ea_private.contacts (
 id uuid primary key, owner_a uuid not null references auth.users(id), owner_b uuid not null references auth.users(id),
 pairing_source text not null check(pairing_source='isolated_fixture'),
 revision integer not null default 0 check(revision between 0 and 10),
 accepted_a boolean not null default false, accepted_b boolean not null default false,
 status text not null default 'pending' check(status in ('pending','active','revoked','expired')),
 expires_at timestamptz not null, check(owner_a<owner_b), unique(owner_a,owner_b)
);
create table do_ea_private.tasks (
 id uuid primary key default gen_random_uuid(), contact_id uuid not null references do_ea_private.contacts,
 revision integer not null default 1 check(revision between 1 and 3), duration_minutes integer not null check(duration_minutes between 15 and 120),
 timezone text not null default 'Pacific/Auckland' check(timezone='Pacific/Auckland'), expires_at timestamptz not null,
 status text not null default 'waiting_disclosure' check(status in ('waiting_disclosure','proposed','agreed','no_overlap','declined','revoked','expired')),
 proposal jsonb, proposal_digest text, receipt jsonb,
 check((proposal is null)=(proposal_digest is null))
);
create table do_ea_private.participants (
 task_id uuid not null references do_ea_private.tasks, owner_id uuid not null references auth.users(id), primary key(task_id,owner_id)
);
create table do_ea_private.permissions (
 task_id uuid not null references do_ea_private.tasks, owner_id uuid not null references auth.users(id), revision integer not null,
 windows jsonb, digest text not null, expires_at timestamptz not null,
 status text not null check(status in ('saved','queued','delivered','invalidated')), primary key(task_id,owner_id,revision)
);
create table do_ea_private.outbox (
 id uuid primary key default gen_random_uuid(), owner_id uuid not null references auth.users(id), recipient_id uuid not null references auth.users(id),
 task_id uuid not null references do_ea_private.tasks, revision integer not null, digest text not null,
 envelope jsonb, expires_at timestamptz not null, status text not null check(status in ('queued','delivered','cancelled')),
 unique(task_id,owner_id,revision)
);
create table do_ea_private.inbox (
 id uuid primary key references do_ea_private.outbox, owner_id uuid not null references auth.users(id),
 task_id uuid not null references do_ea_private.tasks, revision integer not null, envelope jsonb,
 status text not null check(status in ('queued','delivered','cancelled'))
);
create table do_ea_private.approvals (
 task_id uuid not null references do_ea_private.tasks, owner_id uuid not null references auth.users(id), revision integer not null,
 digest text not null, approved_at timestamptz not null, invalidated boolean not null default false, primary key(task_id,owner_id,revision)
);
-- Lifetime bounded tombstones: never delete/recycle request IDs to free quota.
-- Results deliberately contain no window/proposal bodies, so ledger replay is not disclosure.
create table do_ea_private.requests (
 owner_id uuid not null references auth.users(id), id uuid not null, command_digest text not null, result jsonb not null,
 primary key(owner_id,id)
);
create function do_ea_private.owner() returns uuid language plpgsql stable security definer set search_path=pg_catalog as $$
declare u uuid;
begin
 if current_setting('role',true) <> 'authenticated' or coalesce(auth.jwt()->>'is_anonymous','false')<>'false' then raise exception 'ea_scope'; end if;
 u:=auth.uid();
 if u is null or not exists(select 1 from auth.users where id=u and not coalesce(is_anonymous,false)) then raise exception 'ea_scope'; end if;
 return u;
end $$;
create function do_ea_private.hash(j jsonb) returns text language sql immutable set search_path=pg_catalog as $$ select encode(sha256(convert_to(j::text,'UTF8')),'hex') $$;
create function do_ea_private.clear_task(t uuid, s text) returns void language plpgsql set search_path=pg_catalog as $$
begin
 update do_ea_private.tasks set status=s,proposal=null,proposal_digest=null,receipt=null where id=t;
 update do_ea_private.permissions set windows=null,status='invalidated' where task_id=t;
 update do_ea_private.outbox set envelope=null,status='cancelled' where task_id=t;
 update do_ea_private.inbox set envelope=null,status='cancelled' where task_id=t;
 update do_ea_private.approvals set invalidated=true where task_id=t;
end $$;
-- Internal sweep is bounded by fixture contact/task quotas and runs under pair locks.
create function do_ea_private.expire_contact(c uuid, wall timestamptz) returns void language plpgsql set search_path=pg_catalog as $$
declare r record; checked_wall timestamptz;
begin
 -- Lock every affected task before sampling time; callers may have waited here.
 perform id from do_ea_private.tasks where contact_id=c order by id for update;
 checked_wall:=clock_timestamp();
 if exists(select 1 from do_ea_private.contacts where id=c and expires_at<=checked_wall and status not in ('revoked','expired')) then
  update do_ea_private.contacts set status='expired' where id=c;
 end if;
 for r in select t.id from do_ea_private.tasks t join do_ea_private.contacts x on x.id=t.contact_id
 where t.contact_id=c and t.status not in ('declined','revoked','expired') and
 (x.status in ('revoked','expired') or t.expires_at<=checked_wall or exists(select 1 from do_ea_private.permissions p where p.task_id=t.id and p.revision=t.revision and p.status<>'invalidated' and p.expires_at<=checked_wall))
 order by t.id for update of t loop
  perform do_ea_private.clear_task(r.id,case when (select status from do_ea_private.contacts where id=c)='revoked' then 'revoked' else 'expired' end);
 end loop;
end $$;
-- Even trusted fixture provisioning cannot create an unbounded participant graph.
create function do_ea_private.bound_pairing() returns trigger language plpgsql set search_path=pg_catalog as $$
begin
 perform pg_advisory_xact_lock(hashtextextended(new.owner_a::text,686));
 perform pg_advisory_xact_lock(hashtextextended(new.owner_b::text,686));
 if new.expires_at<=clock_timestamp() or new.expires_at>clock_timestamp()+interval '7 days' then raise exception 'ea_invalid'; end if;
 if (select count(*) from do_ea_private.contacts where new.owner_a in(owner_a,owner_b))>=5 or (select count(*) from do_ea_private.contacts where new.owner_b in(owner_a,owner_b))>=5 then raise exception 'ea_quota'; end if;
 return new;
end $$;
create trigger bounded_pairing before insert on do_ea_private.contacts for each row execute function do_ea_private.bound_pairing();
create function public.do_ea_command(p_command jsonb) returns jsonb language plpgsql security definer set search_path=pg_catalog as $$
declare
 u uuid:=do_ea_private.owner(); c do_ea_private.contacts; t do_ea_private.tasks; p do_ea_private.permissions;
 m do_ea_private.outbox; old do_ea_private.requests; k text; rid uuid; cid uuid; tid uuid; expected integer;
 keys text[]; allowed text[]; wall timestamptz; exp timestamptz; dur integer; peer uuid;
 h text; result jsonb; w jsonb; normalized jsonb; st timestamptz; en timestamptz; slot timestamptz;
 body jsonb; props jsonb; proposal_exp timestamptz;
begin
 if p_command is null or jsonb_typeof(p_command)<>'object' or octet_length(p_command::text)>16384 then raise exception 'ea_invalid'; end if;
 k:=p_command->>'kind';
 allowed:=case k
 when 'accept_contact' then array['kind','requestId','contactId','expectedRevision']
 when 'revoke_contact' then array['kind','requestId','contactId','expectedRevision']
 when 'create_task' then array['kind','requestId','contactId','expectedRevision','durationMinutes','expiresAt']
 when 'save_windows' then array['kind','requestId','taskId','expectedRevision','windows','expiresAt']
 when 'queue_disclosure' then array['kind','requestId','taskId','expectedRevision','disclosureDigest']
 when 'deliver' then array['kind','requestId','taskId','expectedRevision','messageId']
 when 'change_plan' then array['kind','requestId','taskId','expectedRevision','durationMinutes']
 when 'approve' then array['kind','requestId','taskId','expectedRevision','proposalDigest']
 when 'decline' then array['kind','requestId','taskId','expectedRevision'] else null end;
 select array_agg(key order by key) into keys from jsonb_object_keys(p_command) key;
 if allowed is null or not keys @> allowed or not allowed @> keys or exists(select 1 from jsonb_each(p_command) e where e.value='null'::jsonb)
 or jsonb_typeof(p_command->'expectedRevision')<>'number' or (p_command->>'expectedRevision')!~'^[0-9]+$'
 or jsonb_typeof(p_command->'kind')<>'string' or jsonb_typeof(p_command->'requestId')<>'string' then raise exception 'ea_invalid'; end if;
 rid:=(p_command->>'requestId')::uuid; expected:=(p_command->>'expectedRevision')::integer;
 if p_command ? 'contactId' then
  if jsonb_typeof(p_command->'contactId')<>'string' then raise exception 'ea_invalid'; end if;
  cid:=(p_command->>'contactId')::uuid;
 else
  if jsonb_typeof(p_command->'taskId')<>'string' then raise exception 'ea_invalid'; end if;
  tid:=(p_command->>'taskId')::uuid;
  select contact_id into cid from do_ea_private.tasks where id=tid and exists(select 1 from do_ea_private.participants where task_id=tid and owner_id=u);
 end if;
 select * into c from do_ea_private.contacts where id=cid and u in (owner_a,owner_b);
 if c.id is null then raise exception 'ea_scope'; end if;
 -- All operations on either participant share sorted advisory locks. Quotas cannot
 -- race through distinct contacts; task/contact lock order is always consistent.
 perform pg_advisory_xact_lock(hashtextextended(c.owner_a::text,686));
 perform pg_advisory_xact_lock(hashtextextended(c.owner_b::text,686));
 select * into c from do_ea_private.contacts where id=cid for update;
 if tid is not null then select * into t from do_ea_private.tasks where id=tid for update; end if;
 wall:=clock_timestamp();
 perform do_ea_private.expire_contact(cid,wall);
 wall:=clock_timestamp();
 select * into c from do_ea_private.contacts where id=cid;
 if tid is not null then select * into t from do_ea_private.tasks where id=tid; end if;
 if c.status in ('revoked','expired') then return jsonb_build_object('error',case when c.status='expired' then 'expired' else 'closed' end,'saved',false); end if;
 if tid is not null and t.status in ('declined','revoked','expired') then return jsonb_build_object('error',case when t.status='expired' then 'expired' else 'closed' end,'saved',false); end if;
 if k='approve' and t.proposal is not null and (t.proposal->>'start')::timestamptz<=wall then raise exception 'ea_scope'; end if;
 h:=do_ea_private.hash(p_command);
 select * into old from do_ea_private.requests where owner_id=u and id=rid;
 if old.id is not null then
  if old.command_digest<>h then raise exception 'ea_replay'; end if;
  -- A changed revision never replays historical authority, even for an exact retry.
  if (tid is not null and expected<>t.revision) or (tid is null and k<>'create_task' and expected+1<>c.revision) then raise exception 'ea_replay'; end if;
  return old.result || jsonb_build_object('duplicate',true);
 end if;
 if (select count(*) from do_ea_private.requests where owner_id=u)>=200 then raise exception 'ea_quota'; end if;
 if (tid is null and expected<>c.revision) or (tid is not null and expected<>t.revision) then raise exception 'ea_conflict'; end if;
 if k in ('accept_contact','revoke_contact') and c.revision>=10 then raise exception 'ea_quota'; end if;
 peer:=case when u=c.owner_a then c.owner_b else c.owner_a end;
 if p_command ? 'durationMinutes' then
  if jsonb_typeof(p_command->'durationMinutes')<>'number' or (p_command->>'durationMinutes')!~'^[0-9]+$' then raise exception 'ea_invalid'; end if;
  dur:=(p_command->>'durationMinutes')::integer;
  if dur not between 15 and 120 then raise exception 'ea_invalid'; end if;
 end if;
 if p_command ? 'expiresAt' then
  if jsonb_typeof(p_command->'expiresAt')<>'string' or (p_command->>'expiresAt')!~'T.*(Z|[+-][0-9]{2}:[0-9]{2})$' then raise exception 'ea_invalid'; end if;
  exp:=(p_command->>'expiresAt')::timestamptz;
  if not isfinite(exp) or exp<=wall or exp>least(c.expires_at,wall+interval '7 days') then raise exception 'ea_invalid'; end if;
 end if;
 if k='accept_contact' then
  if (u=c.owner_a and c.accepted_a) or (u=c.owner_b and c.accepted_b) then raise exception 'ea_conflict'; end if;
  update do_ea_private.contacts set accepted_a=accepted_a or u=owner_a,accepted_b=accepted_b or u=owner_b,revision=revision+1 where id=cid;
  update do_ea_private.contacts set status='active' where id=cid and accepted_a and accepted_b;
  result:=jsonb_build_object('saved',true,'contactId',cid,'revision',c.revision+1);
 elsif k='revoke_contact' then
  update do_ea_private.contacts set status='revoked',revision=revision+1 where id=cid;
  for tid in select id from do_ea_private.tasks where contact_id=cid order by id for update loop perform do_ea_private.clear_task(tid,'revoked'); end loop;
  result:=jsonb_build_object('saved',true,'status','revoked');
 elsif k='create_task' then
  if c.status<>'active' or not(c.accepted_a and c.accepted_b) then raise exception 'ea_scope'; end if;
  if (select count(*) from do_ea_private.participants where owner_id=c.owner_a)>=20 or (select count(*) from do_ea_private.participants where owner_id=c.owner_b)>=20 then raise exception 'ea_quota'; end if;
  insert into do_ea_private.tasks(contact_id,duration_minutes,expires_at) values(cid,dur,exp) returning * into t;
  insert into do_ea_private.participants values(t.id,c.owner_a),(t.id,c.owner_b);
  result:=jsonb_build_object('saved',true,'taskId',t.id,'revision',1,'status','waiting_disclosure');
 elsif k='save_windows' then
  if t.status<>'waiting_disclosure' or exists(select 1 from do_ea_private.permissions where task_id=tid and owner_id=u and revision=t.revision) then raise exception 'ea_conflict'; end if;
  if exp>t.expires_at or jsonb_typeof(p_command->'windows')<>'array' or jsonb_array_length(p_command->'windows') not between 1 and 8 then raise exception 'ea_invalid'; end if;
  normalized:='[]';
  for w in select value from jsonb_array_elements(p_command->'windows') loop
   if jsonb_typeof(w)<>'object' or not(w ?& array['start','end']) or (select count(*) from jsonb_object_keys(w))<>2 or jsonb_typeof(w->'start')<>'string' or jsonb_typeof(w->'end')<>'string'
   or (w->>'start')!~'T.*(Z|[+-][0-9]{2}:[0-9]{2})$' or (w->>'end')!~'T.*(Z|[+-][0-9]{2}:[0-9]{2})$' then raise exception 'ea_invalid'; end if;
   st:=(w->>'start')::timestamptz; en:=(w->>'end')::timestamptz;
   if not isfinite(st) or not isfinite(en) or st<wall or en<=st or en>exp then raise exception 'ea_invalid'; end if;
   normalized:=normalized||jsonb_build_array(jsonb_build_object('start',to_char(st at time zone 'UTC','YYYY-MM-DD"T"HH24:MI:SS.US"Z"'),'end',to_char(en at time zone 'UTC','YYYY-MM-DD"T"HH24:MI:SS.US"Z"')));
  end loop;
  select jsonb_agg(value order by value->>'start',value->>'end') into normalized from jsonb_array_elements(normalized);
  body:=jsonb_build_object('version',1,'kind','availability','contactId',cid,'taskId',tid,'revision',t.revision,'from',u,'to',peer,'expiresAt',to_char(exp at time zone 'UTC','YYYY-MM-DD"T"HH24:MI:SS.US"Z"'),'windows',normalized);
  h:=do_ea_private.hash(body);
  insert into do_ea_private.permissions values(tid,u,t.revision,normalized,h,exp,'saved');
  result:=jsonb_build_object('saved',true,'status','saved','disclosureDigest',h);
 elsif k='queue_disclosure' then
  select * into p from do_ea_private.permissions where task_id=tid and owner_id=u and revision=t.revision;
  if jsonb_typeof(p_command->'disclosureDigest')<>'string' or (p_command->>'disclosureDigest')!~'^[a-f0-9]{64}$' then raise exception 'ea_invalid'; end if;
  if t.status<>'waiting_disclosure' or p.status is distinct from 'saved' or p.digest<>p_command->>'disclosureDigest' then raise exception 'ea_scope'; end if;
  if (select count(*) from do_ea_private.outbox where owner_id=u)>=120 then raise exception 'ea_quota'; end if;
  body:=jsonb_build_object('version',1,'kind','availability','contactId',cid,'taskId',tid,'revision',t.revision,'from',u,'to',peer,'expiresAt',to_char(p.expires_at at time zone 'UTC','YYYY-MM-DD"T"HH24:MI:SS.US"Z"'),'windows',p.windows);
  if do_ea_private.hash(body)<>p.digest then raise exception 'ea_scope'; end if;
  insert into do_ea_private.outbox(owner_id,recipient_id,task_id,revision,digest,envelope,expires_at,status) values(u,peer,tid,t.revision,p.digest,body,p.expires_at,'queued') returning * into m;
  insert into do_ea_private.inbox values(m.id,peer,tid,t.revision,null,'queued');
  update do_ea_private.permissions set status='queued' where task_id=tid and owner_id=u and revision=t.revision;
  result:=jsonb_build_object('saved',true,'status','queued','messageId',m.id);
 elsif k='deliver' then
  if jsonb_typeof(p_command->'messageId')<>'string' then raise exception 'ea_invalid'; end if;
  select * into m from do_ea_private.outbox where id=(p_command->>'messageId')::uuid and recipient_id=u and task_id=tid and revision=t.revision for update;
  if m.id is null or m.status='cancelled' then raise exception 'ea_scope'; end if;
  if m.status='delivered' then result:=jsonb_build_object('saved',true,'status','delivered','duplicate',true);
  else
   if m.expires_at<=wall or do_ea_private.hash(m.envelope)<>m.digest then raise exception 'ea_scope'; end if;
   update do_ea_private.outbox set status='delivered' where id=m.id;
   update do_ea_private.inbox set status='delivered',envelope=m.envelope where id=m.id and owner_id=u;
   update do_ea_private.permissions set status='delivered' where task_id=tid and owner_id=m.owner_id and revision=t.revision;
   result:=jsonb_build_object('saved',true,'status','delivered');
  end if;
  if t.status='waiting_disclosure' and (select count(*) from do_ea_private.permissions where task_id=tid and revision=t.revision and status='delivered')=2 then
   select min(greatest((a.value->>'start')::timestamptz,(b.value->>'start')::timestamptz)) into slot
   from do_ea_private.permissions pa cross join lateral jsonb_array_elements(pa.windows) a
   cross join do_ea_private.permissions pb cross join lateral jsonb_array_elements(pb.windows) b
   where pa.task_id=tid and pb.task_id=tid and pa.owner_id=c.owner_a and pb.owner_id=c.owner_b and pa.revision=t.revision and pb.revision=t.revision
   and greatest((a.value->>'start')::timestamptz,(b.value->>'start')::timestamptz)>wall
   and least((a.value->>'end')::timestamptz,(b.value->>'end')::timestamptz)-greatest((a.value->>'start')::timestamptz,(b.value->>'start')::timestamptz)>=make_interval(mins=>t.duration_minutes);
   if slot is null then update do_ea_private.tasks set status='no_overlap' where id=tid;
   else
    select least(t.expires_at,min(expires_at)) into proposal_exp from do_ea_private.permissions where task_id=tid and revision=t.revision;
    select jsonb_agg(jsonb_build_object('ownerId',owner_id,'digest',digest) order by owner_id) into props from do_ea_private.permissions where task_id=tid and revision=t.revision;
    body:=jsonb_build_object('version',1,'kind','time_proposal','contactId',cid,'taskId',tid,'revision',t.revision,'timezone',t.timezone,'durationMinutes',t.duration_minutes,'disclosures',props,'start',to_char(slot at time zone 'UTC','YYYY-MM-DD"T"HH24:MI:SS.US"Z"'),'end',to_char((slot+make_interval(mins=>t.duration_minutes)) at time zone 'UTC','YYYY-MM-DD"T"HH24:MI:SS.US"Z"'),'expiresAt',to_char(proposal_exp at time zone 'UTC','YYYY-MM-DD"T"HH24:MI:SS.US"Z"'));
    update do_ea_private.tasks set status='proposed',proposal=body,proposal_digest=do_ea_private.hash(body) where id=tid;
   end if;
  end if;
 elsif k='change_plan' then
  if t.revision>=3 then raise exception 'ea_quota'; end if;
  perform do_ea_private.clear_task(tid,'waiting_disclosure');
  update do_ea_private.tasks set revision=revision+1,duration_minutes=dur where id=tid;
  result:=jsonb_build_object('saved',true,'revision',t.revision+1,'status','waiting_disclosure');
 elsif k='approve' then
  if jsonb_typeof(p_command->'proposalDigest')<>'string' or (p_command->>'proposalDigest')!~'^[a-f0-9]{64}$' then raise exception 'ea_invalid'; end if;
  if t.status not in ('proposed','agreed') or t.proposal_digest is distinct from p_command->>'proposalDigest' or (t.proposal->>'start')::timestamptz<=wall then raise exception 'ea_scope'; end if;
  insert into do_ea_private.approvals values(tid,u,t.revision,t.proposal_digest,wall,false) on conflict do nothing;
  if (select count(*) from do_ea_private.approvals where task_id=tid and revision=t.revision and digest=t.proposal_digest and not invalidated)=2 then
   update do_ea_private.tasks set status='agreed',receipt=jsonb_build_object('kind','proposal_agreed','revision',t.revision,'digest',t.proposal_digest,'calendarBookingCreated',false) where id=tid;
  end if;
  result:=jsonb_build_object('saved',true,'status','approved','revision',t.revision,'digest',t.proposal_digest);
 elsif k='decline' then
  perform do_ea_private.clear_task(tid,'declined'); result:=jsonb_build_object('saved',true,'status','declined');
 end if;
 insert into do_ea_private.requests values(u,rid,do_ea_private.hash(p_command),result);
 return result;
exception when invalid_text_representation or datetime_field_overflow or numeric_value_out_of_range then raise exception 'ea_invalid';
end $$;
create function public.do_ea_snapshot() returns jsonb language plpgsql security definer set search_path=pg_catalog as $$
declare u uuid:=do_ea_private.owner(); item record; wall timestamptz;
begin
 -- Sorted global owner locks first: no contact-order deadlock across a graph.
 for item in select distinct x.owner from do_ea_private.contacts t cross join lateral (values(t.owner_a),(t.owner_b)) x(owner) where u in(t.owner_a,t.owner_b) order by x.owner loop
  perform pg_advisory_xact_lock(hashtextextended(item.owner::text,686));
 end loop;
 for item in select id from do_ea_private.contacts where u in(owner_a,owner_b) order by id for update loop
  wall:=clock_timestamp(); perform do_ea_private.expire_contact(item.id,wall);
 end loop;
 -- All task locks are now held; re-evaluate earlier contacts after any later wait.
 for item in select id from do_ea_private.contacts where u in(owner_a,owner_b) order by id loop
  perform do_ea_private.expire_contact(item.id,clock_timestamp());
 end loop;
 return jsonb_build_object('mode','inactive_authenticated_foundation',
 'contacts',coalesce((select jsonb_agg(to_jsonb(c)) from do_ea_private.contacts c where u in(owner_a,owner_b)),'[]'),
 'tasks',coalesce((select jsonb_agg(to_jsonb(t)) from do_ea_private.tasks t where exists(select 1 from do_ea_private.participants p where p.task_id=t.id and p.owner_id=u)),'[]'),
 'permissions',coalesce((select jsonb_agg(to_jsonb(p)) from do_ea_private.permissions p where owner_id=u),'[]'),
 'outbox',coalesce((select jsonb_agg(to_jsonb(o)-'envelope') from do_ea_private.outbox o where owner_id=u),'[]'),
 'inbox',coalesce((select jsonb_agg(to_jsonb(i)) from do_ea_private.inbox i where owner_id=u),'[]'),
 'approvals',coalesce((select jsonb_agg(to_jsonb(a)) from do_ea_private.approvals a where owner_id=u),'[]'));
end $$;
-- Explicitly remove inherited default ACLs, including BYPASSRLS service_role.
-- No direct table access or helper invocation by any API role.
do $$ declare r record; begin
 for r in select tablename from pg_tables where schemaname='do_ea_private' loop
  execute format('alter table do_ea_private.%I enable row level security',r.tablename);
  execute format('revoke all on table do_ea_private.%I from public,anon,authenticated,service_role',r.tablename);
 end loop;
 for r in select p.oid::regprocedure as signature from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='do_ea_private' loop
  execute format('revoke all on function %s from public,anon,authenticated,service_role',r.signature);
 end loop;
end $$;
revoke all on function public.do_ea_command(jsonb),public.do_ea_snapshot() from public,anon,authenticated,service_role;
grant execute on function public.do_ea_command(jsonb),public.do_ea_snapshot() to authenticated;
commit;
