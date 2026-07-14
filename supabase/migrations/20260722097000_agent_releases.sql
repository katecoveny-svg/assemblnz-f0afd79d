-- Agent Definition Registry (Kate's Mistral-watch note, 2026-07-13).
--
-- Provider-neutral system of record for agent releases, in Assembl's OWN
-- database. Releases are immutable: (agent_id, version) is unique and rows
-- are never updated — a new version is a new row. content_hash makes tamper
-- detectable. RLS deny-all; access only via lib/os/agent-registry.ts.

create table if not exists public.agent_releases (
  id uuid primary key default gen_random_uuid(),
  agent_id text not null,
  version text not null,
  prompt_version text not null,
  skill_versions jsonb not null default '{}'::jsonb,
  genome_schema_version text not null,
  model_policy_version text not null,
  owner text not null,
  status text not null default 'draft',
  evaluation_score numeric(4, 3),
  definition jsonb not null,
  content_hash text not null,
  released_at timestamptz not null default now(),
  unique (agent_id, version)
);

do $$ begin
  alter table public.agent_releases
    add constraint agent_releases_status_check
    check (status in ('draft', 'production', 'retired'));
exception
  when duplicate_object then null;
end $$;

alter table public.agent_releases enable row level security;

create index if not exists agent_releases_agent_status_idx
  on public.agent_releases (agent_id, status, released_at desc);

-- Which agent release produced a task's result (beside the proof ledger).
alter table public.os_tasks
  add column if not exists agent_version text;

-- Seed the current OS agents as v1.0.0 governed production releases. The
-- content_hash values are computed by lib/os/agent-registry.ts' contentHash
-- over the same definitions, so verifyRelease() passes on read.
insert into public.agent_releases
  (agent_id, version, prompt_version, skill_versions, genome_schema_version,
   model_policy_version, owner, status, evaluation_score, definition, content_hash)
values
  ('desk', '1.0.0', '1',
   '{"draftEnquiryReply":"1","groundInConfirmedFacts":"1"}'::jsonb, '2', '1',
   'operations', 'production', null,
   '{"agentId":"desk","version":"1.0.0","promptVersion":"1","skillVersions":{"draftEnquiryReply":"1","groundInConfirmedFacts":"1"},"genomeSchemaVersion":"2","modelPolicyVersion":"1","owner":"operations","status":"production","role":"Customer communications","responsibilities":["answer enquiries from the Business Genome","draft replies for the owner to approve","never commit to prices, times or promises outside confirmed facts"],"capabilities":["read_genome","send_customer_email","create_task","suggest_genome_fact"],"evidenceRequirements":["model_call","draft","approval"],"evaluationScore":null}'::jsonb,
   '6d3ee29ce7753da4505baefc496bedc92c8df6803b62787cf9d12735fdc0f6ef'),
  ('operations', '1.0.0', '1',
   '{"triageBooking":"1"}'::jsonb, '2', '1',
   'operations', 'production', null,
   '{"agentId":"operations","version":"1.0.0","promptVersion":"1","skillVersions":{"triageBooking":"1"},"genomeSchemaVersion":"2","modelPolicyVersion":"1","owner":"operations","status":"production","role":"Bookings & delivery","responsibilities":["triage booking requests against the booking rules","keep the day runnable — flag conflicts before they bite"],"capabilities":["read_genome","create_task","create_calendar_event"],"evidenceRequirements":["record_change"],"evaluationScore":null}'::jsonb,
   '9e39bcea098b4529bdd8ae0e3f8602b9516fef7047e45809baf777b106e04b69'),
  ('knowledge', '1.0.0', '1',
   '{"proposeGenomeFact":"1","flagStaleFact":"1"}'::jsonb, '2', '1',
   'operations', 'production', null,
   '{"agentId":"knowledge","version":"1.0.0","promptVersion":"1","skillVersions":{"proposeGenomeFact":"1","flagStaleFact":"1"},"genomeSchemaVersion":"2","modelPolicyVersion":"1","owner":"operations","status":"production","role":"Institutional memory","responsibilities":["notice recurring questions and propose new genome facts","flag stale or conflicting facts for review"],"capabilities":["read_genome","search_knowledge","suggest_genome_fact","create_task"],"evidenceRequirements":["note"],"evaluationScore":null}'::jsonb,
   'a476b2dbc71c48b4adaeb74c40fdf546c2c8d000ca3b730ab87f246ca5194b23')
on conflict (agent_id, version) do nothing;
