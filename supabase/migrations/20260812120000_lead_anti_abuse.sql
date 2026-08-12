-- ============================================================================
-- Anti-abuso sui moduli pubblici
--
-- La policy `leads_public_insert` accetta insert anonime da chiunque, purché
-- con `consent = true`: è corretto, perché i moduli del sito non hanno un
-- backend proprio. Ma senza altri limiti chiunque può chiamare direttamente
-- l'endpoint REST e riempire la tabella — verificato: otto POST consecutivi
-- passavano tutti.
--
-- Un honeypot nel modulo non risolve: chi attacca l'API non carica il sito e
-- non vede nemmeno il campo. Il limite deve stare qui, dove passano *tutte*
-- le scritture, comunque arrivino.
--
-- Due soglie, per motivi diversi:
--   • per indirizzo IP  → argina il flood automatico;
--   • per e-mail        → argina il rinvio ossessivo dello stesso modulo.
--
-- La soglia per IP è volutamente larga (10/ora). Dietro un NAT aziendale o la
-- CGNAT di un operatore mobile decine di utenti legittimi condividono lo
-- stesso indirizzo: stringere troppo bloccherebbe clienti veri, che è un
-- danno peggiore di qualche riga di spam.
--
-- Applicare con:  supabase db push      (oppure incollare nel SQL Editor)
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Pepper per la pseudonimizzazione degli IP
--
-- Senza un segreto, l'hash di un indirizzo IPv4 si rompe per forza bruta in
-- pochi minuti: lo spazio è di soli 2^32 valori. Il pepper è generato una
-- volta sola e non esce mai dal database — la tabella ha RLS attiva e nessuna
-- policy, quindi né `anon` né `authenticated` possono leggerla; ci arriva solo
-- la funzione, che è SECURITY DEFINER.
-- ---------------------------------------------------------------------------
create table if not exists public.security_config (
  key   text primary key,
  value text not null
);

alter table public.security_config enable row level security;
revoke all on public.security_config from anon, authenticated;

insert into public.security_config (key, value)
values ('lead_hash_pepper', gen_random_uuid()::text || gen_random_uuid()::text)
on conflict (key) do nothing;

-- ---------------------------------------------------------------------------
-- Registro delle sottomissioni
--
-- Contiene solo un digest e un istante: nessun indirizzo in chiaro, nessun
-- collegamento alla riga di `leads`. Serve a contare, non a profilare, e si
-- autopulisce dopo due giorni.
-- ---------------------------------------------------------------------------
create table if not exists public.lead_submission_log (
  id          bigint generated always as identity primary key,
  client_hash text not null,
  created_at  timestamptz not null default now()
);

create index if not exists lead_submission_log_lookup_idx
  on public.lead_submission_log (client_hash, created_at desc);

alter table public.lead_submission_log enable row level security;
revoke all on public.lead_submission_log from anon, authenticated;

-- ---------------------------------------------------------------------------
-- Il controllo vero
-- ---------------------------------------------------------------------------
create or replace function public.enforce_lead_rate_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_forwarded   text;
  v_ip          text;
  v_pepper      text;
  v_hash        text;
  v_ip_count    integer;
  v_email_count integer;
begin
  -- PostgREST espone gli header della richiesta come GUC. Con `true` la
  -- current_setting non solleva se il GUC non esiste: succede quando la insert
  -- arriva dal SQL Editor o da uno script, dove il limite per IP non si applica.
  v_forwarded := current_setting('request.headers', true)::json ->> 'x-forwarded-for';
  v_ip := nullif(btrim(split_part(coalesce(v_forwarded, ''), ',', 1)), '');

  -- Limite per e-mail: vale sempre, anche senza IP disponibile.
  select count(*) into v_email_count
    from public.leads
   where lower(email) = lower(new.email)
     and created_at > now() - interval '1 hour';

  if v_email_count >= 3 then
    raise exception 'LEAD_RATE_LIMIT: troppe richieste da questo indirizzo e-mail'
      using errcode = 'P0001';
  end if;

  if v_ip is not null then
    select value into v_pepper from public.security_config where key = 'lead_hash_pepper';
    -- sha256() è nel core di Postgres: non dipende da pgcrypto, che su Supabase
    -- vive nello schema `extensions` e non sarebbe nel search_path.
    v_hash := encode(sha256(convert_to(v_ip || coalesce(v_pepper, ''), 'utf8')), 'hex');

    select count(*) into v_ip_count
      from public.lead_submission_log l
     where l.client_hash = v_hash
       and l.created_at > now() - interval '1 hour';

    if v_ip_count >= 10 then
      raise exception 'LEAD_RATE_LIMIT: troppe richieste da questa connessione'
        using errcode = 'P0001';
    end if;

    insert into public.lead_submission_log (client_hash) values (v_hash);

    -- Pulizia opportunistica: evita un job schedulato per una tabella che
    -- resta comunque piccola. Costa una delete su indice ogni tanto.
    if random() < 0.02 then
      delete from public.lead_submission_log where created_at < now() - interval '2 days';
    end if;
  end if;

  return new;
end;
$$;

revoke all on function public.enforce_lead_rate_limit() from public;

drop trigger if exists leads_rate_limit on public.leads;
create trigger leads_rate_limit
  before insert on public.leads
  for each row execute function public.enforce_lead_rate_limit();

comment on table public.lead_submission_log is
  'Conteggio anti-abuso delle sottomissioni: solo digest con pepper e istante, purgato dopo 48 ore.';
comment on table public.security_config is
  'Segreti interni al database (pepper per la pseudonimizzazione). Nessuna policy: illeggibile dai client.';
