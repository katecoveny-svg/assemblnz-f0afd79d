-- Count evidenced follow-up outcomes on the original enquiry without duplicate jobs.
begin;
create or replace function public.do_enquiry_transition(p_owner uuid,p_id uuid,p_action text,p_input jsonb)
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
    if j.status<>'pending' or j.revision::text is distinct from (p_input->>'revision') then raise exception 'review_changed'; end if;
    if parent_uuid is not null and (parent.answered_at is not null or parent.booked_at is not null) then raise exception 'followup_no_longer_needed'; end if;
    if p_action='edit' then
      j.subject=p_input->>'subject'; j.body=p_input->>'body'; j.revision=gen_random_uuid();
    else
      j.status='sending'; j.approved_at=now();
      ev=ev||jsonb_build_object('revision',j.revision,'recipient',j.email,'subject',j.subject,'body',j.body,'sender','front@assembl.co.nz');
    end if;
  elsif p_action='finish' then
    if j.status<>'sending' or j.revision::text is distinct from (p_input->>'revision') then raise exception 'invalid_transition'; end if;
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
    -- A follow-up is part of the original enquiry's funnel. Preserve the
    -- child receipt, but atomically record its outcome on the parent as well.
    if parent_uuid is not null then
      if (p_action='answered' and parent.answered_at is null) or (p_action='booked' and parent.booked_at is null) then
        update public.do_enquiry_jobs set
          answered_at=case when p_action='answered' then coalesce(answered_at,now()) else answered_at end,
          booked_at=case when p_action='booked' then coalesce(booked_at,now()) else booked_at end,
          evidence=evidence||jsonb_build_array(ev||jsonb_build_object('viaJobId',j.id))
        where id=parent_uuid and owner_id=p_owner;
      end if;
      update public.do_enquiry_jobs set status='cancelled',evidence=evidence||jsonb_build_array(jsonb_build_object('kind','cancelled','at',now(),'source','parent_outcome'))
        where parent_id=parent_uuid and owner_id=p_owner and status='pending';
    end if;
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

revoke all on function public.do_enquiry_transition(uuid,uuid,text,jsonb) from public,anon,authenticated;
grant execute on function public.do_enquiry_transition(uuid,uuid,text,jsonb) to service_role;
commit;
