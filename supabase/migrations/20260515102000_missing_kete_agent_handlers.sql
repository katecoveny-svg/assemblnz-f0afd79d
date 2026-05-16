-- Wire missing industry kete to bespoke five-layer agent endpoints.
-- These rows may already exist from the canonical registry migration; this is
-- deliberately narrow and only assigns handler functions.

update public.kete_definitions
   set handler_fn = 'agent-ako',
       updated_at = now()
 where slug = 'ako';

update public.kete_definitions
   set handler_fn = 'agent-matauranga',
       updated_at = now()
 where slug = 'matauranga';

update public.kete_definitions
   set handler_fn = 'agent-hoko',
       updated_at = now()
 where slug = 'hoko';
