import it, { type Dictionary } from "./dictionaries/it";
import de from "./dictionaries/de";
import en from "./dictionaries/en";
import { DEFAULT_LOCALE, type Locale } from "./config";

/**
 * I dizionari sono moduli statici: costano pochi KB, valgono sia sul server
 * sia sul client e non richiedono un round-trip asincrono.
 */
export const dictionaries: Record<Locale, Dictionary> = { it, de, en };

export function getDictionary(locale: Locale | string | undefined): Dictionary {
  return dictionaries[(locale as Locale) in dictionaries ? (locale as Locale) : DEFAULT_LOCALE];
}

/** Sostituisce i segnaposto `{chiave}` con i valori passati. */
export function interpolate(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in values ? String(values[key]) : match,
  );
}

export type { Dictionary };
