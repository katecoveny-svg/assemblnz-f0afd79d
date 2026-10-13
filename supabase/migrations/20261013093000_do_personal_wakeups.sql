-- Personal DO wake-ups: cadence, self-scheduled once runs, manual/message triggers.
-- Additive. Wake-ups stay off until an owner turns them on with a bounded consent,
-- and the worker stays off until DO_PERSONAL_WORKER_MODE is set. No provider call.
alter table public.do_personal_responsibilities
 add column cadence text not null default 'daily' check (cadence in ('daily','weekdays','weekly','once','manual')),
 add column weekday integer check (weekday between 0 and 6),
 add column run_once_at timestamptz,
 add constraint do_personal_cadence_shape check (
  (cadence='weekly' and weekday is not null) or (cadence<>'weekly' and weekday is null));
alter table public.do_personal_runs
 add column trigger text not null default 'scheduled' check (trigger in ('scheduled','once','manual','message')),
 add column note text check (char_length(note) between 1 and 500);

-- One place computes the next wake-up for every caller; 'infinity' means none.
create function public.do_personal_next_wake(p_cadence text,p_weekday integer,p_hour integer,p_timezone text,p_run_once_at timestamptz,p_after timestamptz)
returns timestamptz language plpgsql stable set search_path='' as $$
declare d date; v timestamptz; i integer;
begin
 if p_cadence='manual' then return 'infinity'; end if;
 if p_cadence='once' then return case when p_run_once_at>p_after then p_run_once_at else 'infinity' end; end if;
 d:=(p_after at time zone p_timezone)::date;
 for i in 0..7 loop
  v:=((d+i)+make_interval(hours=>p_hour)) at time zone p_timezone;
  if v>p_after and (p_cadence='daily'
   or (p_cadence='weekdays' and extract(isodow from d+i)<=5)
   or (p_cadence='weekly' and extract(dow from d+i)=p_weekday)) then return v; end if;
 end loop;
 return 'infinity';
end $$;

-- Owner turns wake-ups on (or changes them). Consent is bounded to seven days and
-- never outlives the stored body. Revision is checked, not bumped: the notes are unchanged.
create function public.do_personal_schedule(p_owner uuid,p_id uuid,p_cadence text,p_weekday integer,p_hour integer,p_timezone text,p_run_once_at timestamptz,p_expected_revision integer)
returns jsonb language plpgsql security invoker set search_path='' set lock_timeout='2s' as $$
declare v_row public.do_personal_responsibilities; v_expiry timestamptz; v_consent timestamptz; v_next timestamptz;
begin
 perform pg_advisory_xact_lock(3026,1);
 if not exists(select 1 from auth.users where id=p_owner and not is_anonymous) then raise exception 'owner_required'; end if;
 if p_cadence is null or p_cadence not in ('daily','weekdays','weekly','once','manual')
  or p_hour is null or p_hour<0 or p_hour>23
  or (p_cadence='weekly') <> (p_weekday is not null) or p_weekday<0 or p_weekday>6
  or (p_cadence='once') <> (p_run_once_at is not null)
  or p_timezone is null or not exists(select 1 from pg_timezone_names where name=p_timezone)
  or p_expected_revision is null or p_expected_revision<1 then raise exception 'wake_invalid'; end if;
 select * into v_row from public.do_personal_responsibilities where owner_id=p_owner and id=p_id for update;
 if not found then raise exception 'not_found'; end if;
 -- Read the storage-only expiry when that proposal is installed; this migration does not require it.
 v_expiry:=(to_jsonb(v_row)->>'storage_body_expires_at')::timestamptz;
 if v_row.revision<>p_expected_revision or (v_expiry is not null and v_expiry<=now()) then raise exception 'responsibility_conflict'; end if;
 v_consent:=least(now()+interval '7 days',coalesce(v_expiry,'infinity'));
 if p_cadence='once' and (p_run_once_at<=now() or p_run_once_at>v_consent) then raise exception 'wake_window'; end if;
 v_next:=public.do_personal_next_wake(p_cadence,p_weekday,p_hour,p_timezone,p_run_once_at,now());
 update public.do_personal_responsibilities set cadence=p_cadence,weekday=p_weekday,local_hour=p_hour,timezone=p_timezone,run_once_at=p_run_once_at,
  active=true,consent_until=v_consent,next_run_at=v_next,updated_at=now() where id=p_id;
 return jsonb_build_object('id',p_id,'revision',v_row.revision,'cadence',p_cadence,'active',true,'consentUntil',v_consent,'nextRunAt',v_next);
end $$;

-- Claim now records why DO woke up and advances by cadence; 'once' fires once.
drop function public.do_personal_claim(uuid,uuid);
create function public.do_personal_claim(p_owner uuid default null,p_id uuid default null,p_trigger text default 'scheduled',p_note text default null)
returns table(run_id uuid,responsibility jsonb) language plpgsql security invoker set search_path='' as $$
declare r public.do_personal_responsibilities; v_run uuid; v_expiry timestamptz; v_trigger text;
begin
 perform pg_advisory_xact_lock(3026,1);
 if p_trigger is null or p_trigger not in ('scheduled','manual','message') or (p_trigger='message') <> (p_note is not null)
  or (p_id is null) <> (p_trigger='scheduled') then raise exception 'wake_invalid'; end if;
 delete from public.do_personal_usage where created_at<now()-interval '48 hours';
 update public.do_personal_runs set status='failed',finished_at=now(),evidence='{"error":"worker_interrupted"}'::jsonb where status='running' and started_at<now()-interval '10 minutes';
 for r in select t.* from public.do_personal_responsibilities t join auth.users u on u.id=t.owner_id
  where t.active and t.consent_until>now() and not u.is_anonymous
   and (p_owner is null or t.owner_id=p_owner) and (p_id is null or t.id=p_id)
   and (p_id is not null or t.next_run_at<=now())
  order by t.next_run_at for update of t skip locked limit 20
 loop
  v_expiry:=(to_jsonb(r)->>'storage_body_expires_at')::timestamptz;
  if v_expiry is not null and v_expiry<=now() then continue; end if;
  update public.do_personal_runs set status='failed',finished_at=now(),evidence='{"error":"worker_interrupted"}'::jsonb where responsibility_id=r.id and status='running' and started_at<now()-interval '10 minutes';
  if exists(select 1 from public.do_personal_runs where responsibility_id=r.id and started_at>now()-interval '1 hour') then continue; end if;
  if (select count(*) from public.do_personal_usage where owner_id=r.owner_id and created_at>now()-interval '24 hours')>=5 then continue; end if;
  insert into public.do_personal_usage(owner_id) values(r.owner_id);
  v_trigger:=case when p_trigger='scheduled' and r.cadence='once' then 'once' else p_trigger end;
  insert into public.do_personal_runs(responsibility_id,owner_id,revision,trigger,note) values(r.id,r.owner_id,r.revision,v_trigger,p_note) returning id into v_run;
  update public.do_personal_responsibilities set next_run_at=case when p_trigger='scheduled' or r.next_run_at<=now()
   then public.do_personal_next_wake(r.cadence,r.weekday,r.local_hour,r.timezone,case when r.cadence='once' then null else r.run_once_at end,now())
   else r.next_run_at end where id=r.id;
  return query select v_run,to_jsonb(r);
  return;
 end loop;
end $$;

-- Legacy save keeps working and follows the row's cadence on update.
create or replace function public.do_personal_save(p_owner uuid,p_id uuid,p_title text,p_goal text,p_notes text,p_timezone text,p_hour integer)
returns uuid language plpgsql security invoker set search_path='' as $$
declare v_id uuid; v_row public.do_personal_responsibilities;
begin
 perform pg_advisory_xact_lock(3026,1);
 if not exists(select 1 from auth.users where id=p_owner and not is_anonymous) then raise exception 'owner_required'; end if;
 if not exists(select 1 from pg_timezone_names where name=p_timezone) then raise exception 'invalid_timezone'; end if;
 if p_id is null then
  if (select count(*) from public.do_personal_responsibilities where owner_id=p_owner)>=5 then raise exception 'responsibility_limit'; end if;
  insert into public.do_personal_responsibilities(owner_id,title,goal,notes,timezone,local_hour,active,consent_until,next_run_at)
   values(p_owner,p_title,p_goal,p_notes,p_timezone,p_hour,true,now()+interval '7 days',public.do_personal_next_wake('daily',null,p_hour,p_timezone,null,now())) returning id into v_id;
 else
  select * into v_row from public.do_personal_responsibilities where id=p_id and owner_id=p_owner for update;
  if not found then raise exception 'not_found'; end if;
  update public.do_personal_responsibilities set title=p_title,goal=p_goal,notes=p_notes,timezone=p_timezone,local_hour=p_hour,active=true,consent_until=now()+interval '7 days',
   next_run_at=public.do_personal_next_wake(v_row.cadence,v_row.weekday,p_hour,p_timezone,v_row.run_once_at,now()),revision=revision+1,updated_at=now() where id=p_id returning id into v_id;
  update public.do_personal_runs set status='cancelled',finished_at=now() where responsibility_id=v_id and owner_id=p_owner and status='running';
 end if;
 return v_id;
end $$;

revoke all on function public.do_personal_next_wake(text,integer,integer,text,timestamptz,timestamptz),public.do_personal_schedule(uuid,uuid,text,integer,integer,text,timestamptz,integer),public.do_personal_claim(uuid,uuid,text,text) from public,anon,authenticated;
grant execute on function public.do_personal_next_wake(text,integer,integer,text,timestamptz,timestamptz),public.do_personal_schedule(uuid,uuid,text,integer,integer,text,timestamptz,integer),public.do_personal_claim(uuid,uuid,text,text) to service_role;
