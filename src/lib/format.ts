import { LOCALE_TAGS, type Locale } from "@/i18n/config";
import type { ListingType } from "@/types/property";

/** Prezzo pieno: 4.250.000 € / € 4,250,000 secondo la lingua. */
export function formatPrice(value: number, locale: Locale): string {
  return new Intl.NumberFormat(LOCALE_TAGS[locale], {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
}

/** Prezzo con suffisso /mese sugli affitti. */
export function formatListingPrice(
  value: number,
  locale: Locale,
  listingType: ListingType,
  perMonthLabel: string,
): string {
  const price = formatPrice(value, locale);
  return listingType === "rent" ? `${price}${perMonthLabel}` : price;
}

/** Spazio unificatore: l'abbreviazione non deve staccarsi dal numero andando a capo. */
const NBSP = " ";

/** Abbreviazione del milione. Sotto il milione non si abbrevia nulla. */
const MILLION_ABBREVIATION: Record<Locale, string> = { it: "Mln", de: "Mio.", en: "M" };

/** Le parti numeriche di un importo formattato, in coda alle quali va il suffisso. */
const NUMERIC_PARTS = new Set<Intl.NumberFormatPartTypes>(["integer", "group", "decimal", "fraction"]);

/**
 * Forma compatta per badge, slider e mappa: 4,25 Mln € · 850.000 € · 3.200 €.
 *
 * Il suffisso è nostro e non di `notation: "compact"`. Le tabelle CLDR della
 * notazione compatta cambiano fra la ICU compilata dentro Node e quella di
 * V8, e la stessa cifra usciva diversa sul server e nel browser: 3200 €
 * diventava "3200 €" nell'HTML servito e "3,2K €" dopo l'idratazione, con
 * React costretto a rigenerare il sottoalbero della mappa. Le pattern in
 * notazione standard invece coincidono, quindi la scala la applichiamo noi e
 * a `Intl` resta il lavoro che fa in modo stabile: separatori, decimali e
 * posizione del simbolo di valuta, che in inglese precede l'importo.
 *
 * Si abbrevia solo dal milione in su: sotto, un prezzo pieno sta comunque
 * nello spazio disponibile ed è più chiaro di un "850K".
 */
export function formatPriceCompact(value: number, locale: Locale): string {
  if (Math.abs(value) < 1_000_000) return formatPrice(value, locale);

  const parts = new Intl.NumberFormat(LOCALE_TAGS[locale], {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).formatToParts(value / 1_000_000);

  const lastNumeric = parts.reduce(
    (found, part, index) => (NUMERIC_PARTS.has(part.type) ? index : found),
    -1,
  );
  if (lastNumeric === -1) return formatPrice(value, locale);

  const suffix = NBSP + MILLION_ABBREVIATION[locale];
  return parts.map((part, index) => (index === lastNumeric ? part.value + suffix : part.value)).join("");
}

export function formatNumber(value: number, locale: Locale, options?: Intl.NumberFormatOptions): string {
  return new Intl.NumberFormat(LOCALE_TAGS[locale], options).format(value);
}

export function formatArea(value: number, locale: Locale, unit = "m²"): string {
  return `${formatNumber(value, locale)} ${unit}`;
}

export function formatDate(iso: string, locale: Locale): string {
  return new Intl.DateTimeFormat(LOCALE_TAGS[locale], { dateStyle: "long" }).format(new Date(iso));
}

/** Slug sicuro per URL a partire da un titolo libero (usato dall'admin). */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    // rimuove i segni diacritici scomposti da NFD (U+0300–U+036F)
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}
