/**
 * Configurazione Supabase.
 *
 * Il sito deve poter girare anche prima che il progetto Supabase esista
 * (sviluppo del front-end, build di anteprima): quando le variabili mancano
 * i client restituiscono `null` e le query rispondono con elenchi vuoti,
 * mostrando gli empty state invece di far fallire il render.
 */
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

/** Bucket dei media immobiliari creato dalla migration 20260808120100_storage.sql */
export const MEDIA_BUCKET = "property-media";
