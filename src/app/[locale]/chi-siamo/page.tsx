import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MapPin, Phone, Mail, Star } from "lucide-react";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n";
import { buildMetadata } from "@/lib/seo";
import { breadcrumbSchema } from "@/lib/jsonld";
import { JsonLd } from "@/components/seo/JsonLd";
import { COMPANY } from "@/lib/company";
import { PageHeader } from "@/components/layout/PageHeader";
import { CtaBand } from "@/components/home/CtaBand";

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
    path: "chi-siamo",
    title: t.meta.about.title,
    description: t.meta.about.description,
  });
}

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getDictionary(locale);

  const offices = [
    { label: t.about.localOffice, data: COMPANY.localOffice },
    { label: t.about.registeredOffice, data: COMPANY.registeredOffice },
  ];

  return (
    <>
      <JsonLd
        data={breadcrumbSchema(
          [
            { name: t.nav.home, path: "" },
            { name: t.nav.about, path: "chi-siamo" },
          ],
          locale,
        )}
      />

      <PageHeader
        title={t.about.title}
        lead={t.about.lead}
        crumbs={[{ label: t.nav.about }]}
      />

      <section className="bg-surface py-24">
        <div className="shell grid gap-16 lg:grid-cols-[0.85fr_1.15fr]">
          {/* Dati societari al posto di una fotografia di repertorio. */}
          <aside className="glass-light flex h-fit flex-col gap-px self-start bg-line lg:sticky lg:top-32">
            {[
              { label: t.footer.companyTitle, value: COMPANY.legalName },
              { label: t.footer.vat, value: COMPANY.vat },
              { label: t.footer.rea, value: COMPANY.rea },
              {
                label: t.about.registeredOffice,
                value: `${COMPANY.registeredOffice.street}, ${COMPANY.registeredOffice.postalCode} ${COMPANY.registeredOffice.city} (${COMPANY.registeredOffice.province})`,
              },
              {
                label: t.about.localOffice,
                value: `${COMPANY.localOffice.street}, ${COMPANY.localOffice.postalCode} ${COMPANY.localOffice.city} (${COMPANY.localOffice.province})`,
              },
              { label: t.contact.phoneLabel, value: COMPANY.phone },
              { label: t.contact.pecLabel, value: COMPANY.pec },
            ].map((item) => (
              <div key={item.label} className="bg-surface px-7 py-5">
                <p className="text-[0.6rem] uppercase tracking-[0.14em] text-ink/60">{item.label}</p>
                <p className="mt-2 text-sm leading-relaxed text-ink/80">{item.value}</p>
              </div>
            ))}
          </aside>

          <div className="flex flex-col justify-center">
            {t.about.body.map((paragraph) => (
              <p key={paragraph.slice(0, 24)} className="mb-6 text-[0.95rem] leading-[1.85] text-ink/60">
                {paragraph}
              </p>
            ))}

            <div className="mt-6 grid gap-px bg-line sm:grid-cols-3">
              {t.about.values.map((value) => (
                <div key={value.title} className="bg-surface p-6">
                  <h2 className="font-display text-xl text-ink">{value.title}</h2>
                  <p className="mt-3 text-xs leading-relaxed text-ink/60">{value.text}</p>
                </div>
              ))}
            </div>

            <div className="mt-10 flex items-center gap-4 border-t border-line pt-8">
              <span className="font-display text-4xl text-champagne">{COMPANY.rating.value}</span>
              <div>
                <div className="flex gap-0.5" aria-label={t.a11y.ratingLabel}>
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star
                      key={index}
                      size={13}
                      strokeWidth={1}
                      className={
                        /* Stella vuota: grafica, soglia 3:1 — vedi GoogleRating. */
                        index < Math.round(COMPANY.rating.value) ? "fill-champagne text-champagne" : "text-ink/50"
                      }
                    />
                  ))}
                </div>
                <p className="mt-1.5 text-xs text-ink/60">
                  {t.home.reviews.basedOn.replace("{count}", String(COMPANY.rating.count))}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-line bg-surface-soft py-24" aria-labelledby="offices-title">
        <div className="shell">
          <h2 id="offices-title" className="font-display text-[clamp(2rem,3.6vw,3rem)] text-ink">
            {t.about.officesTitle}
          </h2>

          <div className="mt-12 grid gap-px bg-line md:grid-cols-2">
            {offices.map((office) => (
              <address key={office.label} className="bg-surface-soft p-10 not-italic">
                <p className="eyebrow">{office.label}</p>
                <p className="mt-5 flex items-start gap-3 text-sm text-ink/70">
                  <MapPin size={14} strokeWidth={1.4} className="mt-1 shrink-0 text-champagne" />
                  <span>
                    {office.data.street}
                    <br />
                    {office.data.postalCode} {office.data.city} ({office.data.province})
                    <br />
                    {office.data.countryName}
                  </span>
                </p>
                <p className="mt-5 flex items-center gap-3 text-sm text-ink/70">
                  <Phone size={14} strokeWidth={1.4} className="shrink-0 text-champagne" />
                  <a href={`tel:${COMPANY.phoneHref}`} className="hover:text-champagne">
                    {COMPANY.phone}
                  </a>
                </p>
                <p className="mt-3 flex items-center gap-3 text-sm text-ink/70">
                  <Mail size={14} strokeWidth={1.4} className="shrink-0 text-champagne" />
                  <a href={`mailto:${COMPANY.pec}`} className="hover:text-champagne">
                    {COMPANY.pec}
                  </a>
                </p>
              </address>
            ))}
          </div>

          <dl className="mt-12 grid gap-8 border-t border-line pt-10 text-xs text-ink/60 sm:grid-cols-3">
            <div>
              <dt className="uppercase tracking-[0.14em] text-ink/60">{t.footer.vat}</dt>
              <dd className="mt-2 text-ink/70">{COMPANY.vat}</dd>
            </div>
            <div>
              <dt className="uppercase tracking-[0.14em] text-ink/60">{t.footer.rea}</dt>
              <dd className="mt-2 text-ink/70">{COMPANY.rea}</dd>
            </div>
            <div>
              <dt className="uppercase tracking-[0.14em] text-ink/60">PEC</dt>
              <dd className="mt-2 text-ink/70">{COMPANY.pec}</dd>
            </div>
          </dl>
        </div>
      </section>

      <CtaBand />
    </>
  );
}
