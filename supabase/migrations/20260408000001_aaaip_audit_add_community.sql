-- AAAIP — extend audit export domain check to allow `community`
-- Pilot 04 (community portal moderation) submits audit logs with
-- domain = 'community'. Update the CHECK constraint without
-- losing existing rows.

ALTER TABLE public.aaaip_audit_exports
  DROP CONSTRAINT IF EXISTS aaaip_audit_exports_domain_check;

ALTER TABLE public.aaaip_audit_exports
  ADD CONSTRAINT aaaip_audit_exports_domain_check
  CHECK (domain IN ('clinic', 'robot', 'science', 'community'));
