import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n";
import { buildMetadata } from "@/lib/seo";
import { breadcrumbSchema } from "@/lib/jsonld";
import { JsonLd } from "@/components/seo/JsonLd";
import { COMPANY } from "@/lib/company";
import { PageHeader } from "@/components/layout/PageHeader";
import { ContactForm } from "./ContactForm";

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
    path: "contatti",
    title: t.meta.contact.title,
    description: t.meta.contact.description,
  });
}

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getDictionary(locale);

  return (
    <>
      <JsonLd
        data={breadcrumbSchema(
          [
            { name: t.nav.home, path: "" },
            { name: t.nav.contact, path: "contatti" },
          ],
          locale,
        )}
      />

      <PageHeader
        title={t.contact.title}
        lead={t.contact.subtitle}
        crumbs={[{ label: t.nav.contact }]}
      />

      <section className="bg-surface py-24">
        <div className="shell grid gap-16 lg:grid-cols-[1fr_1.1fr] lg:gap-24">
          <div>
            <h2 className="eyebrow">{t.contact.directTitle}</h2>

            <ul className="mt-8 space-y-7">
              <li className="flex items-start gap-4">
                <Phone size={16} strokeWidth={1.3} className="mt-1 shrink-0 text-champagne" />
                <div>
                  <p className="text-[0.62rem] uppercase tracking-[0.14em] text-ink/60">{t.contact.phoneLabel}</p>
                  <a
                    href={`tel:${COMPANY.phoneHref}`}
                    className="mt-1 block font-display text-2xl text-ink transition-colors hover:text-champagne"
                  >
                    {COMPANY.phone}
                  </a>
                </div>
              </li>

              <li className="flex items-start gap-4">
                <Mail size={16} strokeWidth={1.3} className="mt-1 shrink-0 text-champagne" />
                <div>
                  <p className="text-[0.62rem] uppercase tracking-[0.14em] text-ink/60">{t.contact.pecLabel}</p>
                  <a
                    href={`mailto:${COMPANY.pec}`}
                    className="mt-1 block text-lg text-ink transition-colors hover:text-champagne"
                  >
                    {COMPANY.pec}
                  </a>
                </div>
              </li>

              <li className="flex items-start gap-4">
                <MapPin size={16} strokeWidth={1.3} className="mt-1 shrink-0 text-champagne" />
                <div className="space-y-4">
                  <div>
                    <p className="text-[0.62rem] uppercase tracking-[0.14em] text-ink/60">{t.about.localOffice}</p>
                    <address className="mt-1 text-sm not-italic leading-relaxed text-ink/70">
                      {COMPANY.localOffice.street}
                      <br />
                      {COMPANY.localOffice.postalCode} {COMPANY.localOffice.city} ({COMPANY.localOffice.province})
                    </address>
                  </div>
                  <div>
                    <p className="text-[0.62rem] uppercase tracking-[0.14em] text-ink/60">
                      {t.about.registeredOffice}
                    </p>
                    <address className="mt-1 text-sm not-italic leading-relaxed text-ink/70">
                      {COMPANY.registeredOffice.street}
                      <br />
                      {COMPANY.registeredOffice.postalCode} {COMPANY.registeredOffice.city} (
                      {COMPANY.registeredOffice.province})
                    </address>
                  </div>
                </div>
              </li>

              <li className="flex items-start gap-4">
                <Clock size={16} strokeWidth={1.3} className="mt-1 shrink-0 text-champagne" />
                <div>
                  <p className="text-[0.62rem] uppercase tracking-[0.14em] text-ink/60">{t.contact.hoursTitle}</p>
                  <ul className="mt-2 space-y-1 text-sm text-ink/70">
                    <li>{t.contact.hoursWeek}</li>
                    <li>{t.contact.hoursSat}</li>
                    <li className="text-ink/60">{t.contact.hoursSun}</li>
                  </ul>
                </div>
              </li>
            </ul>

            <p className="mt-10 border-t border-line pt-6 text-xs leading-relaxed text-ink/60">
              {COMPANY.legalName} · {t.footer.vat} {COMPANY.vat} · {t.footer.rea} {COMPANY.rea}
            </p>
          </div>

          <ContactForm />
        </div>
      </section>
    </>
  );
}
