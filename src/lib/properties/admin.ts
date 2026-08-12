"use client";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { MEDIA_BUCKET } from "@/lib/supabase/env";
import { propertyToRow, rowToProperty, type PropertyRow } from "./mapper";
import type { Property } from "@/types/property";

/**
 * Operazioni dell'area riservata.
 *
 * Nessun controllo di autorizzazione qui: chi può scrivere lo decide la RLS
 * (policy `is_admin()`), che è l'unico punto di verità. Se un utente non
 * autorizzato tentasse una insert, Postgres la rifiuterebbe comunque.
 */
function client() {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) throw new Error("Supabase non configurato: impostare NEXT_PUBLIC_SUPABASE_URL e ANON_KEY.");
  return supabase;
}

/**
 * L'utente autenticato è nell'allowlist `admin_users`?
 *
 * Serve a distinguere due situazioni che dal solo elenco degli immobili sono
 * indistinguibili: un admin con il catalogo ancora vuoto e un utente non
 * abilitato, a cui la RLS filtra via tutto restituendo comunque un elenco
 * vuoto. Prima venivano confusi, e chi apriva l'area riservata con zero
 * immobili si vedeva dire che il suo account non era abilitato.
 *
 * `is_admin()` è la stessa funzione usata da tutte le policy di scrittura:
 * qui non aggiunge sicurezza — un `false` forzato nel browser non darebbe
 * comunque alcun permesso — serve solo a mostrare la schermata giusta.
 */
export async function isCurrentUserAdmin(): Promise<boolean> {
  const { data, error } = await client().rpc("is_admin");
  if (error) throw new Error(error.message);
  return data === true;
}

/** Tutte le schede, bozze incluse (visibili solo agli admin per via della RLS). */
export async function listAllProperties(): Promise<Property[]> {
  const { data, error } = await client()
    .from("properties")
    .select("*")
    .order("updated_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data as PropertyRow[]).map(rowToProperty);
}

export async function upsertProperty(property: Property): Promise<Property> {
  const row = propertyToRow(property);
  const isNew = !property.id || property.id.startsWith("draft-");

  const query = isNew
    ? client().from("properties").insert(row).select("*").single()
    : client().from("properties").update(row).eq("id", property.id).select("*").single();

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return rowToProperty(data as PropertyRow);
}

export async function removeProperty(id: string): Promise<void> {
  const { error } = await client().from("properties").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function duplicatePropertyRecord(property: Property): Promise<Property> {
  const copy: Property = {
    ...structuredClone(property),
    id: "draft-copy",
    slug: `${property.slug}-copia`,
    reference: `${property.reference}-B`,
    published: false,
    featured: false,
    status: "available",
  };
  return upsertProperty(copy);
}

/* ------------------------------------------------------------------ *
 * Media
 * ------------------------------------------------------------------ */

/** Carica un file nel bucket e restituisce l'URL pubblico. */
export async function uploadMedia(file: File, folder = "properties"): Promise<string> {
  const supabase = client();
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "bin";
  const path = `${folder}/${crypto.randomUUID()}.${extension}`;

  const { error } = await supabase.storage.from(MEDIA_BUCKET).upload(path, file, {
    cacheControl: "31536000",
    upsert: false,
    contentType: file.type || undefined,
  });
  if (error) throw new Error(error.message);

  return supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path).data.publicUrl;
}

/** Elimina un file dal bucket a partire dal suo URL pubblico. */
export async function removeMedia(publicUrl: string): Promise<void> {
  const marker = `/${MEDIA_BUCKET}/`;
  const index = publicUrl.indexOf(marker);
  if (index === -1) return; // non è un file nostro (URL esterno o /demo)

  const path = publicUrl.slice(index + marker.length);
  await client().storage.from(MEDIA_BUCKET).remove([path]);
}
