"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { useLocale } from "@/i18n/LocaleProvider";
import { Reveal, SplitReveal } from "@/components/ui/SplitText";
import { cn } from "@/lib/cn";

/** Elenco dei territori con riga espandibile in stile indice editoriale. */
export function Regions() {
  const { t, link } = useLocale();
  const [active, setActive] = useState(0);

  return (
    <section className="relative border-t border-line bg-surface py-28 md:py-36" aria-labelledby="regions-title">
      <div className="shell">
        <div className="max-w-2xl">
          <Reveal>
            <p className="eyebrow">{t.home.regions.eyebrow}</p>
          </Reveal>
          <SplitReveal
            as="h2"
            className="mt-5 font-display text-[clamp(2.2rem,4.6vw,3.8rem)] leading-[1.04] text-ink"
          >
            {t.home.regions.title}
          </SplitReveal>
          <Reveal delay={0.15}>
            <p className="mt-5 text-sm text-ink/60">{t.home.regions.subtitle}</p>
          </Reveal>
        </div>

        <Reveal stagger={0.08} className="mt-16 border-t border-line">
          {t.home.regions.items.map((region, index) => (
            <button
              key={region.name}
              type="button"
              onMouseEnter={() => setActive(index)}
              onFocus={() => setActive(index)}
              onClick={() => setActive(index)}
              className={cn(
                "group flex w-full items-baseline justify-between gap-8 border-b border-line py-7 text-left transition-colors duration-500",
                active === index ? "text-ink" : "text-ink/60 hover:text-ink/75",
              )}
            >
              <span className="flex items-baseline gap-6">
                <span className="w-8 text-[0.65rem] tracking-[0.2em] text-champagne/70">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="font-display text-[clamp(1.6rem,3.4vw,2.8rem)] leading-none">{region.name}</span>
              </span>
              <span
                className={cn(
                  "hidden max-w-md text-right text-sm leading-relaxed transition-all duration-500 md:block",
                  active === index ? "opacity-100" : "opacity-40",
                )}
              >
                {region.text}
              </span>
            </button>
          ))}
        </Reveal>

        <Reveal delay={0.1}>
          <Link
            href={link("proprieta")}
            className="group mt-10 inline-flex items-center gap-3 text-[0.7rem] uppercase tracking-[0.22em] text-champagne"
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
    </section>
  );
}
