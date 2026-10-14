-- REJECTED / NOT ACTIVATION-READY. Historical evidence only.
-- PROPOSAL ONLY; bucket must be private, created/reviewed separately. No uploads enabled.
-- Deliberately no INSERT/UPDATE/DELETE policy. Stage1 supports no production media.
create policy studio_selected_media_read on storage.objects for select to authenticated using (
 bucket_id='studio-private' and exists (
  select 1 from public.studio_snapshot_media m where m.object_path=storage.objects.name
  and (m.owner_user_id=(select auth.uid()) or exists (
   select 1 from public.studio_recipient_grants g where g.snapshot_id=m.snapshot_id
   and g.recipient_user_id=(select auth.uid()) and g.status='active' and g.expires_at>now()
  ))
 )
);
