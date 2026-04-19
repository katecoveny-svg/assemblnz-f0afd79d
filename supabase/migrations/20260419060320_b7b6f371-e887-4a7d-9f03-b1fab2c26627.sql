-- Tag relevant cross sources for kete that currently have 0 specific sources
-- so live status strips reflect actual governance coverage.

-- AUAHA (creative): inherits Privacy/IP/Commerce/Fair Trading sources
UPDATE public.kb_sources
SET agent_packs = array_append(agent_packs, 'auaha')
WHERE active
  AND NOT ('auaha' = ANY(agent_packs))
  AND name IN (
    'Privacy Commissioner — News',
    'NZ Gazette — Latest notices',
    'NZ Parliament — Bills RSS',
    'Beehive — Government releases',
    'RNZ — Top stories'
  );

-- AKO (education): privacy + government + stats + ECE/training relevance
UPDATE public.kb_sources
SET agent_packs = array_append(agent_packs, 'ako')
WHERE active
  AND NOT ('ako' = ANY(agent_packs))
  AND name IN (
    'Privacy Commissioner — News',
    'NZ Gazette — Latest notices',
    'NZ Parliament — Bills RSS',
    'Beehive — Government releases'
  );

-- HOKO (retail): consumer law + privacy + commerce + IRD
UPDATE public.kb_sources
SET agent_packs = array_append(agent_packs, 'hoko')
WHERE active
  AND NOT ('hoko' = ANY(agent_packs))
  AND name IN (
    'Privacy Commissioner — News',
    'IRD — Tax Information Bulletin',
    'NZ Parliament — Bills RSS',
    'Beehive — Government releases',
    'NZ Gazette — Latest notices'
  );