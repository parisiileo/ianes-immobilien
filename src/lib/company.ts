/**
 * Dati aziendali ufficiali di IMMOBIL IANES S.R.L.
 * Unica fonte di verità: footer, pagine legali, JSON-LD, brochure PDF e
 * moduli di contatto leggono tutti da qui.
 */
export const COMPANY = {
  legalName: "IMMOBIL IANES S.R.L.",
  brandName: "Ianes Immobilien",
  brandShort: "Ianes",
  vat: "01099680223",
  taxCode: "01099680223",
  rea: "TN - 115097",
  registeredOffice: {
    street: "Via del Ponte 37",
    postalCode: "38123",
    city: "Trento",
    province: "TN",
    region: "Trentino-Alto Adige",
    country: "IT",
    countryName: "Italia",
    lat: 46.0511,
    lng: 11.1092,
  },
  localOffice: {
    street: "Via Otto Huber, 1",
    postalCode: "39012",
    city: "Merano",
    province: "BZ",
    region: "Trentino-Alto Adige",
    country: "IT",
    countryName: "Italia",
    lat: 46.6713,
    lng: 11.1594,
  },
  phone: "+39 340 555 5491",
  phoneHref: "+393405555491",
  pec: "immobilianes@pec.it",
  email: "immobilianes@pec.it",
  rating: {
    value: 4.7,
    count: 13,
    best: 5,
  },
  openingHours: [
    { days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], opens: "09:00", closes: "18:30" },
    { days: ["Saturday"], opens: "09:00", closes: "12:30" },
  ],
  /**
   * Profili ufficiali. Finiscono nel footer e in `sameAs` del JSON-LD: è così
   * che Google collega il sito ai profili e li mostra nel pannello del marchio.
   */
  social: [
    { name: "Instagram", url: "https://www.instagram.com/ianesimmobilien/" },
    { name: "Facebook", url: "https://www.facebook.com/ianesimmobilien" },
  ],
} as const;

/** Dominio di produzione: usato per canonical, hreflang, sitemap e OpenGraph. */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.ianesimmobilien.it").replace(/\/$/, "");

/** L'unico host che deve comparire nei risultati di ricerca. */
export const CANONICAL_HOST = "www.ianesimmobilien.it";

/**
 * Questo deploy può essere indicizzato?
 *
 * Serve a impedire che un'anteprima — un `*.vercel.app` mostrato al cliente,
 * con schede dimostrative e prezzi inventati — finisca nell'indice di Google
 * e resti agganciata al nome dell'agenzia. Il controllo è sull'host di
 * `NEXT_PUBLIC_SITE_URL`, quindi si spegne e si riaccende da solo: qualsiasi
 * dominio diverso da quello di produzione è automaticamente escluso, e il
 * giorno del go-live basta puntare la variabile al dominio vero.
 *
 * `NEXT_PUBLIC_NOINDEX=1` è la cintura di sicurezza per escludere un deploy
 * anche quando l'host sarebbe quello giusto.
 */
export const ALLOW_INDEXING =
  process.env.NEXT_PUBLIC_NOINDEX !== "1" &&
  (() => {
    try {
      return new URL(SITE_URL).host === CANONICAL_HOST;
    } catch {
      return false;
    }
  })();
