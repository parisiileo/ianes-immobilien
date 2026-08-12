import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n";
import { buildMetadata } from "@/lib/seo";
import { breadcrumbSchema, itemListSchema } from "@/lib/jsonld";
import { JsonLd } from "@/components/seo/JsonLd";
import { fetchPublishedProperties } from "@/lib/properties/queries";
import { PropertiesView } from "./PropertiesView";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = getDictionary(locale);
  const [first] = await fetchPublishedProperties();
  return buildMetadata({
    locale,
    path: "proprieta",
    title: t.meta.properties.title,
    description: t.meta.properties.description,
    image: first?.images[0]?.src,
  });
}

export default async function PropertiesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getDictionary(locale);
  const properties = await fetchPublishedProperties();

  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema(
            [
              { name: t.nav.home, path: "" },
              { name: t.nav.properties, path: "proprieta" },
            ],
            locale,
          ),
          ...(properties.length ? [itemListSchema(properties, locale)] : []),
        ]}
      />

      <PropertiesView />
    </>
  );
}
