import type { Locale } from "@/i18n/config";

/** Da quale modulo arriva la richiesta. Rispecchia l'enum `public.lead_kind`. */
export const LEAD_KINDS = ["contact", "valuation", "brochure", "newsletter"] as const;
export type LeadKind = (typeof LEAD_KINDS)[number];

export function isLeadKind(value: string): value is LeadKind {
  return (LEAD_KINDS as readonly string[]).includes(value);
}

/**
 * Una richiesta arrivata dai moduli pubblici.
 *
 * Rispecchia una riga di `public.leads`. I campi opzionali del database sono
 * `null` e non `undefined`: la distinzione conta, perché l'elenco deve poter
 * dire «non fornito» invece di lasciare un vuoto ambiguo.
 */
export interface Lead {
  id: string;
  kind: LeadKind;
  name: string | null;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string | null;
  locale: Locale;
  propertyId: string | null;
  propertyReference: string | null;
  /** Campi specifici del modulo (metratura e indirizzo per la valutazione…). */
  payload: Record<string, unknown>;
  consent: boolean;
  handled: boolean;
  createdAt: string;
}

/** Filtro dell'elenco: `all` non è un `LeadKind`, è l'assenza di filtro. */
export type LeadKindFilter = LeadKind | "all";
export type LeadStatusFilter = "all" | "pending" | "handled";
