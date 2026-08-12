"use client";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { isLocale, DEFAULT_LOCALE } from "@/i18n/config";
import { isLeadKind, type Lead } from "@/types/lead";

/**
 * Lettura e gestione delle richieste dall'area riservata.
 *
 * Come per gli immobili, qui non c'è nessun controllo di autorizzazione:
 * `leads_admin_read` e `leads_admin_update` passano da `is_admin()`, quindi
 * un utente autenticato ma non in allowlist riceve semplicemente un elenco
 * vuoto. La verifica sta nel database, non in questo modulo.
 */
function client() {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) throw new Error("Supabase non configurato: impostare NEXT_PUBLIC_SUPABASE_URL e ANON_KEY.");
  return supabase;
}

interface LeadRow {
  id: string;
  kind: string;
  name: string | null;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string | null;
  locale: string;
  property_id: string | null;
  property_reference: string | null;
  payload: unknown;
  consent: boolean;
  handled: boolean;
  created_at: string;
}

/**
 * `kind` e `locale` arrivano da enum e CHECK del database, quindi in pratica
 * sono già validi. Li si verifica lo stesso perché una riga inserita a mano
 * dalla dashboard non passa da quei controlli applicativi, e un valore
 * inatteso deve degradare in un'etichetta neutra invece di far saltare la
 * schermata a chi sta leggendo le richieste.
 */
function rowToLead(row: LeadRow): Lead {
  return {
    id: row.id,
    kind: isLeadKind(row.kind) ? row.kind : "contact",
    name: row.name,
    email: row.email,
    phone: row.phone,
    subject: row.subject,
    message: row.message,
    locale: isLocale(row.locale) ? row.locale : DEFAULT_LOCALE,
    propertyId: row.property_id,
    propertyReference: row.property_reference,
    payload:
      row.payload && typeof row.payload === "object" && !Array.isArray(row.payload)
        ? (row.payload as Record<string, unknown>)
        : {},
    consent: row.consent,
    handled: row.handled,
    createdAt: row.created_at,
  };
}

/** Tutte le richieste, dalla più recente. */
export async function listLeads(): Promise<Lead[]> {
  const { data, error } = await client()
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data as LeadRow[]).map(rowToLead);
}

/** Segna una richiesta come gestita (o la riapre). */
export async function setLeadHandled(id: string, handled: boolean): Promise<void> {
  const { error } = await client().from("leads").update({ handled }).eq("id", id);
  if (error) throw new Error(error.message);
}

export async function removeLead(id: string): Promise<void> {
  const { error } = await client().from("leads").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

/**
 * Export CSV delle richieste selezionate.
 *
 * Separatore `;` e BOM UTF-8: è la combinazione che Excel in locale italiano
 * e tedesco apre in colonne senza chiedere nulla. Con la virgola finirebbe
 * tutto in una colonna sola.
 */
export function leadsToCsv(leads: Lead[]): string {
  const columns = [
    "created_at", "kind", "name", "email", "phone",
    "subject", "message", "locale", "property_reference", "handled", "payload",
  ];

  const escape = (value: unknown): string => {
    if (value === null || value === undefined) return "";
    const text = typeof value === "object" ? JSON.stringify(value) : String(value);
    // Le virgolette interne si raddoppiano, e qualsiasi cella con separatore,
    // virgolette o a capo va racchiusa: altrimenti una riga sfonda la colonna.
    return /[";\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  };

  const rows = leads.map((lead) =>
    [
      lead.createdAt, lead.kind, lead.name, lead.email, lead.phone,
      lead.subject, lead.message, lead.locale, lead.propertyReference,
      lead.handled ? "1" : "0",
      Object.keys(lead.payload).length ? lead.payload : null,
    ]
      .map(escape)
      .join(";"),
  );

  return `﻿${columns.join(";")}\n${rows.join("\n")}`;
}
