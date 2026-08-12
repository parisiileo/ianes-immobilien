import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LOCALES, isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n";
import { buildMetadata } from "@/lib/seo";
import { breadcrumbSchema, propertySchema } from "@/lib/jsonld";
import { JsonLd } from "@/components/seo/JsonLd";
import { fetchPropertyBySlug, fetchPublishedSlugs } from "@/lib/properties/queries";
import { PropertyView } from "./PropertyView";

export const revalidate = 300;
/** Uno slug pubblicato dopo la build viene reso al primo accesso, non 404. */
export const dynamicParams = true;

/** Pre-genera le 3 lingue × ogni immobile pubblicato al momento della build. */
export async function generateStaticParams() {
  const slugs = await fetchPublishedSlugs();
  return LOCALES.flatMap((locale) => slugs.map(({ slug }) => ({ locale, slug })));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};

  const property = await fetchPropertyBySlug(slug);
  if (!property) return {};

  const content = property.content[locale];
  return buildMetadata({
    locale,
    path: `proprieta/${property.slug}`,
    title: `${content.title} — ${property.location.city} | Ianes Immobilien`,
    description: content.metaDescription,
    image: property.images[0]?.src,
    imageAlt: property.images[0]?.alt[locale],
    type: "article",
  });
}

export default async function PropertyPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();

  const property = await fetchPropertyBySlug(slug);
  if (!property) notFound();

  const t = getDictionary(locale);

  return (
    <>
      <JsonLd
        data={[
          propertySchema(property, locale),
          breadcrumbSchema(
            [
              { name: t.nav.home, path: "" },
              { name: t.nav.properties, path: "proprieta" },
              { name: property.content[locale].title, path: `proprieta/${property.slug}` },
            ],
            locale,
          ),
        ]}
      />
      <PropertyView initialProperty={property} />
    </>
  );
}
