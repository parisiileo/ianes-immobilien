export const LOCALES = ["it", "de", "en"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "it";

/** Mappa locale → tag BCP-47 usato per hreflang, OpenGraph e Intl.* */
export const LOCALE_TAGS: Record<Locale, string> = {
  it: "it-IT",
  de: "de-DE",
  en: "en-US",
};

export const LOCALE_LABELS: Record<Locale, { short: string; long: string }> = {
  it: { short: "IT", long: "Italiano" },
  de: { short: "DE", long: "Deutsch" },
  en: { short: "EN", long: "English" },
};

export function isLocale(value: string | undefined): value is Locale {
  return !!value && (LOCALES as readonly string[]).includes(value);
}

/**
 * Gli slug di rotta restano identici nelle tre lingue (solo il prefisso cambia).
 * Scelta voluta: un solo albero di rotte da mantenere, nessun rischio di
 * canonical divergenti, e i link condivisi restano validi cambiando lingua.
 */
export const ROUTES = {
  home: "",
  properties: "proprieta",
  property: (id: string) => `proprieta/${id}`,
  about: "chi-siamo",
  contact: "contatti",
  valuation: "valutazione",
  privacy: "privacy-policy",
  cookie: "cookie-policy",
  terms: "termini-e-condizioni",
} as const;

/** Costruisce un path assoluto con prefisso lingua: href("de", "proprieta") → /de/proprieta */
export function href(locale: Locale, path = ""): string {
  const clean = path.replace(/^\//, "");
  return clean ? `/${locale}/${clean}` : `/${locale}`;
}
