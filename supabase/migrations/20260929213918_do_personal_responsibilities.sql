-- Personal DO: private saved context, bounded daily preparation, revocable leases.
create table public.do_personal_responsibilities (
 id uuid primary key default gen_random_uuid(),
 owner_id uuid not null references auth.users(id) on delete cascade,
 title text not null check (char_length(title) between 1 and 100),
 goal text not null check (char_length(goal) between 10 and 1500),
 notes text not null check (char_length(notes) between 1 and 10000),
 timezone text not null default 'Pacific/Auckland',
 local_hour integer not null default 7 check (local_hour between 0 and 23),
 active boolean not null default false,
 consent_until timestamptz not null,
 next_run_at timestamptz not null,
 revision integer not null default 1,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 unique(id, owner_id)
);
create table public.do_personal_runs (
 id uuid primary key default gen_random_uuid(),
 responsibility_id uuid not null,
 owner_id uuid not null,
 revision integer not null,
 status text not null default 'running' check(status in ('running','needs_review','reviewed','failed','cancelled')),
 output text,
 evidence jsonb not null default '{}'::jsonb,
 started_at timestamptz not null default now(),
 finished_at timestamptz,
 foreign key (responsibility_id,owner_id) references public.do_personal_responsibilities(id,owner_id) on delete cascade
);
create index do_personal_due on public.do_personal_responsibilities(next_run_at) where active;
create index do_personal_owner on public.do_personal_responsibilities(owner_id);
create index do_personal_run_owner on public.do_personal_runs(owner_id,started_at desc);
create index do_personal_run_task on public.do_personal_runs(responsibility_id,started_at desc);
-- Separate quota ledger survives deleting a responsibility or its private drafts.
create table public.do_personal_usage (
 id uuid primary key default gen_random_uuid(),
 owner_id uuid not null references auth.users(id) on delete cascade,
 created_at timestamptz not null default now()
);
create index do_personal_usage_owner on public.do_personal_usage(owner_id,created_at);
alter table public.do_personal_usage enable row level security;
revoke all on public.do_personal_usage from anon,authenticated;
grant all on public.do_personal_usage to service_role;
create table public.do_personal_worker (
 id boolean primary key default true check(id), last_seen_at timestamptz
);
insert into public.do_personal_worker(id) values(true);
alter table public.do_personal_responsibilities enable row level security;
alter table public.do_personal_runs enable row level security;
alter table public.do_personal_worker enable row level security;
revoke all on public.do_personal_responsibilities,public.do_personal_runs,public.do_personal_worker from anon,authenticated;
grant select on public.do_personal_responsibilities,public.do_personal_runs to authenticated;
grant all on public.do_personal_responsibilities,public.do_personal_runs,public.do_personal_worker to service_role;
create policy personal_context_owner on public.do_personal_responsibilities for select to authenticated using ((select auth.uid())=owner_id and coalesce((select auth.jwt()->>'is_anonymous'),'false')='false');
create policy personal_runs_owner on public.do_personal_runs for select to authenticated using ((select auth.uid())=owner_id and coalesce((select auth.jwt()->>'is_anonymous'),'false')='false');

-- Invoker functions are service-only; the authenticated HTTP boundary supplies owner.
create function public.do_personal_save(p_owner uuid,p_id uuid,p_title text,p_goal text,p_notes text,p_timezone text,p_hour integer)
returns uuid language plpgsql security invoker set search_path='' as $$
declare v_id uuid; v_next timestamptz;
begin
 perform pg_advisory_xact_lock(3026,1);
 if not exists(select 1 from auth.users where id=p_owner and not is_anonymous) then raise exception 'owner_required'; end if;
 if not exists(select 1 from pg_timezone_names where name=p_timezone) then raise exception 'invalid_timezone'; end if;
 v_next:=((now() at time zone p_timezone)::date + make_interval(hours=>p_hour)) at time zone p_timezone;
 if v_next<=now() then v_next:=(((now() at time zone p_timezone)::date+1) + make_interval(hours=>p_hour)) at time zone p_timezone; end if;
 if p_id is null then
  if (select count(*) from public.do_personal_responsibilities where owner_id=p_owner)>=5 then raise exception 'responsibility_limit'; end if;
  insert into public.do_personal_responsibilities(owner_id,title,goal,notes,timezone,local_hour,active,consent_until,next_run_at)
   values(p_owner,p_title,p_goal,p_notes,p_timezone,p_hour,true,now()+interval '7 days',v_next) returning id into v_id;
 else
  update public.do_personal_responsibilities set title=p_title,goal=p_goal,notes=p_notes,timezone=p_timezone,local_hour=p_hour,active=true,consent_until=now()+interval '7 days',next_run_at=v_next,revision=revision+1,updated_at=now() where id=p_id and owner_id=p_owner returning id into v_id;
  if v_id is null then raise exception 'not_found'; end if;
  update public.do_personal_runs set status='cancelled',finished_at=now() where responsibility_id=v_id and owner_id=p_owner and status='running';
 end if;
 return v_id;
end $$;

create function public.do_personal_pause(p_owner uuid,p_id uuid) returns boolean language plpgsql security invoker set search_path='' as $$
begin
 update public.do_personal_responsibilities set active=false,revision=revision+1,updated_at=now() where id=p_id and owner_id=p_owner;
 if not found then return false; end if;
 update public.do_personal_runs set status='cancelled',finished_at=now() where responsibility_id=p_id and owner_id=p_owner and status='running';
 return true;
end $$;

create function public.do_personal_claim(p_owner uuid default null,p_id uuid default null)
returns table(run_id uuid,responsibility jsonb) language plpgsql security invoker set search_path='' as $$
declare r public.do_personal_responsibilities; v_run uuid;
begin
 perform pg_advisory_xact_lock(3026,1);
 delete from public.do_personal_usage where created_at<now()-interval '48 hours';
 update public.do_personal_runs set status='failed',finished_at=now(),evidence='{"error":"worker_interrupted"}'::jsonb where status='running' and started_at<now()-interval '10 minutes';
 -- One claim per call. Row lock prevents duplicates; owner lock bounds paid runs.
 for r in select t.* from public.do_personal_responsibilities t join auth.users u on u.id=t.owner_id
  where t.active and t.consent_until>now() and not u.is_anonymous
   and (p_owner is null or t.owner_id=p_owner) and (p_id is null or t.id=p_id)
   and (p_id is not null or t.next_run_at<=now())
  order by t.next_run_at for update of t skip locked limit 20
 loop

  update public.do_personal_runs set status='failed',finished_at=now(),evidence='{"error":"worker_interrupted"}'::jsonb where responsibility_id=r.id and status='running' and started_at<now()-interval '10 minutes';
  if exists(select 1 from public.do_personal_runs where responsibility_id=r.id and started_at>now()-interval '1 hour') then continue; end if;
  if (select count(*) from public.do_personal_usage where owner_id=r.owner_id and created_at>now()-interval '24 hours')>=5 then continue; end if;
  insert into public.do_personal_usage(owner_id) values(r.owner_id);
  insert into public.do_personal_runs(responsibility_id,owner_id,revision) values(r.id,r.owner_id,r.revision) returning id into v_run;
  update public.do_personal_responsibilities set next_run_at=(((now() at time zone r.timezone)::date+1)+make_interval(hours=>r.local_hour)) at time zone r.timezone where id=r.id;
  return query select v_run,to_jsonb(r);
  return;
 end loop;
end $$;

create function public.do_personal_finish(p_run uuid,p_output text,p_evidence jsonb,p_failed boolean default false)
returns boolean language plpgsql security invoker set search_path='' as $$
declare r public.do_personal_responsibilities; j public.do_personal_runs;
begin
 select t.* into r from public.do_personal_responsibilities t join public.do_personal_runs x on x.responsibility_id=t.id where x.id=p_run for update of t;
 if not found then return false; end if;
 select * into j from public.do_personal_runs where id=p_run for update;
 if j.status<>'running' then return false; end if;
 if not r.active or r.consent_until<=now() or r.revision<>j.revision then
  update public.do_personal_runs set status='cancelled',finished_at=now() where id=p_run;
  return false;
 end if;
 update public.do_personal_runs set status=case when p_failed then 'failed' else 'needs_review' end,output=left(p_output,20000),evidence=p_evidence,finished_at=now() where id=p_run;
 return true;
end $$;
revoke all on function public.do_personal_save(uuid,uuid,text,text,text,text,integer), public.do_personal_pause(uuid,uuid),public.do_personal_claim(uuid,uuid),public.do_personal_finish(uuid,text,jsonb,boolean) from public,anon,authenticated;
grant execute on function public.do_personal_save(uuid,uuid,text,text,text,text,integer),public.do_personal_pause(uuid,uuid),public.do_personal_claim(uuid,uuid),public.do_personal_finish(uuid,text,jsonb,boolean) to service_role;
