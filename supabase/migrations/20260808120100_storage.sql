-- ============================================================================
-- Storage: bucket per foto, planimetrie e modelli 3D degli immobili.
--
-- Lettura pubblica (le immagini finiscono negli annunci e nelle card social),
-- scrittura riservata agli utenti presenti in `admin_users`.
-- ============================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'property-media',
  'property-media',
  true,
  52428800, -- 50 MB: copre foto ad alta risoluzione e modelli .glb
  array[
    'image/jpeg', 'image/png', 'image/webp', 'image/avif',
    'application/pdf',
    'model/gltf-binary', 'model/gltf+json', 'application/octet-stream'
  ]
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "property_media_public_read" on storage.objects;
create policy "property_media_public_read"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'property-media');

drop policy if exists "property_media_admin_insert" on storage.objects;
create policy "property_media_admin_insert"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'property-media' and public.is_admin());

drop policy if exists "property_media_admin_update" on storage.objects;
create policy "property_media_admin_update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'property-media' and public.is_admin())
  with check (bucket_id = 'property-media' and public.is_admin());

drop policy if exists "property_media_admin_delete" on storage.objects;
create policy "property_media_admin_delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'property-media' and public.is_admin());
