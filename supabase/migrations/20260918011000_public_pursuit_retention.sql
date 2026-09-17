-- Bounded data retention: replay expires at seven days, daily deletion within the next day.
create or replace function public.reserve_public_pursuit(p_id uuid,p_principal text,p_input_hash text)
returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
declare p public.pursuit_public_policy; r public.pursuit_public_runs; day_start timestamptz; n integer;
begin
 if length(p_principal)<>64 or length(p_input_hash)<>64 then raise exception 'invalid_request_hash'; end if;
 perform pg_advisory_xact_lock(183009182026);
 delete from public.pursuit_public_runs where created_at<now()-interval '7 days';
 select * into p from public.pursuit_public_policy where id=true;
 if not found or not p.enabled then return jsonb_build_object('status','disabled');end if;
 select * into r from public.pursuit_public_runs where id=p_id;
 if found then
  if r.principal_hash<>p_principal or r.input_hash<>p_input_hash then return jsonb_build_object('status','conflict');end if;
  if r.state='complete' then return jsonb_build_object('status','replay','result',r.result);end if;
  return jsonb_build_object('status',r.state);
 end if;
 day_start=date_trunc('day',now() at time zone 'UTC') at time zone 'UTC';
 select count(*) into n from public.pursuit_public_runs where created_at>=day_start;
 if n>=p.global_daily_limit then return jsonb_build_object('status','daily_limit');end if;
 select count(*) into n from public.pursuit_public_runs where created_at>=day_start and principal_hash=p_principal;
 if n>=p.client_daily_limit then return jsonb_build_object('status','client_limit');end if;
 insert into public.pursuit_public_runs(id,principal_hash,input_hash) values(p_id,p_principal,p_input_hash);
 return jsonb_build_object('status','reserved','typesafeEnabled',p.typesafe_enabled);
end $$;
revoke all on function public.reserve_public_pursuit(uuid,text,text) from public,anon,authenticated;
grant execute on function public.reserve_public_pursuit(uuid,text,text) to service_role;
-- cron is already installed in assembl-prod; don't silently promise retention without it.
select cron.schedule('assembl-public-pursuit-retention','15 3 * * *',$job$delete from public.pursuit_public_runs where created_at<now()-interval '7 days';$job$);
