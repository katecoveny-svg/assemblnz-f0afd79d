-- OWNER-ONLY V2 PROPOSAL. UNAPPLIED. Requires independent review and targeted approval.
-- No recipient tables, Storage policies, original records or service credentials.
create schema if not exists extensions;
create extension if not exists pg_jsonschema with schema extensions;
do $$ begin
 if not exists(select 1 from pg_extension e join pg_namespace n on n.oid=e.extnamespace where e.extname='pg_jsonschema' and n.nspname='extensions')
 then raise exception 'pg_jsonschema must be reviewed in extensions namespace';end if;
end $$;
create schema studio_private;
revoke all on schema studio_private from public, anon, authenticated, service_role;

create function studio_private.colour_luminance(c text) returns double precision
language sql immutable security invoker set search_path='' as $$
 select sum((case when v<=0.04045 then v/12.92 else power((v+0.055)/1.055,2.4) end)*weight)
 from (select get_byte(decode(substr(c,2),'hex'),i)/255.0 as v,
  (array[0.2126,0.7152,0.0722]::double precision[])[i+1] as weight from generate_series(0,2) i) rgb
$$;
revoke all on function studio_private.colour_luminance(text) from public,anon,authenticated,service_role;
create function studio_private.valid_brand_contrast(b jsonb) returns boolean
language sql immutable security invoker set search_path='' as $$
 select b is null or (
 (greatest(studio_private.colour_luminance(b->>'primary'),studio_private.colour_luminance(b->>'onPrimary'))+0.05)
 /(least(studio_private.colour_luminance(b->>'primary'),studio_private.colour_luminance(b->>'onPrimary'))+0.05)>=4.5 and
 (greatest(studio_private.colour_luminance(b->>'paper'),studio_private.colour_luminance(b->>'ink'))+0.05)
 /(least(studio_private.colour_luminance(b->>'paper'),studio_private.colour_luminance(b->>'ink'))+0.05)>=4.5)
$$;
revoke all on function studio_private.valid_brand_contrast(jsonb) from public,anon,authenticated,service_role;
create function studio_private.valid_owner_payload(p jsonb) returns boolean
language plpgsql immutable security invoker set search_path = '' as $validate$
begin
 if not coalesce(p is not null and jsonb_typeof(p)='object' and p ? 'schemaVersion'
   and jsonb_typeof(p->'schemaVersion')='number' and p->'schemaVersion'='1'::jsonb
   and octet_length(p::text)<=1800000
   and extensions.jsonb_matches_schema($hub_schema$__OWNER_PAYLOAD_SCHEMA__$hub_schema$::json,p),false) then return false;end if;
 if not studio_private.valid_brand_contrast(p->'sellerBrand') or not studio_private.valid_brand_contrast(p->'clientBrand') then return false;end if;
 if p ? 'cinema' and p#>>'{cinema,mode}'='upload' and not (p->'cinema' ? 'mediaId') then return false;end if;
 if p ? 'radar' and (p#>>'{radar,seller,approved}'<>'true' or p#>>'{radar,opportunity,stage}'='hold'
  or not exists(select 1 from jsonb_array_elements(p#>'{radar,opportunity,evidence}') e where e->'verified'='true'::jsonb)) then return false;end if;
 return true;
end
$validate$;
revoke all on function studio_private.valid_owner_payload(jsonb) from public,anon,authenticated,service_role;

create table public.studio_owner_access (
 owner_user_id uuid primary key references auth.users(id) on delete cascade,
 enabled boolean not null default false,
 draft_limit integer not null default 20 check(draft_limit between 1 and 100),
 byte_limit bigint not null default 20971520 check(byte_limit between 1800000 and 104857600),
 deleted_retention_days integer not null default 30 check(deleted_retention_days between 1 and 90)
);
alter table public.studio_owner_access enable row level security;
revoke all on public.studio_owner_access from public,anon,authenticated,service_role;
grant select on public.studio_owner_access to authenticated;
create policy studio_owner_access_self on public.studio_owner_access for select to authenticated using (
 (select auth.uid())=owner_user_id and enabled and coalesce((select auth.jwt())->>'is_anonymous','false')<>'true'
);

create table public.studio_owner_drafts (
 id uuid primary key default gen_random_uuid(),
 owner_user_id uuid not null references auth.users(id) on delete cascade,
 revision integer not null check(revision>0),
 payload jsonb not null check(studio_private.valid_owner_payload(payload)),
 payload_bytes bigint generated always as (octet_length(payload::text)) stored,
 created_at timestamptz not null default clock_timestamp(),
 updated_at timestamptz not null default clock_timestamp(),
 deleted_at timestamptz,
 unique(id,owner_user_id)
);
create index studio_owner_drafts_owner_updated on public.studio_owner_drafts(owner_user_id,updated_at desc);
alter table public.studio_owner_drafts enable row level security;
revoke all on public.studio_owner_drafts from public,anon,authenticated,service_role;
grant select on public.studio_owner_drafts to authenticated;
create policy studio_owner_drafts_self on public.studio_owner_drafts for select to authenticated using (
 (select auth.uid())=owner_user_id and deleted_at is null
 and coalesce((select auth.jwt())->>'is_anonymous','false')<>'true'
 and exists(select 1 from public.studio_owner_access a where a.owner_user_id=studio_owner_drafts.owner_user_id and a.enabled)
);

-- Direct INSERT/UPDATE/DELETE privileges are absent, regardless of default grants.
-- Definer is necessary for this one write path, with fixed namespace and verified caller.
create function public.studio_save_owner_draft(p_id uuid,p_revision integer,p_payload jsonb)
returns setof public.studio_owner_drafts language plpgsql security definer set search_path = '' as $save$
declare
 v_owner uuid:=auth.uid();v_access public.studio_owner_access%rowtype;
 v_old public.studio_owner_drafts%rowtype;v_count bigint;v_bytes bigint;v_new_bytes bigint;
begin
 if v_owner is null or coalesce(auth.jwt()->>'is_anonymous','false')='true' then raise exception 'Workspace unavailable' using errcode='42501';end if;
 if p_revision is null or p_payload is null or not studio_private.valid_owner_payload(p_payload)
 or (p_id is null and p_revision<>0) or (p_id is not null and p_revision<1)
 then raise exception 'Invalid draft arguments' using errcode='22023';end if;
 select * into v_access from public.studio_owner_access where owner_user_id=v_owner and enabled for update;
 if not found then raise exception 'Workspace unavailable' using errcode='42501';end if;
 -- Every writer and purger acquires this owner's access lock before touching drafts.
 select count(*),coalesce(sum(payload_bytes),0) into v_count,v_bytes from public.studio_owner_drafts where owner_user_id=v_owner;
 v_new_bytes:=octet_length(p_payload::text);
 if p_id is null then
  if v_count>=v_access.draft_limit or v_bytes+v_new_bytes>v_access.byte_limit then raise exception 'Workspace quota reached' using errcode='P0001';end if;
  return query insert into public.studio_owner_drafts(owner_user_id,revision,payload) values(v_owner,1,p_payload) returning *;
 else
  select * into v_old from public.studio_owner_drafts where id=p_id and owner_user_id=v_owner and deleted_at is null for update;
  if not found or v_old.revision<>p_revision then return;end if;
  if v_bytes-v_old.payload_bytes+v_new_bytes>v_access.byte_limit then raise exception 'Workspace quota reached' using errcode='P0001';end if;
  return query update public.studio_owner_drafts set payload=p_payload,revision=revision+1,updated_at=clock_timestamp()
   where id=p_id and owner_user_id=v_owner and revision=p_revision and deleted_at is null returning *;
 end if;
end $save$;
revoke all on function public.studio_save_owner_draft(uuid,integer,jsonb) from public,anon,authenticated,service_role;
grant execute on function public.studio_save_owner_draft(uuid,integer,jsonb) to authenticated;

create function public.studio_delete_owner_draft(p_id uuid,p_revision integer)
returns table(id uuid,revision integer,deleted_at timestamptz) language plpgsql security definer set search_path='' as $delete$
declare v_owner uuid:=auth.uid();v_access public.studio_owner_access%rowtype;
begin
 if v_owner is null or coalesce(auth.jwt()->>'is_anonymous','false')='true' then raise exception 'Workspace unavailable' using errcode='42501';end if;
 if p_id is null or p_revision is null or p_revision<1 then raise exception 'Invalid draft arguments' using errcode='22023';end if;
 select * into v_access from public.studio_owner_access where owner_user_id=v_owner and enabled for update;
 if not found then raise exception 'Workspace unavailable' using errcode='42501';end if;
 return query update public.studio_owner_drafts d set deleted_at=clock_timestamp(),updated_at=clock_timestamp(),revision=d.revision+1
  where d.id=p_id and d.owner_user_id=v_owner and d.revision=p_revision and d.deleted_at is null returning d.id,d.revision,d.deleted_at;
end $delete$;
revoke all on function public.studio_delete_owner_draft(uuid,integer) from public,anon,authenticated,service_role;
grant execute on function public.studio_delete_owner_draft(uuid,integer) to authenticated;

-- Operator-only retention task; no job is created/claimed by this proposal.
-- Tombstones remain in quota until due purge. Production activation needs monitored scheduling.
create function public.studio_purge_deleted_owner_drafts() returns bigint
language plpgsql security definer set search_path='' as $purge$
declare a public.studio_owner_access%rowtype;v_rows bigint;v_total bigint:=0;
begin
 for a in select * from public.studio_owner_access order by owner_user_id for update loop
  delete from public.studio_owner_drafts d where d.owner_user_id=a.owner_user_id
   and d.deleted_at<clock_timestamp()-pg_catalog.make_interval(days=>a.deleted_retention_days);
  get diagnostics v_rows=ROW_COUNT;v_total:=v_total+v_rows;
 end loop;
 return v_total;
end $purge$;
revoke all on function public.studio_purge_deleted_owner_drafts() from public,anon,authenticated,service_role;
grant execute on function public.studio_purge_deleted_owner_drafts() to service_role;
