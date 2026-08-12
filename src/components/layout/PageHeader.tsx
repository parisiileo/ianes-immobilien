"use client";

import Link from "next/link";
import { useLocale } from "@/i18n/LocaleProvider";
import { Reveal, SplitReveal } from "@/components/ui/SplitText";

interface PageHeaderProps {
  eyebrow: string;
  title: string;
  lead?: string;
  /** Briciole di pane visibili: la versione JSON-LD è generata nel server component. */
  crumbs?: Array<{ label: string; path?: string }>;
}

export function PageHeader({ eyebrow, title, lead, crumbs }: PageHeaderProps) {
  const { t, link } = useLocale();

  return (
    <section className="relative border-b border-line pt-36 md:pt-44">
      <div className="shell pb-16">
        {crumbs && crumbs.length > 0 && (
          <nav aria-label="Breadcrumb" className="mb-8">
            <ol className="flex flex-wrap items-center gap-2 text-[0.65rem] uppercase tracking-[0.2em] text-ink/60">
              <li>
                <Link href={link()} className="transition-colors hover:text-champagne">
                  {t.nav.home}
                </Link>
              </li>
              {crumbs.map((crumb) => (
                <li key={crumb.label} className="flex items-center gap-2">
                  <span aria-hidden>/</span>
                  {crumb.path ? (
                    <Link href={link(crumb.path)} className="transition-colors hover:text-champagne">
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className="text-ink/70">{crumb.label}</span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        )}

        <Reveal>
          <p className="eyebrow">{eyebrow}</p>
        </Reveal>
        <SplitReveal
          as="h1"
          className="mt-6 max-w-4xl font-display text-[clamp(2.6rem,6vw,5rem)] leading-[1.01] text-ink"
        >
          {title}
        </SplitReveal>
        {lead && (
          <Reveal delay={0.12}>
            <p className="mt-7 max-w-2xl text-[0.95rem] leading-relaxed text-ink/60">{lead}</p>
          </Reveal>
        )}
      </div>
    </section>
  );
}
