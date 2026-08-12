"use client";

import { Camera, FileCheck2, Handshake, LineChart } from "lucide-react";
import { useLocale } from "@/i18n/LocaleProvider";
import { Reveal, SplitReveal } from "@/components/ui/SplitText";

/* Un'icona per voce, nello stesso ordine dei testi del dizionario:
   valutazione → verifiche → presentazione → trattativa. */
const ICONS = [LineChart, FileCheck2, Camera, Handshake];

export function Services() {
  const { t } = useLocale();

  return (
    <section className="relative border-t border-line bg-surface py-28 md:py-36" aria-labelledby="services-title">
      <div className="shell">
        <div className="grid gap-14 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <Reveal>
              <p className="eyebrow">{t.home.services.eyebrow}</p>
            </Reveal>
            <SplitReveal
              as="h2"
              className="mt-5 max-w-md font-display text-[clamp(2.2rem,4.4vw,3.6rem)] leading-[1.04] text-ink"
            >
              {t.home.services.title}
            </SplitReveal>
          </div>

          <Reveal stagger={0.1} className="grid gap-px bg-line sm:grid-cols-2">
            {t.home.services.items.map((item, index) => {
              const Icon = ICONS[index % ICONS.length];
              return (
                <div
                  key={item.title}
                  className="group bg-surface p-8 transition-colors duration-500 hover:bg-surface-soft"
                >
                  <Icon
                    size={22}
                    strokeWidth={1}
                    className="text-champagne transition-transform duration-500 group-hover:-translate-y-0.5"
                  />
                  <h3 className="mt-6 font-display text-2xl text-ink">{item.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-ink/60">{item.text}</p>
                </div>
              );
            })}
          </Reveal>
        </div>
      </div>
    </section>
  );
}
