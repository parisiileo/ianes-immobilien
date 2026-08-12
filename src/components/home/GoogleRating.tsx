"use client";

import { ArrowUpRight, Star } from "lucide-react";
import { useLocale } from "@/i18n/LocaleProvider";
import { COMPANY } from "@/lib/company";
import { LOCALE_TAGS } from "@/i18n/config";
import { Reveal, SplitReveal } from "@/components/ui/SplitText";

/**
 * Valutazione Google.
 *
 * Mostra soltanto il dato pubblico verificabile (media e numero di
 * recensioni): niente citazioni di clienti, che sarebbero inventate finché
 * non si collega la Google Places API o non si ricevono i testi reali.
 */
export function GoogleRating() {
  const { t, locale, fill } = useLocale();
  const rating = COMPANY.rating;
  const formatted = rating.value.toLocaleString(LOCALE_TAGS[locale], { minimumFractionDigits: 1 });

  return (
    <section className="relative border-t border-line bg-surface-soft py-24 md:py-32" aria-labelledby="rating-title">
      <div className="shell">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:items-end">
          <div>
            <Reveal>
              <p className="eyebrow">{t.home.reviews.eyebrow}</p>
            </Reveal>
            <SplitReveal
              as="h2"
              className="mt-5 font-display text-[clamp(2.2rem,4.6vw,3.8rem)] leading-none text-ink"
            >
              {t.home.reviews.title}
            </SplitReveal>
          </div>

          <Reveal delay={0.12}>
            <div className="glass-light flex flex-wrap items-center gap-x-10 gap-y-6 p-8 md:p-10">
              <div className="flex items-baseline gap-2">
                <span className="font-display text-[clamp(3.4rem,7vw,5.4rem)] leading-none text-champagne">
                  {formatted}
                </span>
                <span className="font-display text-2xl text-ink/60">/ {rating.best}</span>
              </div>

              <div className="min-w-48 flex-1">
                <div className="flex gap-1" aria-label={t.a11y.ratingLabel}>
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star
                      key={index}
                      size={18}
                      strokeWidth={1}
                      className={
                        /* Stella vuota: è grafica, non testo, quindi la soglia è 3:1 e non
                           4,5:1 — `/50` sta a 3,45:1 e resta comunque distinguibile
                           dall'oro delle stelle piene, che a `/60` non sarebbe più. */
                        index < Math.round(rating.value) ? "fill-champagne text-champagne" : "text-ink/50"
                      }
                    />
                  ))}
                </div>
                <p className="mt-3 text-sm text-ink/60">
                  {fill(t.home.reviews.basedOn, { count: rating.count })}
                </p>
                <p className="mt-1 text-xs text-ink/60">{t.home.reviews.note}</p>
              </div>

              <a
                href={`https://www.google.com/search?q=${encodeURIComponent(
                  `${COMPANY.legalName} ${COMPANY.localOffice.city}`,
                )}`}
                target="_blank"
                rel="noreferrer noopener"
                className="group flex items-center gap-3 border-b border-line pb-2 text-[0.7rem] uppercase tracking-[0.2em] text-ink/70 transition-colors hover:border-champagne hover:text-champagne"
              >
                {t.home.reviews.cta}
                <ArrowUpRight
                  size={14}
                  strokeWidth={1.4}
                  className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </a>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
