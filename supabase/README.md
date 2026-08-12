# Supabase — creazione e configurazione del progetto

Tutto ciò che serve per passare dal sito "vuoto" a un portale funzionante:
database, autenticazione dell'area riservata, storage delle foto.

```
supabase/
├── migrations/
│   ├── 20260808120000_init.sql      tabelle, enum, RLS, funzione is_admin()
│   └── 20260808120100_storage.sql   bucket property-media + policy
├── seed.sql                          4 schede DIMOSTRATIVE (solo per sviluppo)
└── README.md                         questo file
```

---

## 1. Creare il progetto

1. Accedi a <https://supabase.com/dashboard> e crea un nuovo progetto.
   - **Name**: `ianes-immobilien`
   - **Region**: `Central EU (Frankfurt)` — i dati restano nell'Unione europea,
     coerentemente con quanto dichiarato nell'informativa privacy.
   - **Database password**: generala e conservala nel password manager.
2. Attendi il provisioning (1–2 minuti).

## 2. Applicare le migration

### Opzione A — dashboard (nessuno strumento da installare)

SQL Editor → New query → incolla il contenuto di
`migrations/20260808120000_init.sql` → **Run**.
Ripeti con `migrations/20260808120100_storage.sql`, **in quest'ordine**
(la seconda usa la funzione `is_admin()` creata dalla prima).

### Opzione B — Supabase CLI (consigliata, versiona le modifiche)

```bash
npm install -g supabase
supabase login
supabase link --project-ref <project-ref>   # lo trovi nell'URL della dashboard
supabase db push
```

Verifica: Table Editor deve mostrare `properties`, `leads`, `admin_users`,
tutte con il lucchetto **RLS enabled**.

## 3. Creare l'utente amministratore

L'app non registra utenti: gli account si creano dalla dashboard.

1. Authentication → Users → **Add user** → *Create new user*.
   - Email dello staff, password iniziale, **Auto Confirm User: sì**.
2. Copia l'`UID` dell'utente appena creato.
3. SQL Editor:

```sql
insert into public.admin_users (user_id, email, full_name)
values ('INCOLLA-QUI-L-UID', 'nome@ianesimmobilien.it', 'Nome Cognome');
```

Senza questa riga l'utente riesce ad autenticarsi ma **non** vede né modifica
nulla: le policy di scrittura passano da `is_admin()`, che legge questa tabella.
È il comportamento voluto — l'autorizzazione sta nel database, non nel browser.

Per revocare l'accesso:

```sql
delete from public.admin_users where email = 'nome@ianesimmobilien.it';
```

Consigliato: Authentication → Providers → Email → disattivare **Enable sign-ups**,
così nessuno può crearsi un account da solo.

## 4. Collegare il sito

Project Settings → API → copia `Project URL` e `anon public`:

```bash
# .env.local
NEXT_PUBLIC_SITE_URL=https://www.ianesimmobilien.it
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
```

L'anon key è pubblica per definizione: è protetta dalla RLS, non dalla segretezza.
La **service role key non va mai** messa in una variabile `NEXT_PUBLIC_*` né usata
dal sito: aggira ogni policy.

Riavvia `npm run dev` e apri `/it/admin`: comparirà il form di accesso.

## 5. Dati dimostrativi (facoltativo, solo in sviluppo)

```bash
psql "$DATABASE_URL" -f supabase/seed.sql
# oppure: incolla seed.sql nel SQL Editor
```

Inserisce 4 schede fittizie con riferimento `DEMO-…` e immagini da `/demo`.
Per rimuoverle:

```sql
delete from public.properties where reference like 'DEMO-%';
```

---

## Schema in breve

| Tabella | Contenuto | Chi legge | Chi scrive |
| --- | --- | --- | --- |
| `properties` | Schede immobile; testi tradotti in `content` JSONB | Tutti, solo `published = true` | Solo `admin_users` |
| `leads` | Richieste da contatti, valutazione, brochure, newsletter | Solo `admin_users` | Chiunque, **solo con `consent = true`** |
| `admin_users` | Allowlist di chi può gestire il portale | Solo se stessi | Solo dalla dashboard |

Storage: bucket `property-media`, lettura pubblica, scrittura riservata agli admin.

### Note sul modello dati

- I testi per lingua stanno in `content` come `{"it": {...}, "de": {...}, "en": {...}}`:
  aggiungere una lingua non richiede una migrazione.
- `published` separa la bozza dalla pubblicazione. Un immobile pubblicato deve
  avere almeno il titolo italiano: lo impone un CHECK, non solo il form.
- Il consenso privacy è un vincolo della policy di insert su `leads`: una
  richiesta senza consenso viene rifiutata dal database.
- `updated_at` è gestito da trigger, non dall'applicazione.

## Backup e ripristino

Supabase esegue backup giornalieri automatici (piano Pro).
Export manuale prima di interventi importanti:

```bash
supabase db dump --file backup-$(date +%F).sql
```
