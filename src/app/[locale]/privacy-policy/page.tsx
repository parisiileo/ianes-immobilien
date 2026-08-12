import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n";
import { buildMetadata } from "@/lib/seo";
import { breadcrumbSchema } from "@/lib/jsonld";
import { JsonLd } from "@/components/seo/JsonLd";
import { getLegalDocument } from "@/data/legal";
import { PageHeader } from "@/components/layout/PageHeader";
import { LegalArticle } from "@/components/layout/LegalArticle";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = getDictionary(locale);
  return buildMetadata({
    locale,
    path: "privacy-policy",
    title: t.meta.privacy.title,
    description: t.meta.privacy.description,
  });
}

export default async function PrivacyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getDictionary(locale);
  const document = getLegalDocument("privacy", locale);

  return (
    <>
      <JsonLd
        data={breadcrumbSchema(
          [
            { name: t.nav.home, path: "" },
            { name: document.title, path: "privacy-policy" },
          ],
          locale,
        )}
      />
      <PageHeader
        title={document.title}
        crumbs={[{ label: t.cookie.privacyLink }]}
      />
      <LegalArticle document={document} />
    </>
  );
}
