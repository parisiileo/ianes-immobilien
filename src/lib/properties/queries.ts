import "server-only";

import { createPublicClient } from "@/lib/supabase/server";
import { DEMO_PROPERTIES } from "@/data/demo-properties";
import { rowToProperty, type PropertyRow } from "./mapper";
import type { Property } from "@/types/property";

const COLUMNS = "*";

/**
 * Cosa mostrare quando Supabase non è configurato.
 *
 * In sviluppo: le schede dimostrative, così il sito si può guardare subito.
 * In produzione: niente — un deploy senza database mostra gli empty state,
 * mai contenuti inventati.
 */
function fallbackProperties(): Property[] {
  return process.env.NODE_ENV === "production" ? [] : DEMO_PROPERTIES;
}

/**
 * Letture pubbliche.
 *
 * La RLS lascia passare solo `published = true`, ma il filtro è ripetuto
 * anche qui: se un domani la policy venisse allentata, il sito pubblico
 * continuerebbe a non mostrare le bozze.
 */
export async function fetchPublishedProperties(): Promise<Property[]> {
  const supabase = createPublicClient();
  if (!supabase) return fallbackProperties();

  const { data, error } = await supabase
    .from("properties")
    .select(COLUMNS)
    .eq("published", true)
    .order("featured", { ascending: false })
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("[properties] fetchPublishedProperties:", error.message);
    return [];
  }
  return (data as PropertyRow[]).map(rowToProperty);
}

export async function fetchPropertyBySlug(slug: string): Promise<Property | null> {
  const supabase = createPublicClient();
  if (!supabase) return fallbackProperties().find((property) => property.slug === slug) ?? null;

  const { data, error } = await supabase
    .from("properties")
    .select(COLUMNS)
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();

  if (error) {
    console.error("[properties] fetchPropertyBySlug:", error.message);
    return null;
  }
  return data ? rowToProperty(data as PropertyRow) : null;
}

/** Slug pubblicati: alimenta `generateStaticParams` e la sitemap. */
export async function fetchPublishedSlugs(): Promise<Array<{ slug: string; updatedAt: string; featured: boolean }>> {
  const supabase = createPublicClient();
  if (!supabase) {
    return fallbackProperties().map((property) => ({
      slug: property.slug,
      updatedAt: property.updatedAt,
      featured: property.featured,
    }));
  }

  const { data, error } = await supabase
    .from("properties")
    .select("slug, updated_at, featured")
    .eq("published", true);

  if (error) {
    console.error("[properties] fetchPublishedSlugs:", error.message);
    return [];
  }
  return (data as Array<{ slug: string; updated_at: string; featured: boolean }>).map((row) => ({
    slug: row.slug,
    updatedAt: row.updated_at,
    featured: row.featured,
  }));
}
