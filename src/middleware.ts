import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { DEFAULT_LOCALE, isLocale, type Locale } from "@/i18n/config";
import { SUPABASE_ANON_KEY, SUPABASE_URL, isSupabaseConfigured } from "@/lib/supabase/env";

const LOCALE_COOKIE = "ianes.locale";

/** Sceglie la lingua da cookie → Accept-Language → default italiano. */
function detectLocale(request: NextRequest): Locale {
  const cookie = request.cookies.get(LOCALE_COOKIE)?.value;
  if (isLocale(cookie)) return cookie;

  const header = request.headers.get("accept-language");
  if (header) {
    const preferred = header
      .split(",")
      .map((part) => {
        const [tag, q] = part.trim().split(";q=");
        return { tag: tag.toLowerCase(), q: q ? Number(q) : 1 };
      })
      .sort((a, b) => b.q - a.q);

    for (const { tag } of preferred) {
      const base = tag.split("-")[0];
      if (isLocale(base)) return base;
    }
  }
  return DEFAULT_LOCALE;
}

/**
 * Rinnova il token di sessione Supabase e riscrive i cookie sulla risposta.
 * Serve solo sull'area riservata: sul sito pubblico non c'è sessione da tenere
 * viva e ogni chiamata sarebbe latenza sprecata.
 */
async function refreshSession(request: NextRequest, response: NextResponse) {
  if (!isSupabaseConfigured) return;

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  await supabase.auth.getUser();
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const segment = pathname.split("/")[1];

  if (!isLocale(segment)) {
    const url = request.nextUrl.clone();
    url.pathname = `/${detectLocale(request)}${pathname === "/" ? "" : pathname}`;
    return NextResponse.redirect(url);
  }

  const response = NextResponse.next({ request });
  if (pathname.includes("/admin")) await refreshSession(request, response);
  return response;
}

export const config = {
  /*
    Esclude le risorse interne di Next e **qualsiasi path con estensione**
    (immagini, robots.txt, sitemap.xml, favicon…). Elencare le cartelle una
    per una era fragile: appena si è aggiunta /hero il middleware ha iniziato
    a redirigere le foto su /it/hero/... facendole fallire con 404.
    Le rotte del sito non contengono mai un punto, quindi restano coperte.
  */
  matcher: ["/((?!_next/|api/|icon|apple-icon|favicon|.*\\.[a-zA-Z0-9]+$).*)"],
};
