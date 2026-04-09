-- AAAIP — extend audit export domain check to allow the new industry Kete pilots
-- Canonical Kete names from KeteConfig.ts + live Assembl marketing site:
--   waihanga (construction), pikau (freight & customs),
--   manaaki (hospitality), auaha (creative), toro (whānau family navigator)

ALTER TABLE public.aaaip_audit_exports
  DROP CONSTRAINT IF EXISTS aaaip_audit_exports_domain_check;

ALTER TABLE public.aaaip_audit_exports
  ADD CONSTRAINT aaaip_audit_exports_domain_check
  CHECK (domain IN (
    'clinic',
    'robot',
    'science',
    'community',
    'waihanga',
    'pikau',
    'manaaki',
    'auaha',
    'toro'
  ));
