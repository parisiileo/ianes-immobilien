"use client";

import { useLocale } from "@/i18n/LocaleProvider";
import { COMPANY } from "@/lib/company";
import { formatDate } from "@/lib/format";
import { openPreferences } from "@/lib/consent";
import type { LegalDocument } from "@/data/legal";

/** Impaginazione dei documenti legali con indice laterale ancorato. */
export function LegalArticle({ document, showCookieButton = false }: { document: LegalDocument; showCookieButton?: boolean }) {
  const { t, locale } = useLocale();

  return (
    <section className="bg-surface py-20">
      <div className="shell grid gap-14 lg:grid-cols-[240px_1fr] lg:gap-20">
        <nav aria-label={t.legal.index} className="lg:sticky lg:top-32 lg:self-start">
          <p className="eyebrow">{t.legal.index}</p>
          <ol className="mt-5 space-y-2.5 border-l border-line pl-4">
            {document.sections.map((section) => (
              <li key={section.id}>
                <a
                  href={`#${section.id}`}
                  className="text-xs leading-relaxed text-ink/60 transition-colors hover:text-champagne"
                >
                  {section.title}
                </a>
              </li>
            ))}
          </ol>

          {showCookieButton && (
            <button
              type="button"
              onClick={openPreferences}
              className="mt-8 border border-line px-4 py-3 text-[0.62rem] uppercase tracking-[0.18em] text-ink/70 transition-colors hover:border-champagne hover:text-champagne"
            >
              {t.footer.cookiePreferences}
            </button>
          )}
        </nav>

        <article className="max-w-3xl">
          <p className="text-[0.62rem] uppercase tracking-[0.2em] text-ink/60">
            {t.legal.lastUpdate}: {formatDate(document.updated, locale)}
          </p>
          <p className="mt-6 text-[0.95rem] leading-[1.85] text-ink/60">{document.intro}</p>

          {document.sections.map((section) => (
            <section key={section.id} id={section.id} className="mt-14 scroll-mt-32">
              <h2 className="font-display text-2xl text-ink md:text-3xl">{section.title}</h2>
              {section.paragraphs.map((paragraph, index) => (
                <p key={index} className="mt-5 text-sm leading-[1.9] text-ink/60">
                  {paragraph}
                </p>
              ))}
              {section.bullets && (
                <ul className="mt-5 space-y-3">
                  {section.bullets.map((bullet, index) => (
                    <li key={index} className="flex gap-3 text-sm leading-[1.85] text-ink/60">
                      <span aria-hidden className="mt-2.5 h-px w-3 shrink-0 bg-champagne/70" />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}

          <footer className="mt-16 border-t border-line pt-8 text-xs leading-relaxed text-ink/60">
            <p className="uppercase tracking-[0.2em] text-ink/60">{t.legal.dataController}</p>
            <p className="mt-3">
              {COMPANY.legalName} · {COMPANY.registeredOffice.street}, {COMPANY.registeredOffice.postalCode}{" "}
              {COMPANY.registeredOffice.city} ({COMPANY.registeredOffice.province})
            </p>
            <p className="mt-1">
              {t.footer.vat} {COMPANY.vat} · {t.footer.rea} {COMPANY.rea} · PEC {COMPANY.pec} · {COMPANY.phone}
            </p>
          </footer>
        </article>
      </div>
    </section>
  );
}
