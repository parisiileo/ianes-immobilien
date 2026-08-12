-- ============================================================================
-- Rimozione del visualizzatore 3D
--
-- Il modello tridimensionale schematico è stato tolto dal sito: le colonne che
-- lo alimentavano non servono più. `if exists` rende la migration sicura sia
-- sui progetti dove la 20260808120000_init.sql è già stata applicata sia su
-- quelli creati da zero dopo questa modifica.
--
-- Le planimetrie (`floor_plans`) restano: sono l'unica rappresentazione degli
-- spazi rimasta sulla scheda immobile.
-- ============================================================================

alter table public.properties
  drop column if exists massing,
  drop column if exists hotspots,
  drop column if exists model_url;

-- Il bucket dei media resta, ma i tipi MIME dei modelli 3D non servono più.
update storage.buckets
set allowed_mime_types = array[
  'image/jpeg', 'image/png', 'image/webp', 'image/avif',
  'application/pdf'
]
where id = 'property-media';
