import "server-only";

import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_ANON_KEY, SUPABASE_URL, isSupabaseConfigured } from "./env";

/**
 * Client anonimo senza cookie.
 *
 * Usato per tutte le letture pubbliche (home, listing, schede, sitemap):
 * non tocca `cookies()`, quindi le pagine restano prerenderizzabili e
 * rigenerabili con ISR invece di diventare dinamiche a ogni richiesta.
 */
export function createPublicClient(): SupabaseClient | null {
  if (!isSupabaseConfigured) return null;
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/**
 * Client legato alla sessione dell'utente (cookie).
 * Serve nei server component/route handler che devono sapere *chi* è loggato.
 */
export async function createServerSupabaseClient(): Promise<SupabaseClient | null> {
  if (!isSupabaseConfigured) return null;
  const cookieStore = await cookies();

  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Chiamato da un Server Component: il refresh del token viene
          // comunque gestito dal middleware, quindi si può ignorare.
        }
      },
    },
  });
}
