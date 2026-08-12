-- ============================================================================
-- DATI DIMOSTRATIVI — NON ESEGUIRE SUL PROGETTO DI PRODUZIONE
--
-- Sei schede fittizie che servono soltanto a vedere il sito popolato in
-- locale (griglia, mappa, filtri, brochure PDF). Indirizzi, prezzi,
-- metrature e coordinate NON corrispondono a immobili reali: il riferimento
-- inizia con "DEMO-" proprio per renderlo evidente in ogni schermata.
--
-- Uso consigliato: incollare questo file nel SQL Editor del progetto, oppure
--   psql "$DATABASE_URL" -f supabase/seed.sql
--
-- NON usare `supabase db reset` su un progetto remoto: quel comando ricrea il
-- database da zero e cancella immobili, richieste e allowlist admin_users. È
-- pensato per l'ambiente locale, dove non c'è nulla da perdere.
--
-- Rilanciarlo è sicuro: la prima istruzione rimuove le sole schede DEMO-.
-- Per ripulire senza reinserire:
--   delete from public.properties where reference like 'DEMO-%';
-- ============================================================================

delete from public.properties where reference like 'DEMO-%';

insert into public.properties (
  slug, reference, listing_type, status, category, published, featured,
  price, price_on_request, surface_sqm, lot_sqm, rooms, bedrooms, bathrooms,
  floor, floors, energy_class, energy_index, heating, construction_year, renovation_year,
  amenities, address, city, province, postal_code, zone, lat, lng,
  images, floor_plans, content,
  emissions_class, emissions_index, co_ownership, co_ownership_proceedings, fees_payable_by
) values

-- 1 ─ Villa ------------------------------------------------------------------
(
  'demo-villa-panoramica-merano', 'DEMO-001', 'sale', 'available', 'villa', true, true,
  4250000, false, 480, 2400, 9, 5, 5,
  null, 3, 'A2', 28, 'heatPump', 2019, null,
  array['pool','spa','mountainView','terrace','garden','garage','smartHome','wineCellar'],
  'Indirizzo dimostrativo 1', 'Merano', 'BZ', '39012', 'Maia Alta', 46.6820, 11.1712,
  $json$[
    {"src":"/demo/villa-esterno.jpg","alt":{"it":"Villa contemporanea circondata dai vigneti al tramonto","de":"Zeitgenössische Villa inmitten der Weinberge bei Sonnenuntergang","en":"Contemporary villa surrounded by vineyards at sunset"}},
    {"src":"/demo/soggiorno-vetrate.jpg","alt":{"it":"Soggiorno a doppia altezza con vetrate panoramiche","de":"Wohnraum mit doppelter Raumhöhe und Panoramaverglasung","en":"Double-height living room with panoramic glazing"}},
    {"src":"/demo/piscina-crepuscolo.jpg","alt":{"it":"Piscina a sfioro illuminata al crepuscolo","de":"Beleuchteter Infinity-Pool in der Dämmerung","en":"Illuminated infinity pool at dusk"}},
    {"src":"/demo/cucina-mansarda.jpg","alt":{"it":"Cucina open space con affaccio sulle cime","de":"Offene Küche mit Blick auf die Gipfel","en":"Open-plan kitchen facing the peaks"}}
  ]$json$::jsonb,
  $json$[
    {"level":0,"name":{"it":"Piano terra","de":"Erdgeschoss","en":"Ground floor"},"areaSqm":210,"rooms":["entrance","living","kitchen","dining","bathroom","terrace"]},
    {"level":1,"name":{"it":"Primo piano","de":"Obergeschoss","en":"First floor"},"areaSqm":180,"rooms":["master","bedroom","bedroom","bathroom","studio","loggia"]},
    {"level":-1,"name":{"it":"Interrato","de":"Untergeschoss","en":"Basement"},"areaSqm":90,"rooms":["spa","cellar","garage"]}
  ]$json$::jsonb,
  $json${
    "it":{"title":"Villa panoramica con piscina a sfioro","subtitle":"Scheda dimostrativa — Merano","description":"Scheda di esempio usata per mostrare l impaginazione della pagina immobile: fotografie, scheda tecnica, planimetrie e brochure PDF.\n\nI testi definitivi vengono inseriti dall area riservata, una lingua alla volta, con la descrizione estesa, i punti di forza e la meta description dedicata.","metaDescription":"Scheda dimostrativa: villa con piscina a sfioro, spa privata e classe energetica A2 a Merano.","highlights":["Piscina a sfioro riscaldata","Spa privata con sauna e bagno turco","Classe energetica A2","Garage doppio con ricarica elettrica"]},
    "de":{"title":"Panorama-Villa mit Infinity-Pool","subtitle":"Demo-Objekt — Meran","description":"Beispielobjekt zur Darstellung der Objektseite: Fotos, Datenblatt, Grundrisse und PDF-Exposé.\n\nDie endgültigen Texte werden im geschützten Bereich erfasst, Sprache für Sprache, mit ausführlicher Beschreibung, Highlights und eigener Meta-Description.","metaDescription":"Demo-Objekt: Villa mit Infinity-Pool, Privat-Spa und Energieklasse A2 in Meran.","highlights":["Beheizter Infinity-Pool","Privat-Spa mit Sauna und Dampfbad","Energieklasse A2","Doppelgarage mit Ladestation"]},
    "en":{"title":"Panoramic villa with infinity pool","subtitle":"Demo listing — Merano","description":"Sample listing used to show the property page layout: photography, data sheet, floor plans and PDF brochure.\n\nFinal copy is entered from the restricted area, one language at a time, with the extended description, highlights and a dedicated meta description.","metaDescription":"Demo listing: villa with infinity pool, private spa and energy class A2 in Merano.","highlights":["Heated infinity pool","Private spa with sauna and steam room","Energy class A2","Double garage with EV charger"]}
  }$json$::jsonb,
  'A2', 6, false, false, 'buyer'
),

-- 2 ─ Attico -----------------------------------------------------------------
(
  'demo-attico-centro-trento', 'DEMO-002', 'sale', 'available', 'penthouse', true, true,
  1480000, false, 212, null, 5, 3, 3,
  '6', 2, 'A3', 22, 'underfloor', 2021, null,
  array['terrace','elevator','garage','smartHome','mountainView'],
  'Indirizzo dimostrativo 2', 'Trento', 'TN', '38122', 'Centro storico', 46.0703, 11.1245,
  $json$[
    {"src":"/demo/cucina-mansarda.jpg","alt":{"it":"Attico open space con lucernari","de":"Penthouse mit offenem Grundriss und Dachfenstern","en":"Open-plan penthouse with skylights"}},
    {"src":"/demo/soggiorno-vetrate.jpg","alt":{"it":"Zona giorno con vetrate a tutta altezza","de":"Wohnbereich mit raumhohen Fenstern","en":"Living area with full-height glazing"}}
  ]$json$::jsonb,
  $json$[
    {"level":6,"name":{"it":"Livello principale","de":"Hauptebene","en":"Main level"},"areaSqm":132,"rooms":["entrance","living","kitchen","bathroom","bedroom"]},
    {"level":7,"name":{"it":"Livello superiore","de":"Obere Ebene","en":"Upper level"},"areaSqm":80,"rooms":["master","bathroom","studio","terrace"]}
  ]$json$::jsonb,
  $json${
    "it":{"title":"Attico su due livelli con terrazza","subtitle":"Scheda dimostrativa — Trento","description":"Secondo esempio di scheda, utile a verificare come si comportano le griglie con immobili di taglio diverso.\n\nOgni campo — metratura, classe energetica, coordinate per la mappa — è modificabile dall area riservata.","metaDescription":"Scheda dimostrativa: attico su due livelli con terrazza panoramica nel centro di Trento.","highlights":["Terrazza panoramica","Ultimo piano, doppia esposizione","Riscaldamento a pavimento","Due posti auto in autorimessa"]},
    "de":{"title":"Penthouse auf zwei Ebenen mit Terrasse","subtitle":"Demo-Objekt — Trient","description":"Zweites Beispielobjekt, um das Verhalten der Raster bei anderen Zuschnitten zu prüfen.\n\nJedes Feld — Fläche, Energieklasse, Koordinaten für die Karte — ist im geschützten Bereich änderbar.","metaDescription":"Demo-Objekt: Penthouse auf zwei Ebenen mit Panoramaterrasse im Zentrum von Trient.","highlights":["Panoramaterrasse","Oberstes Geschoss, doppelte Ausrichtung","Fußbodenheizung","Zwei Stellplätze in der Tiefgarage"]},
    "en":{"title":"Two-level penthouse with terrace","subtitle":"Demo listing — Trento","description":"A second sample listing, useful to check how the grids behave with a different type of property.\n\nEvery field — surface, energy class, map coordinates — can be edited from the restricted area.","metaDescription":"Demo listing: two-level penthouse with panoramic terrace in central Trento.","highlights":["Panoramic terrace","Top floor, dual exposure","Underfloor heating","Two parking spaces"]}
  }$json$::jsonb,
  'A1', 9, true,  false, 'buyer'
),

-- 3 ─ Chalet -----------------------------------------------------------------
(
  'demo-chalet-dolomiti', 'DEMO-003', 'sale', 'reserved', 'chalet', true, true,
  4900000, false, 392, 1650, 10, 6, 6,
  null, 3, 'A1', 34, 'geothermal', 2016, null,
  array['spa','mountainView','fireplace','garage','terrace','wineCellar','smartHome'],
  'Indirizzo dimostrativo 3', 'Selva di Val Gardena', 'BZ', '39048', 'Dolomiti', 46.5546, 11.7601,
  $json$[
    {"src":"/demo/piscina-crepuscolo.jpg","alt":{"it":"Chalet contemporaneo in pietra e legno","de":"Zeitgenössisches Chalet aus Stein und Holz","en":"Contemporary stone-and-timber chalet"}},
    {"src":"/demo/stube-legno.jpg","alt":{"it":"Stube con travi a vista in legno antico","de":"Stube mit sichtbaren Altholzbalken","en":"Stube with exposed old-timber beams"}}
  ]$json$::jsonb,
  $json$[
    {"level":0,"name":{"it":"Piano terra","de":"Erdgeschoss","en":"Ground floor"},"areaSqm":150,"rooms":["entrance","living","kitchen","dining","bathroom"]},
    {"level":1,"name":{"it":"Primo piano","de":"Obergeschoss","en":"First floor"},"areaSqm":132,"rooms":["master","bedroom","bedroom","bathroom","bathroom"]},
    {"level":-1,"name":{"it":"Livello wellness","de":"Wellnessebene","en":"Wellness level"},"areaSqm":110,"rooms":["spa","cellar","garage","staff"]}
  ]$json$::jsonb,
  $json${
    "it":{"title":"Chalet con area wellness","subtitle":"Scheda dimostrativa — Val Gardena","description":"Esempio con stato Riservato, per verificare come i badge di stato compaiono su card, mappa e brochure.\n\nGli stati disponibili sono Disponibile, Riservato e Venduto.","metaDescription":"Scheda dimostrativa: chalet con area wellness e sei camere in Val Gardena.","highlights":["Area wellness con sauna panoramica","Sei camere con bagno privato","Classe energetica A1","Garage per tre auto"]},
    "de":{"title":"Chalet mit Wellnessbereich","subtitle":"Demo-Objekt — Gröden","description":"Beispiel mit Status Reserviert, um zu prüfen, wie die Status-Badges auf Karten, Karte und Exposé erscheinen.\n\nVerfügbare Status: Verfügbar, Reserviert, Verkauft.","metaDescription":"Demo-Objekt: Chalet mit Wellnessbereich und sechs Zimmern in Gröden.","highlights":["Wellnessbereich mit Panoramasauna","Sechs Zimmer mit eigenem Bad","Energieklasse A1","Garage für drei Fahrzeuge"]},
    "en":{"title":"Chalet with wellness area","subtitle":"Demo listing — Val Gardena","description":"Example with Reserved status, to check how the status badges appear on cards, on the map and in the brochure.\n\nAvailable statuses are Available, Reserved and Sold.","metaDescription":"Demo listing: chalet with wellness area and six bedrooms in Val Gardena.","highlights":["Wellness area with panoramic sauna","Six en-suite bedrooms","Energy class A1","Garage for three cars"]}
  }$json$::jsonb,
  'A',  11, false, false, 'buyer'
),

-- 4 ─ Appartamento in affitto -------------------------------------------------
(
  'demo-appartamento-affitto-bolzano', 'DEMO-004', 'rent', 'available', 'apartment', true, false,
  3200, false, 128, null, 4, 2, 2,
  '4', 1, 'A1', 26, 'districtHeating', 2020, null,
  array['elevator','terrace','garage','smartHome','mountainView'],
  'Indirizzo dimostrativo 4', 'Bolzano', 'BZ', '39100', 'Talvera', 46.4983, 11.3298,
  $json$[
    {"src":"/demo/cucina-mansarda.jpg","alt":{"it":"Cucina open space con affaccio sulle montagne","de":"Offene Küche mit Bergblick","en":"Open-plan kitchen with mountain view"}},
    {"src":"/demo/soggiorno-vetrate.jpg","alt":{"it":"Soggiorno luminoso con accesso alla loggia","de":"Heller Wohnraum mit Loggia-Zugang","en":"Bright living room opening onto the loggia"}}
  ]$json$::jsonb,
  $json$[
    {"level":4,"name":{"it":"Piano unico","de":"Einzelgeschoss","en":"Single floor"},"areaSqm":128,"rooms":["entrance","living","kitchen","master","bedroom","bathroom","loggia"]}
  ]$json$::jsonb,
  $json${
    "it":{"title":"Appartamento con loggia","subtitle":"Scheda dimostrativa — locazione","description":"Esempio di annuncio in locazione: il prezzo viene mostrato come canone mensile in tutto il sito e nella brochure.\n\nServe anche a verificare il funzionamento del filtro Acquista / Affitta.","metaDescription":"Scheda dimostrativa: appartamento in affitto con loggia a Bolzano.","highlights":["Loggia esposta a sud-est","Classe energetica A1","Teleriscaldamento","Box auto singolo"]},
    "de":{"title":"Wohnung mit Loggia","subtitle":"Demo-Objekt — Miete","description":"Beispiel für ein Mietangebot: Der Preis wird auf der gesamten Website und im Exposé als Monatsmiete ausgewiesen.\n\nDient auch der Prüfung des Filters Kaufen / Mieten.","metaDescription":"Demo-Objekt: Mietwohnung mit Loggia in Bozen.","highlights":["Loggia nach Südosten","Energieklasse A1","Fernwärme","Einzelgarage"]},
    "en":{"title":"Apartment with loggia","subtitle":"Demo listing — rental","description":"Example of a rental listing: the price is shown as a monthly rent across the site and in the brochure.\n\nIt also serves to check the Buy / Rent filter.","metaDescription":"Demo listing: apartment with loggia to rent in Bolzano.","highlights":["South-east facing loggia","Energy class A1","District heating","Single garage"]}
  }$json$::jsonb,
  'A1', 8, true,  true,  'buyer'
),

-- 5 ─ Tenuta con vigneto ------------------------------------------------------
(
  'demo-tenuta-vigneto', 'DEMO-005', 'sale', 'available', 'estate', true, true,
  6400000, true, 720, 34000, 14, 8, 7,
  null, 3, 'B', 68, 'autonomous', 1780, 2018,
  array['lakeView','wineCellar','pool','garden','fireplace','garage'],
  'Indirizzo dimostrativo 5', 'Caldaro sulla Strada del Vino', 'BZ', '39052', 'Lago di Caldaro', 46.4147, 11.2447,
  $json$[
    {"src":"/demo/stube-legno.jpg","alt":{"it":"Salone con travi in legno antico","de":"Salon mit Altholzbalken","en":"Lounge with old-timber beams"}},
    {"src":"/demo/villa-esterno.jpg","alt":{"it":"La tenuta immersa nei vigneti","de":"Das Anwesen inmitten der Weinberge","en":"The estate among the vineyards"}}
  ]$json$::jsonb,
  $json$[
    {"level":0,"name":{"it":"Corpo padronale","de":"Herrenhaus","en":"Main house"},"areaSqm":320,"rooms":["entrance","living","dining","kitchen","studio","bathroom"]},
    {"level":-1,"name":{"it":"Cantina storica","de":"Historischer Keller","en":"Historic cellar"},"areaSqm":140,"rooms":["cellar","spa","garage"]}
  ]$json$::jsonb,
  $json${
    "it":{"title":"Tenuta con vigneto","subtitle":"Scheda dimostrativa — prezzo su richiesta","description":"Esempio con prezzo su richiesta: in tutto il sito, nelle card e nella brochure il valore viene sostituito dalla dicitura corrispondente.\n\nUtile anche a verificare le schede con lotto molto ampio.","metaDescription":"Scheda dimostrativa: tenuta con vigneto e cantina storica.","highlights":["Vigneto in produzione","Cantina a volte","Piscina nel parco","Restauro conservativo"]},
    "de":{"title":"Anwesen mit Weinberg","subtitle":"Demo-Objekt — Preis auf Anfrage","description":"Beispiel mit Preis auf Anfrage: Auf der gesamten Website, in den Karten und im Exposé wird der Betrag durch den entsprechenden Hinweis ersetzt.\n\nPrüft außerdem Objekte mit sehr großem Grundstück.","metaDescription":"Demo-Objekt: Anwesen mit Weinberg und historischem Keller.","highlights":["Weinberg in Produktion","Gewölbekeller","Pool im Park","Behutsame Restaurierung"]},
    "en":{"title":"Estate with vineyard","subtitle":"Demo listing — price on request","description":"Example with price on request: across the site, in the cards and in the brochure the figure is replaced by the corresponding wording.\n\nAlso useful to check listings with a very large plot.","metaDescription":"Demo listing: estate with vineyard and historic cellar.","highlights":["Productive vineyard","Vaulted cellar","Pool in the park","Conservative restoration"]}
  }$json$::jsonb,
  'D',  29, false, false, 'buyer'
),

-- 6 ─ Maso ristrutturato ------------------------------------------------------
(
  'demo-maso-ristrutturato', 'DEMO-006', 'sale', 'sold', 'chalet', true, false,
  1950000, false, 340, 8500, 8, 5, 4,
  null, 3, 'B', 61, 'geothermal', 1642, 2021,
  array['mountainView','garden','fireplace','wineCellar','spa'],
  'Indirizzo dimostrativo 6', 'San Martino in Passiria', 'BZ', '39010', 'Val Passiria', 46.7715, 11.2185,
  $json$[
    {"src":"/demo/stube-legno.jpg","alt":{"it":"Interno con travi originali","de":"Innenraum mit Originalbalken","en":"Interior with original beams"}}
  ]$json$::jsonb,
  $json$[
    {"level":0,"name":{"it":"Piano terra","de":"Erdgeschoss","en":"Ground floor"},"areaSqm":130,"rooms":["entrance","living","kitchen","dining","bathroom"]}
  ]$json$::jsonb,
  $json${
    "it":{"title":"Maso ristrutturato","subtitle":"Scheda dimostrativa — venduto","description":"Esempio con stato Venduto: la scheda resta consultabile ma il badge segnala che la trattativa è conclusa.\n\nServe a mostrare come si comporta l ordinamento, che porta in coda gli immobili non più disponibili.","metaDescription":"Scheda dimostrativa: maso ristrutturato in Val Passiria.","highlights":["Struttura storica","Ampio terreno","Impianto geotermico"]},
    "de":{"title":"Sanierter Hof","subtitle":"Demo-Objekt — verkauft","description":"Beispiel mit Status Verkauft: Das Objekt bleibt abrufbar, das Badge weist jedoch auf den Abschluss hin.\n\nZeigt zudem die Sortierung, die nicht mehr verfügbare Objekte ans Ende stellt.","metaDescription":"Demo-Objekt: sanierter Hof im Passeiertal.","highlights":["Historische Bausubstanz","Großes Grundstück","Geothermie"]},
    "en":{"title":"Restored farmhouse","subtitle":"Demo listing — sold","description":"Example with Sold status: the listing stays available to read, but the badge makes clear the deal is closed.\n\nIt also shows the sorting, which pushes unavailable properties to the end.","metaDescription":"Demo listing: restored farmhouse in Val Passiria.","highlights":["Historic structure","Large plot","Geothermal system"]}
  }$json$::jsonb,
  'E',  46, false, false, 'buyer'
);
