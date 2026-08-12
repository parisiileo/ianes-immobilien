-- ============================================================================
-- Informazioni legali dell'annuncio e diagnosi delle emissioni
--
-- Aggiunge alla scheda immobile i dati che l'annuncio deve riportare accanto
-- al prezzo (condominio, procedure in corso, a chi tocca la provvigione) e la
-- seconda metà della diagnosi energetica: le emissioni di gas serra, che sono
-- un indicatore distinto dal fabbisogno — un immobile può consumare poco e
-- continuare a emettere molto, per esempio se è riscaldato a gasolio.
--
-- Tutte le colonne hanno un default, così le schede già inserite restano
-- valide: il default di `co_ownership` e `co_ownership_proceedings` è `false`,
-- cioè la risposta prudente, e va verificato scheda per scheda.
--
-- Applicare con:  supabase db push      (oppure incollare nel SQL Editor)
-- ============================================================================

do $$ begin
  create type public.fees_payable_by as enum ('buyer', 'seller', 'shared');
exception when duplicate_object then null; end $$;

alter table public.properties
  add column if not exists emissions_class public.energy_class,
  add column if not exists emissions_index numeric(6, 2) check (emissions_index >= 0),
  add column if not exists co_ownership boolean not null default false,
  add column if not exists co_ownership_proceedings boolean not null default false,
  add column if not exists fees_payable_by public.fees_payable_by not null default 'buyer';

-- Una procedura in corso presuppone che l'immobile sia in condominio.
alter table public.properties
  drop constraint if exists properties_proceedings_need_co_ownership;
alter table public.properties
  add constraint properties_proceedings_need_co_ownership
  check (co_ownership_proceedings = false or co_ownership = true);

comment on column public.properties.emissions_class is
  'Classe delle emissioni di gas serra riportata sull''APE.';
comment on column public.properties.emissions_index is
  'Emissioni in kg CO2 per m2 all''anno.';
comment on column public.properties.co_ownership is
  'L''immobile fa parte di un condominio.';
comment on column public.properties.co_ownership_proceedings is
  'Procedure in corso a carico del condominio (art. 63 disp. att. c.c.).';
comment on column public.properties.fees_payable_by is
  'Su chi grava la provvigione di mediazione.';
