import type { MetadataRoute } from "next";
import { ALLOW_INDEXING, SITE_URL } from "@/lib/company";

export default function robots(): MetadataRoute.Robots {
  // Anteprime e domini non canonici: chiusi del tutto, e senza sitemap, così
  // ai crawler non si offre nemmeno l'elenco degli URL da visitare.
  if (!ALLOW_INDEXING) {
    return { rules: [{ userAgent: "*", disallow: "/" }] };
  }

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // L'area riservata non deve finire in indice in nessuna lingua.
        disallow: ["/admin", "/it/admin", "/de/admin", "/en/admin", "/api/"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
