"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Bath,
  BedDouble,
  Building2,
  CalendarClock,
  Check,
  Flame,
  Layers,
  Maximize,
  Phone,
  Ruler,
  Zap,
} from "lucide-react";
import { useLocale } from "@/i18n/LocaleProvider";
import { COMPANY } from "@/lib/company";
import { useProperties } from "@/components/PropertiesProvider";
import { formatArea, formatListingPrice, formatNumber } from "@/lib/format";
import { CoverImage } from "@/components/property/CoverImage";
import { Gallery } from "@/components/property/Gallery";
import { EnergyDiagnosis } from "@/components/property/EnergyDiagnosis";
import { MapPanel } from "@/components/property/MapPanel";
import { PropertyCard } from "@/components/property/PropertyCard";
import { BrochureModal } from "@/components/property/BrochureModal";
import { Reveal, SplitReveal } from "@/components/ui/SplitText";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { cn } from "@/lib/cn";
import type { Property } from "@/types/property";

/**
 * Ancore dentro i termini e condizioni. Gli id delle sezioni sono gli stessi
 * nelle tre lingue (vedi src/data/legal.ts), quindi basta comporli con il
 * percorso già tradotto.
 *
 * `mediazione` è la sezione sulla provvigione: quando e in che misura è
 * dovuta. `annunci` è quella che avverte che i dati tecnici ed energetici
 * arrivano dalla proprietà e vanno confermati in due diligence — è la nota
 * che serve a chi legge la diagnosi energetica.
 */
const FEE_TERMS_ANCHOR = "mediazione";
const DIAGNOSIS_TERMS_ANCHOR = "annunci";

export function PropertyView({ initialProperty }: { initialProperty: Property }) {
  const { t, link, locale } = useLocale();
  const properties = useProperties();
  // Lo store client può contenere una versione più recente (modifiche da /admin).
  const property = properties.find((item) => item.id === initialProperty.id) ?? initialProperty;
  const content = property.content[locale];

  const [brochureOpen, setBrochureOpen] = useState(false);
  const [barVisible, setBarVisible] = useState(false);
  const heroRef = useRef<HTMLElement>(null);
  const heroImageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;

    const observer = new IntersectionObserver(([entry]) => setBarVisible(!entry.isIntersecting), {
      rootMargin: "-120px 0px 0px 0px",
    });
    observer.observe(hero);

    let ctx: gsap.Context | undefined;
    if (!prefersReducedMotion()) {
      ctx = gsap.context(() => {
        gsap.to(heroImageRef.current, {
          yPercent: 14,
          scale: 1.06,
          ease: "none",
          scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: true },
        });
      }, hero);
    }

    return () => {
      observer.disconnect();
      ctx?.revert();
    };
  }, [property.id]);

  const termsHref = link("termini-e-condizioni");

  const priceLabel = property.priceOnRequest
    ? t.common.priceOnRequest
    : formatListingPrice(property.price, locale, property.listingType, t.common.perMonth);

  const keyFacts = [
    { icon: Maximize, label: t.property.surface, value: formatArea(property.surfaceSqm, locale) },
    ...(property.lotSqm
      ? [{ icon: Ruler, label: t.property.lot, value: formatArea(property.lotSqm, locale) }]
      : []),
    { icon: BedDouble, label: t.property.bedrooms, value: String(property.bedrooms) },
    { icon: Bath, label: t.property.bathrooms, value: String(property.bathrooms) },
    { icon: Zap, label: t.property.energyClass, value: property.energyClass },
    { icon: CalendarClock, label: t.property.year, value: String(property.constructionYear) },
  ];

  const specs: Array<[string, string]> = [
    [t.property.reference, property.reference],
    [t.property.category, t.enums.category[property.category]],
    [t.property.status, t.enums.status[property.status]],
    [t.filters.listingType, t.enums.listingTypeShort[property.listingType]],
    [t.property.rooms, String(property.rooms)],
    ...(property.floor ? ([[t.property.floor, property.floor]] as Array<[string, string]>) : []),
    ...(property.floors ? ([[t.property.floors, String(property.floors)]] as Array<[string, string]>) : []),
    [t.property.heating, t.enums.heating[property.heating]],
    ...(property.energyIndex
      ? ([[t.property.energyIndex, `${formatNumber(property.energyIndex, locale)} kWh/m²a`]] as Array<
          [string, string]
        >)
      : []),
    ...(property.renovationYear
      ? ([[t.property.renovation, String(property.renovationYear)]] as Array<[string, string]>)
      : []),
    [t.property.location, `${property.location.address}, ${property.location.city} (${property.location.province})`],
  ];

  /**
   * Informazioni legali dell'annuncio.
   *
   * Le due righe sul condominio compaiono sempre, anche quando la risposta è
   * «no»: è l'assenza dichiarata a essere informativa, e un annuncio che le
   * ometta lascia la domanda aperta.
   */
  const legalRows: Array<{
    label: string;
    value: string;
    note?: string;
    link?: { href: string; label: string };
  }> = [
    {
      label: t.property.legal.proceedings,
      value: property.coOwnershipProceedings ? t.common.yes : t.common.no,
    },
    { label: t.property.legal.coOwnership, value: property.coOwnership ? t.common.yes : t.common.no },
    {
      label: t.property.legal.aboutPrice,
      value: priceLabel,
      note: t.property.legal.fees[property.feesPayableBy],
      link: { href: `${termsHref}#${FEE_TERMS_ANCHOR}`, label: t.property.legal.feeSchedule },
    },
  ];

  const similar = properties
    .filter(
      (item) =>
        item.id !== property.id &&
        (item.category === property.category || item.location.city === property.location.city),
    )
    .slice(0, 3);

  return (
    <>
      {/* --------------------------- HERO --------------------------- */}
      <section ref={heroRef} className="relative min-h-[92svh] overflow-hidden">
        <div ref={heroImageRef} className="absolute inset-0 -z-10">
          <CoverImage
            image={property.images[0]}
            priority
            className="absolute inset-0"
            sizes="100vw"
            imageClassName="object-cover"
          />
          {/* Velatura chiara: la fotografia resta visibile in alto, mentre in
              basso il bianco riprende quota per far leggere il testo scuro. */}
          <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/80 to-surface/35" />
          <div className="absolute inset-0 bg-surface/25" />
        </div>

        <div className="shell flex min-h-[92svh] flex-col justify-end pb-16 pt-36">
          <nav aria-label="Breadcrumb" className="mb-8">
            <ol className="flex flex-wrap items-center gap-2 text-[0.65rem] uppercase tracking-[0.14em] text-ink/60">
              <li>
                <Link href={link()} className="hover:text-champagne">
                  {t.nav.home}
                </Link>
              </li>
              <li aria-hidden>/</li>
              <li>
                <Link href={link("proprieta")} className="hover:text-champagne">
                  {t.nav.properties}
                </Link>
              </li>
              <li aria-hidden>/</li>
              <li className="text-ink/70">{property.location.city}</li>
            </ol>
          </nav>

          <p className="eyebrow">
            {property.location.city}
            {property.location.zone ? ` · ${property.location.zone}` : ""} · {t.common.reference}{" "}
            {property.reference}
          </p>

          <SplitReveal
            as="h1"
            immediate
            className="mt-6 max-w-4xl font-display text-[clamp(2.4rem,6vw,5.2rem)] leading-[0.98] text-ink"
          >
            {content.title}
          </SplitReveal>

          <p className="mt-5 max-w-xl text-sm leading-relaxed text-ink/60">{content.subtitle}</p>

          <div className="mt-10 flex flex-wrap items-end justify-between gap-8 border-t border-line pt-8">
            <dl className="flex flex-wrap gap-x-10 gap-y-5">
              {keyFacts.map((fact) => (
                <div key={fact.label}>
                  <dt className="flex items-center gap-2 text-[0.6rem] uppercase tracking-[0.14em] text-ink/60">
                    <fact.icon size={12} strokeWidth={1.3} className="text-champagne" />
                    {fact.label}
                  </dt>
                  <dd className="mt-2 font-display text-2xl text-ink">{fact.value}</dd>
                </div>
              ))}
            </dl>

            <div className="text-right">
              <p className="text-[0.6rem] uppercase tracking-[0.14em] text-ink/60">{t.property.stickyPrice}</p>
              <p className="mt-2 font-display text-4xl text-champagne">{priceLabel}</p>
            </div>
          </div>
        </div>
      </section>

      {/* -------------------------- GALLERIA ------------------------- */}
      {property.images.length > 0 && (
        <section className="overflow-hidden border-t border-line bg-surface py-20" aria-labelledby="gallery-title">
          <div className="shell">
            <div className="mb-10 flex items-end justify-between gap-6">
              <h2 id="gallery-title" className="font-display text-3xl text-ink">
                {t.property.gallery}
              </h2>
              <Link
                href={link("proprieta")}
                className="flex items-center gap-2 text-[0.65rem] uppercase tracking-[0.14em] text-ink/60 transition-colors hover:text-champagne"
              >
                <ArrowLeft size={13} strokeWidth={1.4} />
                {t.property.backToList}
              </Link>
            </div>

            <Gallery images={property.images} />
          </div>
        </section>
      )}

      {/* --------------- DESCRIZIONE + SCHEDA TECNICA ---------------- */}
      <section className="border-t border-line bg-surface py-24" aria-labelledby="description-title">
        <div className="shell grid gap-16 lg:grid-cols-[1.25fr_1fr]">
          <div>
            <Reveal>
              <p className="eyebrow">{t.property.overview}</p>
              <h2
                id="description-title"
                className="mt-5 font-display text-[clamp(2rem,3.6vw,3rem)] leading-tight text-ink"
              >
                {t.property.descriptionTitle}
              </h2>
            </Reveal>

            <Reveal delay={0.1} className="mt-8 space-y-5">
              {content.description.split("\n\n").map((paragraph, index) => (
                <p key={index} className="text-[0.95rem] leading-[1.85] text-ink/60">
                  {paragraph}
                </p>
              ))}
            </Reveal>

            <Reveal delay={0.15} className="mt-12">
              <h3 className="text-[0.65rem] uppercase tracking-[0.16em] text-champagne">
                {t.property.highlights}
              </h3>
              <ul className="mt-6 space-y-3">
                {content.highlights.map((highlight) => (
                  <li key={highlight} className="flex items-start gap-3 text-sm text-ink/65">
                    <Check size={14} strokeWidth={1.5} className="mt-1 shrink-0 text-champagne" />
                    {highlight}
                  </li>
                ))}
              </ul>
            </Reveal>

            <Reveal delay={0.2} className="mt-12">
              <h3 className="text-[0.65rem] uppercase tracking-[0.16em] text-champagne">
                {t.property.amenities}
              </h3>
              <div className="mt-6 flex flex-wrap gap-2.5">
                {property.amenities.map((amenity) => (
                  <span key={amenity} className="border border-line px-3.5 py-2 text-xs text-ink/60">
                    {t.enums.amenity[amenity]}
                  </span>
                ))}
              </div>
            </Reveal>
          </div>

          <div>
            <Reveal>
              <div className="border border-line">
                <div className="border-b border-line px-6 py-5">
                  <h2 className="font-display text-2xl text-ink">{t.property.specs}</h2>
                </div>
                <dl className="divide-y divide-[color:var(--color-line)]">
                  {specs.map(([label, value]) => (
                    <div key={label} className="flex items-start justify-between gap-6 px-6 py-4">
                      <dt className="text-xs uppercase tracking-[0.14em] text-ink/60">{label}</dt>
                      <dd className="text-right text-sm text-ink/85">{value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </Reveal>

            {/* Blocco contatto consulente */}
            <Reveal delay={0.12}>
              <div className="panel mt-6 p-7">
                <p className="eyebrow">{t.property.contactAgent}</p>
                <p className="mt-4 font-display text-2xl text-ink">{COMPANY.brandName}</p>
                <p className="mt-2 text-xs leading-relaxed text-ink/60">
                  {COMPANY.localOffice.street} · {COMPANY.localOffice.postalCode} {COMPANY.localOffice.city}
                </p>

                <div className="mt-7 flex flex-col gap-3">
                  <button
                    type="button"
                    onClick={() => setBrochureOpen(true)}
                    className="bg-champagne-deep px-6 py-3.5 text-[0.68rem] uppercase tracking-[0.14em] text-surface transition-colors hover:bg-ink"
                  >
                    {t.property.requestBrochure}
                  </button>
                  <Link
                    href={`${link("contatti")}?rif=${property.reference}`}
                    className="border border-line px-6 py-3.5 text-center text-[0.68rem] uppercase tracking-[0.14em] text-ink/80 transition-colors hover:border-champagne hover:text-champagne"
                  >
                    {t.property.bookViewing}
                  </Link>
                  <a
                    href={`tel:${COMPANY.phoneHref}`}
                    className="flex items-center justify-center gap-2 text-[0.68rem] uppercase tracking-[0.14em] text-ink/60 transition-colors hover:text-champagne"
                  >
                    <Phone size={13} strokeWidth={1.4} />
                    {COMPANY.phone}
                  </a>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ------------- INFORMAZIONI LEGALI + DIAGNOSI ---------------- */}
      <section className="border-t border-line bg-surface py-24" aria-labelledby="legal-title">
        <div className="shell">
          <h2 id="legal-title" className="font-display text-[clamp(1.8rem,3vw,2.4rem)] text-ink">
            {t.property.legal.title}
          </h2>

          <dl className="mt-10 border-t border-line">
            {legalRows.map((row) => (
              <div
                key={row.label}
                className="flex flex-wrap items-start justify-between gap-x-8 gap-y-2 border-b border-line py-6"
              >
                <dt className="text-[0.7rem] uppercase tracking-[0.16em] text-ink/70">
                  {row.label}
                  {row.note && <span className="mt-1.5 block normal-case tracking-normal text-xs text-ink/60">{row.note}</span>}
                  {row.link && (
                    <Link
                      href={row.link.href}
                      className="mt-1 inline-block text-xs normal-case tracking-normal text-ink underline underline-offset-4 transition-colors hover:text-champagne"
                    >
                      {row.link.label}
                    </Link>
                  )}
                </dt>
                <dd className="text-right text-sm text-ink/85">{row.value}</dd>
              </div>
            ))}
          </dl>

          <h3 className="mt-16 font-display text-[clamp(1.8rem,3vw,2.4rem)] text-ink">
            {t.property.diagnosis.title}
          </h3>
          <div className="mt-8">
            <EnergyDiagnosis
              energyClass={property.energyClass}
              energyIndex={property.energyIndex}
              emissionsClass={property.emissionsClass}
              emissionsIndex={property.emissionsIndex}
            />
          </div>

          <Link
            href={`${termsHref}#${DIAGNOSIS_TERMS_ANCHOR}`}
            className="group mt-10 inline-flex items-center gap-3 text-[0.68rem] uppercase tracking-[0.14em] text-ink transition-colors hover:text-champagne"
          >
            {t.property.diagnosis.moreInfo}
            <ArrowRight
              size={15}
              strokeWidth={1.4}
              className="transition-transform duration-300 group-hover:translate-x-1"
            />
          </Link>
        </div>
      </section>

      {/* ---------------------- PLANIMETRIE -------------------------- */}
      {property.floorPlans.length > 0 && (
        <section className="border-t border-line bg-surface-soft py-24" aria-labelledby="plans-title">
          <div className="shell">
            <p className="eyebrow">{t.property.plans}</p>
            <h2 id="plans-title" className="mt-5 font-display text-[clamp(2rem,3.6vw,3rem)] text-ink">
              {t.property.plansTitle}
            </h2>

            <div className="mt-12 grid gap-px bg-line md:grid-cols-3">
              {property.floorPlans.map((floorPlan) => (
                <div key={floorPlan.level} className="bg-surface p-8">
                  <div className="flex items-baseline justify-between">
                    <h3 className="font-display text-2xl text-ink">{floorPlan.name[locale]}</h3>
                    <span className="text-sm text-champagne">{formatArea(floorPlan.areaSqm, locale)}</span>
                  </div>
                  <ul className="mt-6 space-y-2">
                    {floorPlan.rooms.map((room, index) => (
                      <li
                        key={`${room}-${index}`}
                        className="flex items-center gap-3 border-b border-line pb-2 text-sm text-ink/60"
                      >
                        <Layers size={12} strokeWidth={1.3} className="text-ink/60" />
                        {t.enums.rooms[room]}
                      </li>
                    ))}
                  </ul>
                  {floorPlan.src && (
                    <a
                      href={floorPlan.src}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-6 inline-block text-[0.65rem] uppercase tracking-[0.14em] text-champagne"
                    >
                      PDF
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ------------------------ POSIZIONE -------------------------- */}
      <section className="border-t border-line bg-surface py-24" aria-labelledby="location-title">
        <div className="shell">
          <p className="eyebrow">{t.property.location}</p>
          <h2 id="location-title" className="mt-5 font-display text-[clamp(2rem,3.6vw,3rem)] text-ink">
            {property.location.city} ({property.location.province})
          </h2>
          <p className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-ink/60">
            <span className="flex items-center gap-2">
              <Building2 size={13} strokeWidth={1.3} className="text-champagne" />
              {property.location.address}
            </span>
            <span className="flex items-center gap-2">
              <Flame size={13} strokeWidth={1.3} className="text-champagne" />
              {t.enums.heating[property.heating]}
            </span>
            <span>
              {property.location.lat.toFixed(4)}, {property.location.lng.toFixed(4)}
            </span>
          </p>

          <div className="mt-10 border border-line">
            <MapPanel
              properties={[property]}
              activeId={property.id}
              onActiveChange={() => {}}
              className="h-[52vh] min-h-[380px]"
            />
          </div>
        </div>
      </section>

      {/* ---------------------- SIMILI ------------------------------- */}
      {similar.length > 0 && (
        <section className="border-t border-line bg-surface py-24" aria-labelledby="similar-title">
          <div className="shell">
            <h2 id="similar-title" className="font-display text-[clamp(2rem,3.6vw,3rem)] text-ink">
              {t.property.similar}
            </h2>
            <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:gap-8">
              {similar.map((item) => (
                <PropertyCard key={item.id} property={item} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* -------------------- BARRA STICKY --------------------------- */}
      <div
        className={cn(
          "fixed inset-x-0 bottom-0 z-50 border-t border-line bg-surface/92 backdrop-blur-xl transition-transform duration-500",
          barVisible ? "translate-y-0" : "translate-y-full",
        )}
      >
        <div className="shell flex items-center justify-between gap-4 py-4">
          <div className="min-w-0">
            <p className="truncate text-[0.6rem] uppercase tracking-[0.14em] text-ink/60">
              {t.common.reference} {property.reference} · {property.location.city}
            </p>
            <p className="truncate font-display text-xl text-ink">{priceLabel}</p>
          </div>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <a
              href={`tel:${COMPANY.phoneHref}`}
              className="flex items-center gap-2 border border-line px-4 py-3 text-[0.65rem] uppercase tracking-[0.14em] text-ink/75 transition-colors hover:border-champagne hover:text-champagne"
            >
              <Phone size={13} strokeWidth={1.4} />
              <span className="hidden sm:inline">{t.property.callNow}</span>
            </a>
            <button
              type="button"
              onClick={() => setBrochureOpen(true)}
              className="hidden border border-line px-5 py-3 text-[0.65rem] uppercase tracking-[0.14em] text-ink/75 transition-colors hover:border-champagne hover:text-champagne md:block"
            >
              {t.property.requestBrochure}
            </button>
            <Link
              href={`${link("contatti")}?rif=${property.reference}`}
              className="bg-champagne-deep px-5 py-3 text-[0.65rem] uppercase tracking-[0.14em] text-surface transition-colors hover:bg-ink"
            >
              {t.property.stickyCta}
            </Link>
          </div>
        </div>
      </div>

      <BrochureModal property={property} open={brochureOpen} onClose={() => setBrochureOpen(false)} />
    </>
  );
}
