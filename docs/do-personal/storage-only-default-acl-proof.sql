-- SYNTHETIC DISPOSABLE PG17 ONLY. Complete effective ACL matrix and actual denials.
begin;
do $$
declare t text; priv text; r text; signature text; expected boolean;
begin
 if has_table_privilege('service_role','public.do_personal_storage_requests','UPDATE') then
  raise exception 'ACL_EXCESS_SERVICE_REQUEST_UPDATE';
 end if;
 foreach t in array array['do_personal_storage_enrolment','do_personal_storage_maintenance','do_personal_storage_requests'] loop
  foreach r in array array['anon','authenticated','service_role'] loop
   foreach priv in array array['SELECT','INSERT','UPDATE','DELETE','TRUNCATE','REFERENCES','TRIGGER','MAINTAIN'] loop
    expected:=r='service_role' and (priv in ('SELECT','INSERT') or (priv='UPDATE' and t<>'do_personal_storage_requests') or (priv='DELETE' and t='do_personal_storage_enrolment'));
    if has_table_privilege(r,'public.'||t,priv) is distinct from expected then
     raise exception 'ACL_TABLE_MATRIX_MISMATCH: % % % expected %',r,t,priv,expected;
    end if;
   end loop;
  end loop;
 end loop;
 foreach signature in array array['public.do_personal_storage_ready(uuid)','public.do_personal_save_paused(uuid,uuid,text,text,text,text,integer,integer)','public.do_personal_storage_expire_batch(integer)','public.do_personal_storage_record_maintenance(text,integer,timestamptz)','public.do_personal_storage_maintenance_health()'] loop
  foreach r in array array['anon','authenticated','service_role'] loop
   if has_function_privilege(r,signature,'EXECUTE') is distinct from (r='service_role') then raise exception 'ACL_FUNCTION_MATRIX_MISMATCH: % %',r,signature; end if;
  end loop;
 end loop;
end $$;
set local role service_role;
do $$begin
 begin update public.do_personal_storage_requests set created_at=clock_timestamp(); raise exception 'ACL_UPDATE_FENCE_ALLOWED'; exception when insufficient_privilege then null; end;
 begin delete from public.do_personal_storage_requests; raise exception 'ACL_DELETE_FENCE_ALLOWED'; exception when insufficient_privilege then null; end;
 begin truncate public.do_personal_storage_requests; raise exception 'ACL_TRUNCATE_FENCE_ALLOWED'; exception when insufficient_privilege then null; end;
 begin delete from public.do_personal_storage_maintenance; raise exception 'ACL_DELETE_HEALTH_ALLOWED'; exception when insufficient_privilege then null; end;
 begin truncate public.do_personal_storage_maintenance; raise exception 'ACL_TRUNCATE_HEALTH_ALLOWED'; exception when insufficient_privilege then null; end;
 begin truncate public.do_personal_storage_enrolment; raise exception 'ACL_TRUNCATE_ENROLMENT_ALLOWED'; exception when insufficient_privilege then null; end;
end $$;
reset role;
select jsonb_build_object('table',t,'role',r,'privilege',p,'allowed',has_table_privilege(r,'public.'||t,p))
from unnest(array['do_personal_storage_enrolment','do_personal_storage_maintenance','do_personal_storage_requests']) t
cross join unnest(array['anon','authenticated','service_role']) r
cross join unnest(array['SELECT','INSERT','UPDATE','DELETE','TRUNCATE','REFERENCES','TRIGGER','MAINTAIN']) p order by t,r,p;
select jsonb_build_object('function',f,'role',r,'execute',has_function_privilege(r,f,'EXECUTE'))
from unnest(array['public.do_personal_storage_ready(uuid)','public.do_personal_save_paused(uuid,uuid,text,text,text,text,integer,integer)','public.do_personal_storage_expire_batch(integer)','public.do_personal_storage_record_maintenance(text,integer,timestamptz)','public.do_personal_storage_maintenance_health()']) f
cross join unnest(array['anon','authenticated','service_role']) r order by f,r;
rollback;
