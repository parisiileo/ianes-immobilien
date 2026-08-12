"use client";

import Link from "next/link";
import { Facebook, Instagram, Mail, MapPin, Phone, Star } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { COMPANY } from "@/lib/company";
import { useLocale } from "@/i18n/LocaleProvider";
import { openPreferences } from "@/lib/consent";
import { Logo } from "./Logo";

/** Icona per ogni profilo dichiarato in COMPANY.social. */
const SOCIAL_ICONS: Record<(typeof COMPANY.social)[number]["name"], LucideIcon> = {
  Instagram,
  Facebook,
};

export function Footer() {
  const { t, link } = useLocale();
  const year = new Date().getFullYear();

  const navItems = [
    { label: t.nav.properties, path: "proprieta" },
    { label: t.nav.sale, path: "proprieta?tipo=sale" },
    { label: t.nav.rent, path: "proprieta?tipo=rent" },
    { label: t.nav.about, path: "chi-siamo" },
    { label: t.nav.valuation, path: "valutazione" },
    { label: t.nav.contact, path: "contatti" },
  ];

  const legalItems = [
    { label: t.meta.privacy.title.split(" | ")[0], path: "privacy-policy" },
    { label: t.meta.cookie.title.split(" | ")[0], path: "cookie-policy" },
    { label: t.meta.terms.title.split(" | ")[0], path: "termini-e-condizioni" },
  ];

  return (
    <footer className="relative border-t border-line bg-surface">
      <div className="shell py-20">
        <div className="grid gap-14 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
          <div>
            <Logo />
            <p className="mt-6 max-w-xs text-sm leading-relaxed text-ink/60">{t.footer.tagline}</p>

            <div className="mt-7 flex items-center gap-3">
              <div className="flex gap-0.5" aria-hidden>
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star
                    key={index}
                    size={13}
                    strokeWidth={1}
                    className={
                      index < Math.round(COMPANY.rating.value)
                        ? "fill-champagne text-champagne"
                        /* Stella vuota: grafica, soglia 3:1 — vedi GoogleRating. */
                        : "text-ink/50"
                    }
                  />
                ))}
              </div>
              <span className="text-xs text-ink/60">
                {COMPANY.rating.value.toLocaleString("it-IT")} · {COMPANY.rating.count} Google
              </span>
            </div>

            <div className="mt-8">
              <h2 className="eyebrow mb-4">{t.footer.followTitle}</h2>
              <ul className="flex items-center gap-3">
                {COMPANY.social.map((profile) => {
                  const Icon = SOCIAL_ICONS[profile.name];
                  return (
                    <li key={profile.url}>
                      <a
                        href={profile.url}
                        target="_blank"
                        rel="noopener noreferrer me"
                        aria-label={`${profile.name}, ${COMPANY.brandName}`}
                        className="flex h-10 w-10 items-center justify-center border border-line text-ink/60 transition-colors hover:border-champagne hover:text-champagne"
                      >
                        <Icon size={16} strokeWidth={1.4} aria-hidden />
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          <nav aria-label={t.footer.navTitle}>
            <h2 className="eyebrow mb-5">{t.footer.navTitle}</h2>
            <ul className="space-y-3">
              {navItems.map((item) => (
                <li key={item.path}>
                  <Link href={link(item.path)} className="text-sm text-ink/60 transition-colors hover:text-champagne">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label={t.footer.legalTitle}>
            <h2 className="eyebrow mb-5">{t.footer.legalTitle}</h2>
            <ul className="space-y-3">
              {legalItems.map((item) => (
                <li key={item.path}>
                  <Link href={link(item.path)} className="text-sm text-ink/60 transition-colors hover:text-champagne">
                    {item.label}
                  </Link>
                </li>
              ))}
              <li>
                <button
                  type="button"
                  onClick={openPreferences}
                  className="text-left text-sm text-ink/60 transition-colors hover:text-champagne"
                >
                  {t.footer.cookiePreferences}
                </button>
              </li>
              <li>
                <Link href="/admin" className="text-sm text-ink/60 transition-colors hover:text-champagne">
                  {t.nav.admin}
                </Link>
              </li>
            </ul>
          </nav>

          <div>
            <h2 className="eyebrow mb-5">{t.footer.contactTitle}</h2>
            <ul className="space-y-4 text-sm text-ink/60">
              <li className="flex items-start gap-3">
                <MapPin size={14} strokeWidth={1.4} className="mt-1 shrink-0 text-champagne" />
                <span>
                  <span className="block text-[0.65rem] uppercase tracking-[0.14em] text-ink/60">
                    {t.footer.localOffice}
                  </span>
                  {COMPANY.localOffice.street}
                  <br />
                  {COMPANY.localOffice.postalCode} {COMPANY.localOffice.city} ({COMPANY.localOffice.province})
                </span>
              </li>
              <li className="flex items-start gap-3">
                <MapPin size={14} strokeWidth={1.4} className="mt-1 shrink-0 text-champagne/60" />
                <span>
                  <span className="block text-[0.65rem] uppercase tracking-[0.14em] text-ink/60">
                    {t.footer.registeredOffice}
                  </span>
                  {COMPANY.registeredOffice.street}
                  <br />
                  {COMPANY.registeredOffice.postalCode} {COMPANY.registeredOffice.city} (
                  {COMPANY.registeredOffice.province})
                </span>
              </li>
              <li>
                <a href={`tel:${COMPANY.phoneHref}`} className="flex items-center gap-3 hover:text-champagne">
                  <Phone size={14} strokeWidth={1.4} className="shrink-0 text-champagne" />
                  {COMPANY.phone}
                </a>
              </li>
              <li>
                <a href={`mailto:${COMPANY.pec}`} className="flex items-center gap-3 hover:text-champagne">
                  <Mail size={14} strokeWidth={1.4} className="shrink-0 text-champagne" />
                  {COMPANY.pec}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 border-t border-line pt-8">
          <h2 className="sr-only">{t.footer.companyTitle}</h2>
          <div className="flex flex-col gap-4 text-xs text-ink/60 lg:flex-row lg:items-center lg:justify-between">
            <p>
              {COMPANY.legalName} · {t.footer.vat} {COMPANY.vat} · {t.footer.rea} {COMPANY.rea}
            </p>
            <p>{t.footer.credits}</p>
          </div>
          <p className="mt-4 text-xs text-ink/60">
            © {year} {COMPANY.legalName}. {t.footer.rights}
          </p>
        </div>
      </div>
    </footer>
  );
}
