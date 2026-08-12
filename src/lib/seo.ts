import type { Metadata } from "next";
import { LOCALES, LOCALE_TAGS, href, type Locale } from "@/i18n/config";
import { ALLOW_INDEXING, COMPANY, SITE_URL } from "./company";

interface MetaInput {
  locale: Locale;
  /** path senza prefisso lingua, es. "proprieta/villa-panorama-merano" */
  path?: string;
  title: string;
  description: string;
  /** URL assoluto o relativo dell'immagine social */
  image?: string;
  imageAlt?: string;
  noIndex?: boolean;
  type?: "website" | "article";
}

const OG_LOCALES: Record<Locale, string> = {
  it: "it_IT",
  de: "de_DE",
  en: "en_US",
};

export function absoluteUrl(path = ""): string {
  const clean = path.replace(/^\//, "");
  return clean ? `${SITE_URL}/${clean}` : SITE_URL;
}

/**
 * Costruisce canonical + hreflang (it-IT, de-DE, en-US, x-default) e le card
 * social per una qualsiasi rotta del sito.
 */
export function buildMetadata({
  locale,
  path = "",
  title,
  description,
  image,
  imageAlt,
  noIndex = false,
  type = "website",
}: MetaInput): Metadata {
  const canonical = absoluteUrl(href(locale, path).slice(1));

  const languages: Record<string, string> = {};
  for (const l of LOCALES) {
    languages[LOCALE_TAGS[l]] = absoluteUrl(href(l, path).slice(1));
  }
  // x-default punta alla versione italiana, lingua principale dell'agenzia.
  languages["x-default"] = absoluteUrl(href("it", path).slice(1));

  // Senza un'immagine dell'immobile si lascia il campo vuoto: subentra
  // `opengraph-image.tsx`, la card social generata con il marchio.
  const ogImage = image ? (image.startsWith("http") ? image : absoluteUrl(image)) : undefined;

  return {
    // I titoli dei dizionari contengono già il brand: `absolute` evita che il
    // template del layout lo aggiunga una seconda volta.
    title: { absolute: title },
    description,
    alternates: { canonical, languages },
    // Su un deploy non canonico il meta robots è negativo per tutte le pagine,
    // qualunque cosa chieda la rotta: il robots.txt da solo non basta, perché
    // un URL già noto a Google può essere indicizzato anche senza scansione.
    robots:
      noIndex || !ALLOW_INDEXING
        ? { index: false, follow: false }
        : { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
    openGraph: {
      type,
      siteName: COMPANY.brandName,
      title,
      description,
      url: canonical,
      locale: OG_LOCALES[locale],
      alternateLocale: LOCALES.filter((l) => l !== locale).map((l) => OG_LOCALES[l]),
      ...(ogImage ? { images: [{ url: ogImage, width: 1600, height: 1200, alt: imageAlt ?? title }] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(ogImage ? { images: [ogImage] } : {}),
    },
  };
}
