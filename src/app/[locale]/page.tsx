import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n";
import { buildMetadata } from "@/lib/seo";
import { breadcrumbSchema, itemListSchema } from "@/lib/jsonld";
import { JsonLd } from "@/components/seo/JsonLd";
import { fetchPublishedProperties } from "@/lib/properties/queries";

import { Hero } from "@/components/home/Hero";
import { FeaturedQuickView } from "@/components/home/FeaturedQuickView";
import { ExpandingShowcase } from "@/components/home/ExpandingShowcase";
import { HorizontalCollection } from "@/components/home/HorizontalCollection";
import { Services } from "@/components/home/Services";
import { Regions } from "@/components/home/Regions";
import { GoogleRating } from "@/components/home/GoogleRating";
import { Newsletter } from "@/components/home/Newsletter";
import { CtaBand } from "@/components/home/CtaBand";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = getDictionary(locale);
  return buildMetadata({ locale, title: t.meta.home.title, description: t.meta.home.description });
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getDictionary(locale);
  const featured = (await fetchPublishedProperties()).filter((property) => property.featured);

  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema([{ name: t.nav.home, path: "" }], locale),
          ...(featured.length ? [itemListSchema(featured, locale)] : []),
        ]}
      />

      <Hero />
      <FeaturedQuickView />
      <ExpandingShowcase />
      <HorizontalCollection />
      <Services />
      <Regions />
      <GoogleRating />
      <Newsletter />
      <CtaBand />
    </>
  );
}
