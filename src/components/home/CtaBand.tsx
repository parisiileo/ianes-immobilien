"use client";

import Link from "next/link";
import { ArrowUpRight, Phone } from "lucide-react";
import { useLocale } from "@/i18n/LocaleProvider";
import { COMPANY } from "@/lib/company";
import { Reveal, SplitReveal } from "@/components/ui/SplitText";

export function CtaBand() {
  const { t, link } = useLocale();

  return (
    <section className="relative border-t border-line bg-surface-soft py-24 md:py-32">
      <div className="shell">
        <div className="flex flex-col items-start justify-between gap-10 lg:flex-row lg:items-end">
          <div className="max-w-2xl">
            <SplitReveal
              as="h2"
              className="font-display text-[clamp(2.2rem,4.8vw,4rem)] leading-[1.03] text-ink"
            >
              {t.home.cta.title}
            </SplitReveal>
            <Reveal delay={0.12}>
              <p className="mt-5 max-w-lg text-sm leading-relaxed text-ink/60">{t.home.cta.text}</p>
            </Reveal>
          </div>

          <Reveal delay={0.18} className="flex flex-wrap gap-4">
            <Link
              href={link("valutazione")}
              className="group flex items-center gap-3 bg-champagne-deep px-8 py-4 text-[0.7rem] uppercase tracking-[0.14em] text-surface transition-colors hover:bg-ink"
            >
              {t.home.cta.button}
              <ArrowUpRight
                size={15}
                strokeWidth={1.5}
                className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </Link>
            <a
              href={`tel:${COMPANY.phoneHref}`}
              className="flex items-center gap-3 border border-line px-8 py-4 text-[0.7rem] uppercase tracking-[0.14em] text-ink/80 transition-all hover:border-champagne hover:text-champagne"
            >
              <Phone size={14} strokeWidth={1.4} />
              {t.home.cta.call}
            </a>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
