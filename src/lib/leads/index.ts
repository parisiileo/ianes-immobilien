"use client";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { Locale } from "@/i18n/config";
import type { LeadKind } from "@/types/lead";

export type { LeadKind };

export interface LeadInput {
  kind: LeadKind;
  email: string;
  name?: string;
  phone?: string;
  subject?: string;
  message?: string;
  locale: Locale;
  propertyId?: string;
  propertyReference?: string;
  /** Campi specifici del modulo (es. metratura e indirizzo per la valutazione). */
  payload?: Record<string, unknown>;
  consent: boolean;
}

export type LeadResult =
  | { ok: true }
  | { ok: false; reason: "not-configured" | "rate-limited" | "error"; message?: string };

/**
 * Il trigger `leads_rate_limit` solleva con questo prefisso quando una delle
 * due soglie è superata. Si riconosce dal messaggio e non dal codice SQL
 * perché PostgREST rimappa gli errori applicativi tutti sullo stesso stato.
 */
const RATE_LIMIT_MARKER = "LEAD_RATE_LIMIT";

/**
 * Registra una richiesta nella tabella `leads`.
 *
 * La policy RLS accetta insert anonime solo con `consent = true`: la prova del
 * consenso è quindi un vincolo del database, non una convenzione applicativa.
 * Se Supabase non è configurato la funzione lo dichiara invece di fingere un
 * invio riuscito, così il form può mostrare i recapiti diretti.
 */
export async function submitLead(input: LeadInput): Promise<LeadResult> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return { ok: false, reason: "not-configured" };

  const { error } = await supabase.from("leads").insert({
    kind: input.kind,
    email: input.email.trim(),
    name: input.name?.trim() || null,
    phone: input.phone?.trim() || null,
    subject: input.subject ?? null,
    message: input.message?.trim() || null,
    locale: input.locale,
    property_id: input.propertyId ?? null,
    property_reference: input.propertyReference ?? null,
    payload: input.payload ?? {},
    consent: input.consent,
  });

  if (error) {
    if (error.message.includes(RATE_LIMIT_MARKER)) {
      return { ok: false, reason: "rate-limited" };
    }
    console.error("[leads] insert:", error.message);
    return { ok: false, reason: "error", message: error.message };
  }
  return { ok: true };
}
