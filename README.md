# Ianes Immobilien — portale immobiliare di lusso

Sito trilingue (IT / DE / EN) per **IMMOBIL IANES S.R.L.**, con vetrina immobili,
mappa interattiva, area riservata su Supabase e generatore di brochure PDF.

```bash
npm install
cp .env.example .env.local     # poi compilare con i dati del progetto Supabase
npm run dev                    # http://localhost:3000
npm run build                  # NON lanciarla mentre il dev server gira
npm run lint
```

> Su Windows `next dev` e `next build` scrivono entrambi in `.next`: eseguirli
> insieme corrompe la cartella. Fermare il dev server prima della build.

Il sito funziona anche **senza** Supabase configurato:

- in sviluppo mostra 5 schede dimostrative (`src/data/demo-properties.ts`,
  riferimenti `DEMO-…`) per poter guardare subito le pagine popolate;
- in produzione mostra gli empty state — un deploy senza database non
  pubblica mai contenuti inventati;
- l'area riservata spiega quali variabili d'ambiente mancano.

## → Configurazione Supabase

Procedura completa in **[supabase/README.md](supabase/README.md)**: creazione del
progetto, migration, utente amministratore, storage, variabili d'ambiente.

---

## Stack

| Ambito | Scelta |
| --- | --- |
| Framework | Next.js 15 (App Router, Turbopack) + React 19 |
| Stili | Tailwind CSS v4 light mode (`@theme` in `src/app/globals.css`) |
| Animazioni | GSAP 3.15 (ScrollTrigger, SplitText, Flip) + Lenis |
| Dati e auth | Supabase (Postgres + RLS, Auth email/password, Storage) |
| PDF | jsPDF (generazione interamente client-side) |
| Icone | lucide-react |

A runtime il sito non chiama servizi di terze parti: font serviti da `next/font`,
mappa disegnata in SVG, card social generate con `ImageResponse`. Le uniche
chiamate esterne sono verso il progetto Supabase del cliente. Questo mantiene il banner cookie onesto: senza consenso non parte nulla.

---

## Struttura

```
src/
├── app/
│   ├── [locale]/                 ← root layout: <html lang>, header, footer, banner
│   │   ├── page.tsx              ← home
│   │   ├── proprieta/            ← listing (split view) + [slug] scheda immobile
│   │   ├── chi-siamo | contatti | valutazione
│   │   ├── privacy-policy | cookie-policy | termini-e-condizioni
│   │   ├── admin/                ← area riservata (Supabase Auth)
│   │   └── opengraph-image.tsx   ← card social generata dal marchio
│   ├── robots.ts  sitemap.ts     ← generati, multilingua
│   └── globals.css               ← design system
├── components/
│   ├── layout/   header, footer, cookie banner, smooth scroll, page header
│   ├── home/     hero, showcase espansiva, collezione orizzontale, rating…
│   ├── property/ card, galleria, mappa SVG, modale brochure, cover fallback
│   ├── search/   modulo di ricerca + pannello filtri full-screen
│   ├── admin/    login, elenco, form immobile, uploader media
│   └── ui/       Select custom, RangeSlider, Checkbox/Chip, SplitReveal
├── data/legal.ts                 testi di privacy, cookie policy e termini
├── i18n/                         config, dizionari it/de/en, LocaleProvider
├── lib/
│   ├── supabase/                 client browser, client server, env
│   ├── properties/               query pubbliche, CRUD admin, mapper riga ⇄ tipo
│   ├── leads.ts                  invio dei form nella tabella `leads`
│   └── seo, jsonld, brochure, filters, format, consent, gsap
└── types/property.ts
supabase/                         migration, seed dimostrativo, guida
```

---

## Design system

Light mode: fondo bianco caldo `--color-surface`, testo `--color-ink`, oro
brunito come unico accento. I token sono semantici, non descrittivi del colore.

Tre regole che spiegano quasi tutte le scelte di classe:

1. **I pannelli sospesi sono opachi** (`.panel`), mai vetro: una tendina
   traslucida sopra testo o fotografie diventa illeggibile.
2. **Il testo sopra le fotografie è chiaro** (`text-white`, `text-champagne-soft`)
   con una velatura scura sotto; il testo su fondo pagina è scuro. Le due cose
   non si mescolano mai nello stesso blocco.
3. **Contrasto**: l'oro d'accento (`champagne`, 4,85:1) è per testo e bordi;
   i bottoni pieni usano `champagne-deep` con testo bianco (7,9:1). Su fondo
   chiaro **`text-ink/60` è il minimo per il testo**: è il primo gradino che
   passa AA (4,82:1 su `surface`, 4,68:1 su `surface-soft`). `/55` si ferma a
   4,06:1 e non basta, nonostante l'aspetto simile.

   Unica deroga: le stelle vuote dei rating usano `/50` (3,45:1). Sono grafica
   e non testo, quindi la soglia è 3:1 — e a `/60` non si distinguerebbero più
   dalle stelle piene, che è l'informazione che devono trasmettere.

Unica eccezione al fondo chiaro: **l'hero della home**, fotografia a tutta
pagina con velatura matta e testo bianco. L'header si adegua da solo (testo
chiaro solo lì). L'immagine è configurata in `src/lib/hero-media.ts` (oggi un
**segnaposto**, vedi `public/hero/README.txt` per sostituirla con una veduta
aerea di Merano).

Favicon e icona iOS sono generate dal marchio in `src/app/icon.tsx` e
`src/app/apple-icon.tsx`: nessun file binario da mantenere.

## Multilingua

- Rotte `/(it|de|en)/...`; il `middleware.ts` reindirizza i path senza prefisso
  usando cookie → `Accept-Language` → italiano.
- Gli slug di rotta sono identici nelle tre lingue (`/de/proprieta/...`): un solo
  albero da mantenere e link condivisibili che restano validi cambiando lingua.
- `src/i18n/dictionaries/it.ts` è la fonte di verità della struttura: `de.ts` e
  `en.ts` sono tipizzati su di essa, quindi una chiave mancante è un errore di
  compilazione.
- I testi degli immobili sono tradotti nel database (`content` JSONB). Se una
  lingua non è compilata, il mapper ricade sull'italiano invece di mostrare vuoti.

## SEO

- `buildMetadata()` (`src/lib/seo.ts`) genera per ogni rotta canonical, hreflang
  (`it-IT`, `de-DE`, `en-US`, `x-default`), OpenGraph e Twitter Card.
- JSON-LD in `src/lib/jsonld.ts`: `RealEstateAgent` + `WebSite` a livello di
  layout, `RealEstateListing` (con `SingleFamilyResidence`/`Apartment`, prezzo,
  m², classe energetica, coordinate, gallery) sulle schede, `BreadcrumbList`
  ovunque, `ItemList` sugli elenchi.
- `sitemap.xml` legge gli immobili pubblicati da Supabase e include le tre
  varianti linguistiche di ogni URL; `robots.txt` esclude `/admin`.
- Pagine statiche rigenerate ogni 5 minuti (`revalidate = 300`); le schede
  immobile sono pre-generate al build e quelle pubblicate dopo vengono rese al
  primo accesso (`dynamicParams`).

## Area riservata `/admin`

Autenticazione **Supabase Auth** (email + password, account creati dalla
dashboard). L'autorizzazione non sta nel front-end: le policy RLS accettano
scritture solo dagli utenti presenti in `admin_users`.

Il form copre: dati generali e stato di pubblicazione, testi IT/DE/EN (titolo,
sottotitolo, descrizione, meta description, punti di forza), specifiche tecniche,
comfort, localizzazione con lat/lng, uploader immagini drag & drop verso lo
Storage con ALT per lingua, planimetrie, generazione brochure PDF nella lingua
scelta, export JSON.

## Brochure PDF

`src/lib/brochure.ts` produce un A4 orizzontale pronto per la stampa:
copertina con foto e dati chiave → narrazione e punti di forza → scheda tecnica
con badge energetico e planimetrie → galleria a piena pagina → note legali con
P.IVA, REA, sedi e clausole di riservatezza. Testi e valute seguono la lingua
selezionata. `buildBrochure()` restituisce il documento senza scaricarlo (utile
per i test), `generateBrochure()` lo salva.

## Moduli di contatto

Contatti, valutazione, richiesta brochure e newsletter inseriscono in `leads`.
Il consenso privacy è un vincolo della policy di insert: una richiesta senza
consenso viene rifiutata dal database. Se Supabase non è configurato i form lo
dichiarano e mostrano i recapiti diretti, invece di fingere un invio riuscito.

Da valutare come passo successivo: una notifica e-mail allo staff a ogni nuovo
lead (Supabase Database Webhook → Resend/SendGrid, oppure Edge Function).

---

## Contenuti

Nel sito non ci sono dati inventati sull'azienda. Le uniche affermazioni
quantitative sono quelle verificabili:

- P.IVA / C.F. 01099680223 · REA TN-115097
- Sede legale Via del Ponte 37, 38123 Trento (TN)
- Ufficio Via Otto Huber 1, 39012 Merano (BZ)
- +39 340 555 5491 · immobilianes@pec.it
- 4,7 / 5 su 13 recensioni Google (mostrato come punteggio aggregato, senza
  testimonianze: le citazioni dei clienti andranno aggiunte solo quando saranno
  disponibili quelle reali, o collegando la Google Places API)

Restano da fornire dal cliente:

| Cosa | Dove |
| --- | --- |
| Fotografia aerea di Merano per l'hero | `public/hero/` + `src/lib/hero-media.ts` (oggi segnaposto) |
| Fotografie degli immobili | caricamento da `/admin` (bucket `property-media`) |
| Schede immobile reali | `/admin`; le 6 in `supabase/seed.sql` sono dichiaratamente fittizie |
| Anno di fondazione, numeri di attività | oggi non citati da nessuna parte: aggiungerli solo se documentabili |
| Validazione legale di privacy, cookie policy e termini | `src/data/legal.ts` |

Le immagini in `public/demo/` servono solo al seed di sviluppo e non
raffigurano immobili in portafoglio: prima del go-live la cartella può essere
eliminata insieme al seed.

## Variabili d'ambiente

Vedi `.env.example`. In sintesi:

```
NEXT_PUBLIC_SITE_URL=https://www.ianesimmobilien.it
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
```
