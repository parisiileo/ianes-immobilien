-- ============================================================================
-- Ianes Immobilien — schema iniziale
--
-- Crea:
--   • enum di dominio (tipo contratto, stato, categoria, classe energetica…)
--   • tabella `properties`      → schede immobile, testi multilingua in JSONB
--   • tabella `admin_users`     → allowlist di chi può scrivere
--   • tabella `leads`           → richieste dai form pubblici
--   • funzione `is_admin()`     → usata da tutte le policy di scrittura
--   • RLS su tutte le tabelle   → il sito pubblico legge solo ciò che è pubblicato
--
-- Applicare con:  supabase db push      (oppure incollare nel SQL Editor)
-- ============================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Tipi di dominio
-- ---------------------------------------------------------------------------
do $$ begin
  create type public.listing_type as enum ('sale', 'rent');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.property_status as enum ('available', 'reserved', 'sold');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.property_category as enum ('villa', 'penthouse', 'chalet', 'apartment', 'estate', 'hotel');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.energy_class as enum ('A4', 'A3', 'A2', 'A1', 'A', 'B', 'C', 'D', 'E', 'F', 'G');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.heating_type as enum ('autonomous', 'centralized', 'heatPump', 'underfloor', 'districtHeating', 'geothermal');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.lead_kind as enum ('contact', 'valuation', 'brochure', 'newsletter');
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------------------
-- Allowlist amministratori
--
-- L'utente si crea in Authentication → Users; poi si inserisce qui il suo id.
-- La funzione è SECURITY DEFINER così le policy possono interrogarla senza
-- che l'utente abbia bisogno del permesso di leggere la tabella.
-- ---------------------------------------------------------------------------
create table if not exists public.admin_users (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  email      text,
  full_name  text,
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admin_users a where a.user_id = auth.uid()
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Immobili
--
-- I campi tradotti (titolo, sottotitolo, descrizione, meta description, punti
-- di forza) vivono in `content` come JSONB {"it": {...}, "de": {...}, "en": {...}}:
-- aggiungere una lingua non richiede una migrazione, e l'app legge un oggetto
-- solo invece di fare join su una tabella di traduzioni.
-- ---------------------------------------------------------------------------
create table if not exists public.properties (
  id                uuid primary key default gen_random_uuid(),
  slug              text not null unique,
  reference         text not null unique,

  listing_type      public.listing_type     not null default 'sale',
  status            public.property_status  not null default 'available',
  category          public.property_category not null default 'villa',

  -- `published = false` → visibile solo nell'area riservata
  published         boolean not null default false,
  featured          boolean not null default false,

  price             numeric(12, 2) not null default 0 check (price >= 0),
  price_on_request  boolean not null default false,

  surface_sqm       integer not null default 0 check (surface_sqm >= 0),
  lot_sqm           integer check (lot_sqm >= 0),
  rooms             integer not null default 0 check (rooms >= 0),
  bedrooms          integer not null default 0 check (bedrooms >= 0),
  bathrooms         integer not null default 0 check (bathrooms >= 0),
  floor             text,
  floors            integer check (floors >= 0),

  energy_class      public.energy_class not null default 'A2',
  energy_index      numeric(6, 2) check (energy_index >= 0),
  heating           public.heating_type not null default 'heatPump',
  construction_year integer check (construction_year between 1000 and 2200),
  renovation_year   integer check (renovation_year between 1000 and 2200),

  amenities         text[] not null default '{}',

  address           text not null default '',
  city              text not null default '',
  province          text not null default '',
  postal_code       text not null default '',
  zone              text,
  lat               double precision check (lat between -90 and 90),
  lng               double precision check (lng between -180 and 180),

  images            jsonb not null default '[]'::jsonb,
  floor_plans       jsonb not null default '[]'::jsonb,
  model_url         text,
  massing           jsonb not null default '[]'::jsonb,
  hotspots          jsonb not null default '[]'::jsonb,
  content           jsonb not null default '{}'::jsonb,

  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  created_by        uuid references auth.users (id) on delete set null,

  constraint properties_images_is_array      check (jsonb_typeof(images) = 'array'),
  constraint properties_floor_plans_is_array check (jsonb_typeof(floor_plans) = 'array'),
  constraint properties_massing_is_array     check (jsonb_typeof(massing) = 'array'),
  constraint properties_hotspots_is_array    check (jsonb_typeof(hotspots) = 'array'),
  constraint properties_content_is_object    check (jsonb_typeof(content) = 'object'),
  -- Un immobile pubblicato deve avere almeno il titolo italiano.
  constraint properties_published_needs_title check (
    published = false
    or coalesce(nullif(content -> 'it' ->> 'title', ''), null) is not null
  )
);

create index if not exists properties_published_idx on public.properties (published) where published;
create index if not exists properties_listing_type_idx on public.properties (listing_type);
create index if not exists properties_category_idx on public.properties (category);
create index if not exists properties_city_idx on public.properties (city);
create index if not exists properties_price_idx on public.properties (price);
create index if not exists properties_featured_idx on public.properties (featured) where featured;
create index if not exists properties_amenities_idx on public.properties using gin (amenities);
create index if not exists properties_content_idx on public.properties using gin (content jsonb_path_ops);

-- updated_at automatico
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists properties_touch_updated_at on public.properties;
create trigger properties_touch_updated_at
  before update on public.properties
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- Richieste dai form pubblici (contatti, valutazione, brochure, newsletter)
-- ---------------------------------------------------------------------------
create table if not exists public.leads (
  id                 uuid primary key default gen_random_uuid(),
  kind               public.lead_kind not null,
  name               text,
  email              text not null,
  phone              text,
  subject            text,
  message            text,
  locale             text not null default 'it' check (locale in ('it', 'de', 'en')),
  property_id        uuid references public.properties (id) on delete set null,
  property_reference text,
  payload            jsonb not null default '{}'::jsonb,
  -- Prova del consenso al trattamento: senza, la riga non entra (vedi policy).
  consent            boolean not null default false,
  handled            boolean not null default false,
  created_at         timestamptz not null default now(),

  constraint leads_email_shape check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]{2,}$')
);

create index if not exists leads_created_at_idx on public.leads (created_at desc);
create index if not exists leads_kind_idx on public.leads (kind);
create index if not exists leads_handled_idx on public.leads (handled) where not handled;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.properties  enable row level security;
alter table public.admin_users enable row level security;
alter table public.leads       enable row level security;

-- properties -----------------------------------------------------------------
drop policy if exists "properties_public_read" on public.properties;
create policy "properties_public_read"
  on public.properties for select
  to anon, authenticated
  using (published = true);

drop policy if exists "properties_admin_read" on public.properties;
create policy "properties_admin_read"
  on public.properties for select
  to authenticated
  using (public.is_admin());

drop policy if exists "properties_admin_insert" on public.properties;
create policy "properties_admin_insert"
  on public.properties for insert
  to authenticated
  with check (public.is_admin());

drop policy if exists "properties_admin_update" on public.properties;
create policy "properties_admin_update"
  on public.properties for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "properties_admin_delete" on public.properties;
create policy "properties_admin_delete"
  on public.properties for delete
  to authenticated
  using (public.is_admin());

-- admin_users ----------------------------------------------------------------
-- Ogni admin vede la propria riga; la gestione dell'allowlist si fa dalla
-- dashboard Supabase (o con la service role key), mai dal browser.
drop policy if exists "admin_users_self_read" on public.admin_users;
create policy "admin_users_self_read"
  on public.admin_users for select
  to authenticated
  using (user_id = auth.uid());

-- leads ----------------------------------------------------------------------
drop policy if exists "leads_public_insert" on public.leads;
create policy "leads_public_insert"
  on public.leads for insert
  to anon, authenticated
  with check (consent = true and handled = false);

drop policy if exists "leads_admin_read" on public.leads;
create policy "leads_admin_read"
  on public.leads for select
  to authenticated
  using (public.is_admin());

drop policy if exists "leads_admin_update" on public.leads;
create policy "leads_admin_update"
  on public.leads for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "leads_admin_delete" on public.leads;
create policy "leads_admin_delete"
  on public.leads for delete
  to authenticated
  using (public.is_admin());

-- ---------------------------------------------------------------------------
-- Grant di base (le policy restano il vero filtro)
-- ---------------------------------------------------------------------------
grant usage on schema public to anon, authenticated;
grant select on public.properties to anon, authenticated;
grant insert, update, delete on public.properties to authenticated;
grant insert on public.leads to anon, authenticated;
grant select, update, delete on public.leads to authenticated;
grant select on public.admin_users to authenticated;
