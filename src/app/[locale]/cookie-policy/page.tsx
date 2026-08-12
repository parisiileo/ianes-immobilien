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
    path: "cookie-policy",
    title: t.meta.cookie.title,
    description: t.meta.cookie.description,
  });
}

export default async function CookiePolicyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getDictionary(locale);
  const document = getLegalDocument("cookie", locale);

  return (
    <>
      <JsonLd
        data={breadcrumbSchema(
          [
            { name: t.nav.home, path: "" },
            { name: document.title, path: "cookie-policy" },
          ],
          locale,
        )}
      />
      <PageHeader eyebrow={t.footer.legalTitle} title={document.title} crumbs={[{ label: t.cookie.policyLink }]} />
      <LegalArticle document={document} showCookieButton />
    </>
  );
}
