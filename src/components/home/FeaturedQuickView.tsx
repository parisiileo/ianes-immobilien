"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowUpRight, Phone, X } from "lucide-react";
import { useLocale } from "@/i18n/LocaleProvider";
import { useProperties } from "@/components/PropertiesProvider";
import { COMPANY } from "@/lib/company";
import { formatArea, formatListingPrice } from "@/lib/format";
import { CoverImage } from "@/components/property/CoverImage";
import { PropertyCard } from "@/components/property/PropertyCard";
import { Reveal, SplitReveal } from "@/components/ui/SplitText";
import { cn } from "@/lib/cn";
import type { Property } from "@/types/property";

/**
 * Proprietà in evidenza, subito sotto l'hero.
 *
 * Formato "vista rapida": card strette da scorrere con l'occhio e un pannello
 * che apre i dati essenziali senza lasciare la home. Chi vuole approfondire
 * passa alla scheda completa, ma la maggior parte delle domande (prezzo,
 * metratura, camere, classe energetica) trova risposta qui.
 */
export function FeaturedQuickView() {
  const { t, link, locale } = useLocale();
  const properties = useProperties();
  const [preview, setPreview] = useState<Property | null>(null);

  const featured = properties.filter((property) => property.featured).slice(0, 4);
  const items = featured.length > 0 ? featured : properties.slice(0, 4);

  useEffect(() => {
    if (!preview) return;
    document.documentElement.style.overflow = "hidden";
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setPreview(null);
    }
    document.addEventListener("keydown", onKey);
    return () => {
      document.documentElement.style.overflow = "";
      document.removeEventListener("keydown", onKey);
    };
  }, [preview]);

  if (items.length === 0) return null;

  const priceOf = (property: Property) =>
    property.priceOnRequest
      ? t.common.priceOnRequest
      : formatListingPrice(property.price, locale, property.listingType, t.common.perMonth);

  return (
    <section className="relative border-b border-line bg-surface py-20 md:py-28" aria-labelledby="quick-title">
      <div className="shell">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-xl">
            <SplitReveal
              as="h2"
              className="font-display text-[clamp(2rem,4.2vw,3.2rem)] leading-[1.04] text-ink"
            >
              {t.home.featured.title}
            </SplitReveal>
          </div>

          <Reveal delay={0.15}>
            <Link
              href={link("proprieta")}
              className="group flex items-center gap-3 border-b border-line pb-2 text-[0.7rem] uppercase tracking-[0.16em] text-ink/65 transition-colors hover:border-champagne hover:text-champagne"
            >
              {t.common.viewAll}
              <ArrowUpRight
                size={14}
                strokeWidth={1.4}
                className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </Link>
          </Reveal>
        </div>

        {/* Stessa scheda della listing: una sola implementazione da mantenere. */}
        {/* Quattro colonne solo sugli schermi molto larghi: sotto i 1536px
            le schede diventerebbero troppo strette per il titolo. */}
        <Reveal stagger={0.09} className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:gap-8 2xl:grid-cols-4">
          {items.map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
              onQuickView={setPreview}
              sizes="(max-width: 640px) 92vw, (max-width: 1280px) 46vw, 24vw"
            />
          ))}
        </Reveal>
      </div>

      {/* ---------------------- Pannello vista rapida ---------------------- */}
      {preview && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={preview.content[locale].title}
          className="fixed inset-0 z-[95] flex items-end justify-center bg-ink/45 p-0 backdrop-blur-sm sm:items-center sm:p-6"
        >
          <button
            type="button"
            aria-label={t.nav.close}
            onClick={() => setPreview(null)}
            className="absolute inset-0 cursor-default"
          />

          <div className="panel relative z-10 max-h-[92vh] w-full max-w-4xl animate-[fade-up_0.4s_var(--ease-luxe)_both] overflow-y-auto">
            <button
              type="button"
              onClick={() => setPreview(null)}
              aria-label={t.nav.close}
              className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center border border-line bg-surface/90 text-ink/60 backdrop-blur-sm transition-colors hover:text-ink"
            >
              <X size={16} strokeWidth={1.4} />
            </button>

            <div className="grid md:grid-cols-2">
              <div className="relative aspect-[4/3] bg-surface-soft md:aspect-auto md:min-h-[26rem]">
                <CoverImage
                  image={preview.images[0]}
                  className="absolute inset-0"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  imageClassName="object-cover"
                />
              </div>

              <div className="flex flex-col p-7 md:p-9">
                <p className="text-[0.6rem] uppercase tracking-[0.16em] text-champagne">
                  {preview.location.city}
                  {preview.location.zone ? ` · ${preview.location.zone}` : ""} · {t.common.reference}{" "}
                  {preview.reference}
                </p>
                <h3 className="mt-3 font-display text-3xl leading-tight text-ink">
                  {preview.content[locale].title}
                </h3>
                <p className="mt-2 text-sm text-ink/60">{preview.content[locale].subtitle}</p>

                <dl className="mt-6 grid grid-cols-2 gap-px border border-line bg-line">
                  {[
                    { label: t.property.surface, value: formatArea(preview.surfaceSqm, locale) },
                    { label: t.property.bedrooms, value: String(preview.bedrooms) },
                    { label: t.property.bathrooms, value: String(preview.bathrooms) },
                    { label: t.property.energyClass, value: preview.energyClass },
                  ].map((fact) => (
                    <div key={fact.label} className="bg-surface px-5 py-4">
                      <dt className="text-[0.55rem] uppercase tracking-[0.14em] text-ink/60">{fact.label}</dt>
                      <dd className="mt-1.5 font-display text-lg text-ink">{fact.value}</dd>
                    </div>
                  ))}
                </dl>

                {preview.content[locale].highlights.length > 0 && (
                  <ul className="mt-5 space-y-1.5">
                    {preview.content[locale].highlights.slice(0, 3).map((highlight) => (
                      <li key={highlight} className="flex gap-2.5 text-xs leading-relaxed text-ink/60">
                        <span aria-hidden className="mt-1.5 h-px w-3 shrink-0 bg-champagne" />
                        {highlight}
                      </li>
                    ))}
                  </ul>
                )}

                <p className="mt-6 font-display text-2xl text-ink">{priceOf(preview)}</p>

                <div className="mt-5 flex flex-wrap gap-3">
                  <Link
                    href={link(`proprieta/${preview.slug}`)}
                    className={cn(
                      "flex items-center gap-2 bg-ink px-6 py-3 text-[0.66rem] uppercase tracking-[0.14em]",
                      "text-surface transition-colors hover:bg-champagne-deep",
                    )}
                  >
                    {t.common.details}
                    <ArrowUpRight size={13} strokeWidth={1.5} />
                  </Link>
                  <a
                    href={`tel:${COMPANY.phoneHref}`}
                    className="flex items-center gap-2 border border-line px-6 py-3 text-[0.66rem] uppercase tracking-[0.14em] text-ink/70 transition-colors hover:border-champagne hover:text-champagne"
                  >
                    <Phone size={13} strokeWidth={1.4} />
                    {t.property.callNow}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
