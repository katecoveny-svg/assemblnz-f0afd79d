-- Arataki loan car overlay: preserve user ownership and add rooftop tenancy.

alter table public.loan_cars
  add column if not exists tenant_id uuid references public.tenants(id),
  add column if not exists expected_return_at timestamptz,
  add column if not exists loan_started_at timestamptz;

update public.loan_cars
set expected_return_at = return_date::timestamptz
where expected_return_at is null
  and return_date is not null;

-- A LATERAL in UPDATE ... FROM cannot correlate to the UPDATE target (lc) —
-- Postgres raises 42P10 on a fresh replay. Equivalent correlated scalar
-- subquery instead (earliest membership by created_at).
update public.loan_cars lc
set tenant_id = (
  select tm.tenant_id
  from public.tenant_members tm
  where tm.user_id = lc.user_id
  order by tm.created_at asc
  limit 1
)
where lc.tenant_id is null
  and exists (
    select 1 from public.tenant_members tm where tm.user_id = lc.user_id
  );

do $$
begin
  if to_regclass('public.platform_org_members') is not null then
    execute $sql$
      update public.loan_cars lc
      set tenant_id = (
        select pom.tenant_id
        from public.platform_org_members pom
        where pom.user_id = lc.user_id
        order by pom.created_at asc
        limit 1
      )
      where lc.tenant_id is null
        and exists (
          select 1 from public.platform_org_members pom where pom.user_id = lc.user_id
        )
    $sql$;
  end if;
end $$;

create index if not exists idx_loan_cars_tenant_status_expected_return
  on public.loan_cars (tenant_id, status, expected_return_at);

create or replace function public.can_access_loan_car_tenant(_tenant_id uuid)
returns boolean
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  has_access boolean;
begin
  if _tenant_id is null or auth.uid() is null then
    return false;
  end if;

  select exists (
    select 1
    from public.tenant_members
    where tenant_id = _tenant_id
      and user_id = auth.uid()
  )
  into has_access;

  if has_access then
    return true;
  end if;

  if to_regclass('public.platform_org_members') is not null then
    execute
      'select exists (
        select 1
        from public.platform_org_members
        where tenant_id = $1
          and user_id = $2
      )'
      into has_access
      using _tenant_id, auth.uid();
  end if;

  return coalesce(has_access, false);
end;
$$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'loan_cars'
      and policyname = 'loan_cars_tenant_read'
  ) then
    create policy "loan_cars_tenant_read"
      on public.loan_cars
      for select
      to authenticated
      using (public.can_access_loan_car_tenant(tenant_id));
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'loan_cars'
      and policyname = 'loan_cars_tenant_insert'
  ) then
    create policy "loan_cars_tenant_insert"
      on public.loan_cars
      for insert
      to authenticated
      with check (
        user_id = auth.uid()
        and public.can_access_loan_car_tenant(tenant_id)
      );
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'loan_cars'
      and policyname = 'loan_cars_tenant_update'
  ) then
    create policy "loan_cars_tenant_update"
      on public.loan_cars
      for update
      to authenticated
      using (public.can_access_loan_car_tenant(tenant_id))
      with check (
        user_id = auth.uid()
        and public.can_access_loan_car_tenant(tenant_id)
      );
  end if;
end $$;
