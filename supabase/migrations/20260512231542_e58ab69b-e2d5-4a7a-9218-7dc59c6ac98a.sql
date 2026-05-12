-- Tōro · atomic legacy → canonical agent switch (migration 2 only; migration 1 skipped — toro_drafts not present here)

begin;

do $$
declare
  new_count int;
begin
  select count(*) into new_count
    from public.agent_prompts
   where agent_name in ('kid-money', 'term-planner', 'holiday-ideas')
     and pack = 'toro';

  if new_count < 3 then
    raise exception
      'Refusing to flip Tōro legacy agents: only % of 3 canonical replacements present in agent_prompts under pack=''toro''.',
      new_count;
  end if;
end $$;

update public.agent_prompts
   set pack = 'toro',
       updated_at = now()
 where pack = 'TORO'
   and agent_name in ('toro-health', 'toro-home', 'toro-homework');

update public.agent_prompts
   set is_active = false,
       updated_at = now()
 where pack = 'toro'
   and agent_name in (
     'toro',
     'toro-education',
     'toro-family',
     'toro-health',
     'toro-home',
     'toro-homework',
     'toro-logistics'
   )
   and is_active = true;

update public.agent_prompts
   set is_active = true,
       updated_at = now()
 where pack = 'toro'
   and agent_name in ('kid-money', 'term-planner', 'holiday-ideas')
   and is_active = false;

commit;