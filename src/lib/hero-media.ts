import type { Locale } from "@/i18n/config";

/**
 * Immagine di apertura della home.
 *
 * SEGNAPOSTO: il file attuale è un paesaggio alpino generico, non una veduta
 * reale di Merano. Va sostituito con una fotografia aerea ad alta risoluzione
 * di cui l'agenzia abbia la licenza — vedi public/hero/README.txt.
 * Cambiando le costanti qui sotto si aggiorna tutto il sito.
 */
export const HERO_IMAGE = "/hero/merano-placeholder.jpg";

export const HERO_IMAGE_ALT: Record<Locale, string> = {
  it: "Veduta della conca alpina fra vigneti e montagne al tramonto",
  de: "Blick auf den alpinen Talkessel zwischen Weinbergen und Bergen bei Sonnenuntergang",
  en: "View over the alpine basin between vineyards and mountains at sunset",
};

/** Attribuzione del fotografo, se la licenza la richiede. Vuota = non mostrata. */
export const HERO_IMAGE_CREDIT = "";

/** True finché l'immagine è quella dimostrativa: mostra l'avviso in dev. */
export const HERO_IMAGE_IS_PLACEHOLDER = HERO_IMAGE.includes("placeholder");
