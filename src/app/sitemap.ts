import type { MetadataRoute } from "next";
import { LOCALES, LOCALE_TAGS, href } from "@/i18n/config";
import { absoluteUrl } from "@/lib/seo";
import { fetchPublishedSlugs } from "@/lib/properties/queries";

export const revalidate = 300;

/**
 * Sitemap multilingua: ogni URL dichiara le varianti `alternates.languages`,
 * così Google associa correttamente le tre versioni linguistiche.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPaths: Array<{
    path: string;
    priority: number;
    changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  }> = [
    { path: "", priority: 1, changeFrequency: "weekly" },
    { path: "proprieta", priority: 0.9, changeFrequency: "daily" },
    { path: "chi-siamo", priority: 0.6, changeFrequency: "yearly" },
    { path: "valutazione", priority: 0.7, changeFrequency: "monthly" },
    { path: "contatti", priority: 0.6, changeFrequency: "yearly" },
    { path: "privacy-policy", priority: 0.2, changeFrequency: "yearly" },
    { path: "cookie-policy", priority: 0.2, changeFrequency: "yearly" },
    { path: "termini-e-condizioni", priority: 0.2, changeFrequency: "yearly" },
  ];

  const languagesFor = (path: string) =>
    Object.fromEntries(LOCALES.map((locale) => [LOCALE_TAGS[locale], absoluteUrl(href(locale, path).slice(1))]));

  const entries: MetadataRoute.Sitemap = [];

  for (const { path, priority, changeFrequency } of staticPaths) {
    for (const locale of LOCALES) {
      entries.push({
        url: absoluteUrl(href(locale, path).slice(1)),
        lastModified: new Date(),
        changeFrequency,
        priority,
        alternates: { languages: languagesFor(path) },
      });
    }
  }

  for (const property of await fetchPublishedSlugs()) {
    const path = `proprieta/${property.slug}`;
    for (const locale of LOCALES) {
      entries.push({
        url: absoluteUrl(href(locale, path).slice(1)),
        lastModified: new Date(property.updatedAt),
        changeFrequency: "weekly",
        priority: property.featured ? 0.9 : 0.8,
        alternates: { languages: languagesFor(path) },
      });
    }
  }

  return entries;
}
