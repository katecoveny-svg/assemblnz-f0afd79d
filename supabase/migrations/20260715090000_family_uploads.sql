-- Family Uploads + Vision — the upload/scan pipeline behind the Family OS demo.
--
-- A parent snaps a photo (a receipt, the inside of the fridge, a product, a
-- school newsletter — or a short video). The bytes land in a PRIVATE Storage
-- bucket; the family-vision edge function reads them, extracts what matters, and
-- proposes family_items. Everything is DRAFT-ONLY — nothing is bought, paid or
-- sent. A named adult approves in the ops console before it becomes a handoff.
--
-- Privacy posture (Privacy Act 2020 / IPP 3A — collecting information about
-- children): uploads may contain child data, so NONE of it leaves the tenant.
--   - The bucket is PRIVATE (public = false); there is NO anon/public read.
--   - Only the service role (the edge function + the Next server helper) can
--     read or write objects and rows.
--   - The family_uploads table has RLS enabled with NO policies — service-role
--     only, matching public.family_items and the family_inbox_* tables.
--   - A 30-day purge (below) deletes both the rows AND the underlying objects,
--     so nothing is retained longer than the demo needs it (data minimisation).
--
-- This migration adds:
--   1. the private 'family-uploads' Storage bucket (+ service-role-only RLS)
--   2. public.family_uploads   — one row per upload (status, trust, vision JSON)
--   3. a daily 30-day purge cron (rows + storage objects)
--
-- Fresh-apply safe: every statement is idempotent and guarded.

-- ── 1. Private Storage bucket ──────────────────────────────────────────────
-- PRIVATE (public = false) — child data must not be readable by anon. 30 MB cap
-- (images + pdf ≤ 15 MB, video ≤ 30 MB; the Next helper enforces the per-kind
-- limits) and a MIME allowlist as a defensive belt.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'family-uploads',
  'family-uploads',
  false,
  31457280,
  array[
    'image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif',
    'application/pdf',
    'video/mp4', 'video/quicktime', 'video/webm'
  ]
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Storage RLS — service role gets full access; NO anon/public read is granted
-- (deliberately: uploads may contain child data — Privacy Act 2020 / IPP 3A).
drop policy if exists "family-uploads service role all" on storage.objects;
create policy "family-uploads service role all"
  on storage.objects
  for all
  to service_role
  using (bucket_id = 'family-uploads')
  with check (bucket_id = 'family-uploads');

-- ── 2. family_uploads ──────────────────────────────────────────────────────
-- One row per upload. status walks processing → reviewed → done (or failed).
-- trust is the vision confidence A/B/C. vision holds the model's structured
-- read + reasoning. review defaults true — a human always eyeballs it.
create table if not exists public.family_uploads (
  id           uuid primary key default gen_random_uuid(),
  hub          text not null default 'demo',
  kind         text check (kind in ('receipt', 'fridge', 'product', 'newsletter', 'video')),
  storage_path text,
  uploaded_by  text,
  status       text default 'processing' check (status in ('processing', 'reviewed', 'done', 'failed')),
  trust        text check (trust in ('A', 'B', 'C')),
  summary      text,
  vision       jsonb default '{}'::jsonb,
  review       boolean not null default true,
  created_at   timestamptz default now()
);

comment on table public.family_uploads is
  'One row per Family OS upload (receipt/fridge/product/newsletter/video). Holds status, A/B/C trust score, a plain-English summary and the vision JSON. DRAFT-ONLY pipeline; child data never leaves the tenant. Service-role only (RLS, no policies). Purged after 30 days along with its storage object.';

comment on column public.family_uploads.trust is
  'Vision confidence: A = clear text / high-confidence extraction, B = partial / some uncertainty, C = unclear image / low confidence.';
comment on column public.family_uploads.review is
  'Always true — every upload waits on a named adult before anything it proposed becomes a handoff.';

create index if not exists family_uploads_hub_created_idx
  on public.family_uploads (hub, created_at desc);

alter table public.family_uploads enable row level security;

-- ── 3. 30-day purge (data hygiene) ─────────────────────────────────────────
-- Daily job that (a) deletes family_uploads rows older than 30 days and (b)
-- deletes the underlying storage objects. This is the data-minimisation control
-- for the Privacy Act posture: uploads (which may contain child data) are not
-- retained past the demo window. Idempotent + guarded, same style as the
-- family_inbox migration's cron block. Uses pg_cron directly (a plain SQL
-- delete, no edge round-trip needed).
do $$
begin
  if exists (select 1 from pg_extension where extname = 'pg_cron') then
    perform cron.unschedule('family-uploads-purge-30d')
      where exists (select 1 from cron.job where jobname = 'family-uploads-purge-30d');

    perform cron.schedule(
      'family-uploads-purge-30d',
      '17 3 * * *',
      $cmd$
        delete from storage.objects
          where bucket_id = 'family-uploads'
            and created_at < now() - interval '30 days';
        delete from public.family_uploads
          where created_at < now() - interval '30 days';
      $cmd$
    );

    raise notice 'family-uploads-purge-30d cron registered (daily 03:17)';
  else
    raise notice 'pg_cron not enabled — schedule family-uploads-purge-30d daily via the Supabase dashboard';
  end if;
exception when others then
  raise notice 'family-uploads-purge-30d cron registration skipped: %', sqlerrm;
end;
$$;
