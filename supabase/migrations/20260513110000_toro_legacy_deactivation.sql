-- Tōro · atomic legacy → canonical agent switch.
--
-- Source of truth (canonical agents from 2026-05-12 launch bundle):
--   github.com/katecoveny-svg/assembl-plugins @ commit 3696629
--   (HEAD of `main` as of 2026-05-12. PRs #1 + #2 merged: tikanga
--   four-pou naming + legacy toro/ stub removal.)
--
-- Three canonical agents under pack=toro:
--   - term-planner    (newsletter intake → typed actions)
--   - kid-money       (chores + photo proof + three-jar split)
--   - holiday-ideas   (NZ school-holiday planning, ships Term 2 holidays)
--
-- Disposition for the seven legacy toro-* agents (Cowork traffic check
-- against assembl-prod, 2026-05-13):
--   - routing_log has 3 rows total, all between 3 May and 6 May
--   - zero dispatches in the last 14 days
--   - selected_agent query returned empty
--   - the chat surface was unreachable from the live site (auth bug
--     fixed today); no users to break
--   ⇒ clean cut, no 30-day deprecation period.
--
-- What this migration does (single transaction):
--   1. Safety check — refuses to proceed if all three canonical
--      replacements aren't present in agent_prompts.
--   2. Normalises pack name: `'TORO'` → `'toro'` on the three rows
--      that drifted (toro-health, toro-home, toro-homework). Lowercase
--      kebab is the canon per assembl-plugins.
--   3. Deactivates the seven legacy toro-* agents (`is_active=false`).
--      Rows preserved — never deleted — so the audit chain stays
--      readable and we can revive any of them if a use case re-emerges.
--   4. Activates the three canonical replacements
--      (kid-money, term-planner, holiday-ideas).
--
-- Iho routing config:
--   No edge-function code references the legacy slugs (verified via
--   repo-wide grep, 2026-05-13). The router resolves toro pack agents
--   from agent_prompts at runtime via _shared/load-cached-plugin.ts,
--   so this DB-only flip is the full routing update. The within-toro
--   intent → agent mapping is implicit (each canonical agent owns its
--   own intent class: term-planner = school comms, kid-money = chores
--   + allowance, holiday-ideas = NZ school holidays).
--
-- Idempotent: every UPDATE is guarded so safe to re-run.

begin;

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. Safety: refuse to proceed without all three canonical replacements.
-- This prevents a footgun where the migration deactivates legacy agents
-- in an env where the new three were never registered.
-- ─────────────────────────────────────────────────────────────────────────────

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
      'Refusing to flip Tōro legacy agents: only % of 3 canonical replacements present in agent_prompts under pack=''toro''. Register the new agents first per assembl-plugins commit 3696629.',
      new_count;
  end if;
end $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. Pack-name normalisation. The toro-health / toro-home / toro-homework
-- rows were inserted under pack='TORO' (migration 20260424071854) — a drift
-- from the lowercase-kebab convention used everywhere else. Bring them in line
-- so dashboards and look-ups don't need to UNION across casings.
-- ─────────────────────────────────────────────────────────────────────────────

update public.agent_prompts
   set pack = 'toro',
       updated_at = now()
 where pack = 'TORO'
   and agent_name in ('toro-health', 'toro-home', 'toro-homework');

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. Deactivate the seven legacy toro-* agents. Rows preserved.
-- ─────────────────────────────────────────────────────────────────────────────

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

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. Activate the three canonical replacements.
--
-- Note re. term-planner runtime readiness: the agentmail-inbound edge
-- function (this same PR) is the runtime half. Term Planner is usable as
-- soon as that function is deployed + AGENTMAIL_WEBHOOK_SECRET is set;
-- flipping is_active=true here is the registry signal that it's the
-- canonical school-comms agent regardless of deploy state. The function
-- fails closed if the secret is missing, so there's no risk of a half-
-- live agent silently dropping inbound mail.
-- ─────────────────────────────────────────────────────────────────────────────

update public.agent_prompts
   set is_active = true,
       updated_at = now()
 where pack = 'toro'
   and agent_name in ('kid-money', 'term-planner', 'holiday-ideas')
   and is_active = false;

commit;
