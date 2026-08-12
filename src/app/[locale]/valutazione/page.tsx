import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n";
import { buildMetadata } from "@/lib/seo";
import { breadcrumbSchema } from "@/lib/jsonld";
import { JsonLd } from "@/components/seo/JsonLd";
import { PageHeader } from "@/components/layout/PageHeader";
import { ValuationForm } from "./ValuationForm";

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
    path: "valutazione",
    title: t.meta.valuation.title,
    description: t.meta.valuation.description,
  });
}

export default async function ValuationPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getDictionary(locale);

  return (
    <>
      <JsonLd
        data={breadcrumbSchema(
          [
            { name: t.nav.home, path: "" },
            { name: t.nav.valuation, path: "valutazione" },
          ],
          locale,
        )}
      />

      <PageHeader
        title={t.valuation.title}
        lead={t.valuation.subtitle}
        crumbs={[{ label: t.nav.valuation }]}
      />

      <section className="bg-surface py-24">
        <div className="shell grid gap-16 lg:grid-cols-[0.9fr_1.1fr] lg:gap-24">
          <ol className="space-y-10">
            {t.valuation.steps.map((step, index) => (
              <li key={step.title} className="flex gap-6 border-b border-line pb-8 last:border-0">
                <span className="font-display text-4xl text-champagne/60">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div>
                  <h2 className="font-display text-2xl text-ink">{step.title}</h2>
                  <p className="mt-3 text-sm leading-relaxed text-ink/60">{step.text}</p>
                </div>
              </li>
            ))}
          </ol>

          <ValuationForm />
        </div>
      </section>
    </>
  );
}
