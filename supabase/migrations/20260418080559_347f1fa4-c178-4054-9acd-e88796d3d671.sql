-- Canonical pack-slug migration
-- Map legacy pack slugs (hanga, waka, logistics) onto canonical industry kete
-- (waihanga, arataki, pikau) so agent-router lookups match landing-page claims.

-- WAIHANGA (Construction): move 8 hanga agents into waihanga.
-- The waihanga pack already has its own ARC; deactivate the duplicate "arc"
-- from hanga to avoid two ARC records under the same pack.
UPDATE public.agent_prompts SET is_active = false
 WHERE pack = 'hanga' AND agent_name = 'arc';

UPDATE public.agent_prompts
   SET pack = 'waihanga', updated_at = now()
 WHERE pack = 'hanga'
   AND agent_name IN ('arai','ata','kaupapa','pai','pinnacle','rawa','terra','whakaae');

-- ARATAKI (Automotive): bring FORGE (motor) and TRANSIT under arataki.
-- The duplicate lowercase 'mariner' under waka conflicts with pikau MARINER.
UPDATE public.agent_prompts SET is_active = false
 WHERE pack = 'waka' AND agent_name = 'mariner';

UPDATE public.agent_prompts
   SET pack = 'arataki', updated_at = now()
 WHERE pack = 'waka' AND agent_name IN ('motor','transit');

-- PIKAU (Freight & Customs): bring FLUX and HAVEN logistics agents under pikau.
UPDATE public.agent_prompts
   SET pack = 'pikau', updated_at = now()
 WHERE pack = 'logistics' AND agent_name IN ('FLUX','HAVEN');