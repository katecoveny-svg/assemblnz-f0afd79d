-- DO Enquiries: private, approval-bound email jobs. All mutation RPCs are
-- service-role only; callers resolve the verified owner before invoking them.
begin;
create table public.do_enquiry_jobs (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  source_key text not null check (length(source_key) between 1 and 180),
  input_hash text not null,
  parent_id uuid references public.do_enquiry_jobs(id),
  name text not null, email text not null, message text not null,
  subject text not null, body text not null,
  revision uuid not null default gen_random_uuid(),
  status text not null default 'pending' check(status in ('pending','sending','sent','failed','uncertain','cancelled')),
  provider_id text,
  received_at timestamptz not null default now(),
  approved_at timestamptz, sent_at timestamptz, answered_at timestamptz, booked_at timestamptz,
  followup_due_at timestamptz, followup_created_at timestamptz,
  evidence jsonb not null default '[]'::jsonb,
  unique(owner_id,source_key)
);
create index do_enquiry_jobs_owner on public.do_enquiry_jobs(owner_id,received_at desc);
create index do_enquiry_jobs_followup on public.do_enquiry_jobs(followup_due_at) where status='sent' and followup_created_at is null;
alter table public.do_enquiry_jobs enable row level security;
revoke all on public.do_enquiry_jobs from anon, authenticated;
grant select on public.do_enquiry_jobs to authenticated;
grant all on public.do_enquiry_jobs to service_role;
create policy "read own enquiry jobs" on public.do_enquiry_jobs for select to authenticated using ((select auth.uid())=owner_id);

create table public.do_enquiry_connections (
  owner_id uuid primary key references auth.users(id) on delete cascade,
  token_hash text unique not null,
  created_at timestamptz not null default now()
);
alter table public.do_enquiry_connections enable row level security;
revoke all on public.do_enquiry_connections from anon, authenticated;
grant all on public.do_enquiry_connections to service_role;

create function public.do_enquiry_receive(p_owner uuid,p_key text,p_hash text,p_input jsonb)
returns jsonb language plpgsql security invoker set search_path=public as $$
declare j public.do_enquiry_jobs;
begin
  perform pg_advisory_xact_lock(hashtextextended('do-enquiries:'||p_owner::text,0));
  select * into j from public.do_enquiry_jobs where owner_id=p_owner and source_key=p_key;
  if found then
    if j.input_hash<>p_hash then raise exception 'source_conflict'; end if;
    return to_jsonb(j);
  end if;
  if (select count(*) from public.do_enquiry_jobs where owner_id=p_owner and received_at>now()-interval '1 day')>=100 then raise exception 'daily_limit'; end if;
  insert into public.do_enquiry_jobs(owner_id,source_key,input_hash,name,email,message,subject,body,evidence)
  values(p_owner,p_key,p_hash,p_input->>'name',p_input->>'email',p_input->>'message',p_input->>'subject',p_input->>'body',
    jsonb_build_array(jsonb_build_object('kind','received','at',now(),'source',p_input->>'source')))
  returning * into j;
  return to_jsonb(j);
end $$;

create function public.do_enquiry_transition(p_owner uuid,p_id uuid,p_action text,p_input jsonb)
returns jsonb language plpgsql security invoker set search_path=public as $$
declare j public.do_enquiry_jobs; parent public.do_enquiry_jobs; parent_uuid uuid; ev jsonb;
begin
  -- Lock parent first everywhere, so reply/booking events and follow-up approval
  -- cannot race each other into sending a no-longer-needed follow-up.
  select parent_id into parent_uuid from public.do_enquiry_jobs where id=p_id and owner_id=p_owner;
  if parent_uuid is not null then select * into parent from public.do_enquiry_jobs where id=parent_uuid and owner_id=p_owner for update; end if;
  select * into j from public.do_enquiry_jobs where id=p_id and owner_id=p_owner for update;
  if not found then raise exception 'not_found'; end if;
  ev=jsonb_build_object('kind',p_action,'at',now(),'source',coalesce(p_input->>'source','owner'));
  if p_action in ('edit','approve') then
    if j.status<>'pending' or j.revision::text<>p_input->>'revision' then raise exception 'review_changed'; end if;
    if parent_uuid is not null and (parent.answered_at is not null or parent.booked_at is not null) then raise exception 'followup_no_longer_needed'; end if;
    if p_action='edit' then
      j.subject=p_input->>'subject'; j.body=p_input->>'body'; j.revision=gen_random_uuid();
    else
      j.status='sending'; j.approved_at=now();
      ev=ev||jsonb_build_object('revision',j.revision,'recipient',j.email,'subject',j.subject,'body',j.body,'sender','front@assembl.co.nz');
    end if;
  elsif p_action='finish' then
    if j.status<>'sending' or j.revision::text<>p_input->>'revision' then raise exception 'invalid_transition'; end if;
    if p_input->>'status' not in ('sent','failed','uncertain') then raise exception 'invalid_result'; end if;
    j.status=p_input->>'status';
    if j.status='sent' then
      if coalesce(length(p_input->>'providerId'),0)=0 then raise exception 'receipt_required'; end if;
      j.provider_id=p_input->>'providerId'; j.sent_at=now();
      if j.parent_id is null then j.followup_due_at=now()+interval '3 days'; end if;
    end if;
    ev=ev||jsonb_build_object('result',j.status,'providerId',j.provider_id,'detail',p_input->>'detail');
  elsif p_action in ('answered','booked') then
    if j.sent_at is null then raise exception 'send_not_confirmed'; end if;
    if coalesce(length(p_input->>'evidence'),0)<3 then raise exception 'evidence_required'; end if;
    if (p_action='answered' and j.answered_at is not null) or (p_action='booked' and j.booked_at is not null) then return to_jsonb(j); end if;
    if p_action='answered' then j.answered_at=now(); else j.booked_at=now(); end if;
    ev=ev||jsonb_build_object('detail',p_input->>'evidence');
    update public.do_enquiry_jobs set status='cancelled',evidence=evidence||jsonb_build_array(jsonb_build_object('kind','cancelled','at',now(),'source','parent_outcome'))
      where parent_id=j.id and owner_id=p_owner and status='pending';
  elsif p_action='cancel' then
    if j.status<>'pending' then raise exception 'invalid_transition'; end if;
    j.status='cancelled';
  else raise exception 'invalid_transition'; end if;
  update public.do_enquiry_jobs set subject=j.subject,body=j.body,revision=j.revision,status=j.status,
    approved_at=j.approved_at,sent_at=j.sent_at,answered_at=j.answered_at,booked_at=j.booked_at,
    provider_id=j.provider_id,followup_due_at=j.followup_due_at,evidence=j.evidence||jsonb_build_array(ev)
    where id=j.id returning * into j;
  return to_jsonb(j);
end $$;

create function public.do_enquiry_followups(p_limit integer default 20, p_owner uuid default null)
returns integer language plpgsql security invoker set search_path=public as $$
declare j public.do_enquiry_jobs; n integer=0;
begin
  for j in select * from public.do_enquiry_jobs where status='sent' and parent_id is null and (p_owner is null or owner_id=p_owner)
    and answered_at is null and booked_at is null and followup_due_at<=now() and followup_created_at is null
    order by followup_due_at limit least(greatest(p_limit,1),50) for update skip locked
  loop
    insert into public.do_enquiry_jobs(owner_id,source_key,input_hash,parent_id,name,email,message,subject,body,evidence)
    values(j.owner_id,'followup:'||j.id::text,j.id::text,j.id,j.name,j.email,j.message,'Following up: '||j.subject,
      'Kia ora '||j.name||E',\n\nJust checking whether you still need a hand with your enquiry. Happy to help when you are ready.\n\nThe assembl team',
      jsonb_build_array(jsonb_build_object('kind','received','at',now(),'source','followup_due','parentId',j.id)))
      on conflict(owner_id,source_key) do nothing;
    update public.do_enquiry_jobs set followup_created_at=now(),evidence=evidence||jsonb_build_array(jsonb_build_object('kind','followup_prepared','at',now(),'source','worker')) where id=j.id;
    n=n+1;
  end loop;
  return n;
end $$;
revoke all on function public.do_enquiry_receive(uuid,text,text,jsonb),public.do_enquiry_transition(uuid,uuid,text,jsonb),public.do_enquiry_followups(integer,uuid) from public,anon,authenticated;
grant execute on function public.do_enquiry_receive(uuid,text,text,jsonb),public.do_enquiry_transition(uuid,uuid,text,jsonb),public.do_enquiry_followups(integer,uuid) to service_role;
commit;
