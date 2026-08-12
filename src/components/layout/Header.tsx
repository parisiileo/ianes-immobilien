"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowUpRight, Menu, Phone, X } from "lucide-react";
import { COMPANY } from "@/lib/company";
import { useLocale } from "@/i18n/LocaleProvider";
import { useProperties } from "@/components/PropertiesProvider";
import { PROPERTY_CATEGORIES } from "@/types/property";
import { formatPriceCompact } from "@/lib/format";
import { CoverImage } from "@/components/property/CoverImage";
import { cn } from "@/lib/cn";
import { gsap } from "@/lib/gsap";
import { Logo } from "./Logo";
import { LanguageSwitcher } from "./LanguageSwitcher";

/**
 * Header con marchio centrato: navigazione divisa in due gruppi ai lati,
 * logo al centro come sulle testate editoriali.
 *
 * Sopra le pagine che aprono con una fotografia a tutto schermo (home e
 * scheda immobile) l'header parte senza fondo; appena si scorre compare la
 * barra bianca. Il testo resta sempre scuro: le immagini di apertura sono
 * schiarite da una velatura chiara, quindi non serve la variante invertita
 * e si evita il salto di colore a metà transizione.
 */
export function Header() {
  const { t, link, locale } = useLocale();
  const pathname = usePathname();
  const properties = useProperties();
  const [scrolled, setScrolled] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const megaRef = useRef<HTMLDivElement>(null);
  const mobileRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<number | null>(null);

  /**
   * Due aperture diverse:
   * — la home ha una fotografia scura a tutta altezza → header senza fondo e
   *   testo bianco;
   * — la scheda immobile ha la stessa foto ma schiarita, con testo scuro →
   *   header senza fondo ma testo normale.
   */
  const { isHome, overPhoto } = useMemo(() => {
    const segments = pathname.split("/").filter(Boolean);
    return {
      isHome: segments.length === 1, // /it
      overPhoto:
        segments.length === 1 || (segments.length === 3 && segments[1] === "proprieta"),
    };
  }, [pathname]);

  const transparent = overPhoto && !scrolled && !megaOpen;
  const light = isHome && !scrolled && !megaOpen;

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 40);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMegaOpen(false);
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.documentElement.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [mobileOpen]);

  useEffect(() => {
    const panel = megaRef.current;
    if (!panel) return;
    gsap.killTweensOf(panel);
    if (megaOpen) {
      gsap.set(panel, { display: "block" });
      gsap.fromTo(
        panel,
        { opacity: 0, y: -14, clipPath: "inset(0 0 100% 0)" },
        { opacity: 1, y: 0, clipPath: "inset(0 0 0% 0)", duration: 0.55, ease: "power3.out" },
      );
      gsap.fromTo(
        panel.querySelectorAll("[data-mega-item]"),
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.035, delay: 0.08, ease: "power3.out" },
      );
    } else {
      gsap.to(panel, {
        opacity: 0,
        y: -10,
        duration: 0.3,
        ease: "power2.in",
        onComplete: () => gsap.set(panel, { display: "none" }),
      });
    }
  }, [megaOpen]);

  useEffect(() => {
    const panel = mobileRef.current;
    if (!panel) return;
    gsap.killTweensOf(panel);
    if (mobileOpen) {
      gsap.set(panel, { display: "flex" });
      gsap.fromTo(panel, { yPercent: -100 }, { yPercent: 0, duration: 0.7, ease: "power4.out" });
      gsap.fromTo(
        panel.querySelectorAll("[data-mobile-item]"),
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.06, delay: 0.18, ease: "power3.out" },
      );
    } else {
      gsap.to(panel, {
        yPercent: -100,
        duration: 0.5,
        ease: "power3.inOut",
        onComplete: () => gsap.set(panel, { display: "none" }),
      });
    }
  }, [mobileOpen]);

  function openMega() {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    setMegaOpen(true);
  }
  function scheduleCloseMega() {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => setMegaOpen(false), 160);
  }

  const featured = properties.filter((property) => property.featured).slice(0, 2);
  const cities = Array.from(new Set(properties.map((property) => property.location.city))).slice(0, 6);

  type NavLink = { label: string; path: string; mega?: boolean };

  /* Tre voci a sinistra e una a destra: il marchio resta comunque centrato
     perché le due colonne laterali della griglia hanno la stessa larghezza. */
  const leftLinks: NavLink[] = [
    { label: t.nav.properties, path: "proprieta", mega: true },
    { label: t.nav.about, path: "chi-siamo" },
    { label: t.nav.valuation, path: "valutazione" },
  ];
  const rightLinks: NavLink[] = [{ label: t.nav.contact, path: "contatti" }];

  const linkClass = (active: boolean) =>
    cn(
      "group relative py-2 text-[0.7rem] uppercase tracking-[0.24em] transition-colors duration-300",
      light
        ? active
          ? "text-champagne-soft"
          : "text-white/85 hover:text-white"
        : active
          ? "text-champagne"
          : "text-ink/70 hover:text-ink",
    );

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-6 focus:top-6 focus:z-[100] focus:bg-champagne-deep focus:px-4 focus:py-2 focus:text-sm focus:text-surface"
      >
        {t.nav.skipToContent}
      </a>

      <header
        className={cn(
          "fixed inset-x-0 top-0 z-[60] transition-[background-color,backdrop-filter,border-color,padding] duration-500",
          transparent
            ? "border-b border-transparent py-6"
            : "border-b border-line bg-surface/92 py-3 backdrop-blur-xl",
        )}
        onMouseLeave={scheduleCloseMega}
      >
        <div className="shell grid grid-cols-[1fr_auto_1fr] items-center gap-6">
          {/* Sinistra */}
          <nav className="hidden items-center gap-8 lg:flex" aria-label={t.nav.menu}>
            {leftLinks.map((item) => (
              <div key={item.path} onMouseEnter={item.mega ? openMega : scheduleCloseMega}>
                <Link
                  href={link(item.path)}
                  onFocus={item.mega ? openMega : undefined}
                  className={linkClass(pathname.includes(`/${item.path}`))}
                >
                  {item.label}
                  <span
                    className={cn(
                      "absolute -bottom-0.5 left-0 h-px transition-all duration-500",
                      light ? "bg-champagne-soft" : "bg-champagne",
                      pathname.includes(`/${item.path}`) || (item.mega && megaOpen)
                        ? "w-full"
                        : "w-0 group-hover:w-full",
                    )}
                  />
                </Link>
              </div>
            ))}
          </nav>

          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label={t.nav.menu}
            className={cn(
              "justify-self-start p-2 transition-colors lg:hidden",
              light ? "text-white/85 hover:text-white" : "text-ink/70 hover:text-champagne",
            )}
          >
            <Menu size={22} strokeWidth={1.2} />
          </button>

          {/* Marchio centrale */}
          <Link href={link()} aria-label={COMPANY.brandName} className="justify-self-center">
            <Logo tone={light ? "onPhoto" : "default"} />
          </Link>

          {/* Destra */}
          <div className="flex items-center justify-end gap-6">
            <nav className="hidden items-center gap-8 lg:flex" aria-label={t.nav.menu}>
              {rightLinks.map((item) => (
                <Link key={item.path} href={link(item.path)} className={linkClass(pathname.includes(`/${item.path}`))}>
                  {item.label}
                  <span
                    className={cn(
                      "absolute -bottom-0.5 left-0 h-px transition-all duration-500",
                      light ? "bg-champagne-soft" : "bg-champagne",
                      pathname.includes(`/${item.path}`) ? "w-full" : "w-0 group-hover:w-full",
                    )}
                  />
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-1 sm:gap-2">
              <LanguageSwitcher tone={light ? "onPhoto" : "default"} />
              <a
                href={`tel:${COMPANY.phoneHref}`}
                className={cn(
                  "hidden items-center gap-2 border px-4 py-2.5 text-[0.7rem] uppercase tracking-[0.2em] transition-all duration-300 xl:flex",
                  light
                    ? "border-white/35 text-white/90 hover:border-white hover:bg-white/10"
                    : "border-line text-ink/75 hover:border-champagne hover:text-champagne",
                )}
              >
                <Phone size={13} strokeWidth={1.5} />
                {COMPANY.phone}
              </a>
            </div>
          </div>
        </div>

        {/* ---------------- Mega menu proprietà ---------------- */}
        <div
          ref={megaRef}
          onMouseEnter={openMega}
          onMouseLeave={scheduleCloseMega}
          style={{ display: "none" }}
          className="absolute inset-x-0 top-full hidden border-b border-line bg-surface shadow-panel"
        >
          <div className="shell grid gap-10 py-12 lg:grid-cols-[1fr_1fr_1.4fr]">
            <div data-mega-item>
              <p className="eyebrow mb-5">{t.filters.category}</p>
              <ul className="space-y-2.5">
                {PROPERTY_CATEGORIES.map((category) => (
                  <li key={category}>
                    <Link
                      href={`${link("proprieta")}?categoria=${category}`}
                      className="group flex items-center gap-2 font-display text-xl text-ink/75 transition-colors hover:text-champagne"
                    >
                      {t.enums.category[category]}
                      <ArrowUpRight
                        size={14}
                        strokeWidth={1.3}
                        className="opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:opacity-100"
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div data-mega-item>
              <p className="eyebrow mb-5">{t.filters.city}</p>
              <ul className="space-y-2.5">
                {cities.map((city) => (
                  <li key={city}>
                    <Link
                      href={`${link("proprieta")}?comune=${encodeURIComponent(city)}`}
                      className="text-sm text-ink/60 transition-colors hover:text-ink"
                    >
                      {city}
                    </Link>
                  </li>
                ))}
                <li className="pt-3">
                  <Link
                    href={link("proprieta")}
                    className="inline-flex items-center gap-2 text-[0.7rem] uppercase tracking-[0.22em] text-champagne"
                  >
                    {t.common.viewAll}
                    <ArrowUpRight size={13} strokeWidth={1.4} />
                  </Link>
                </li>
              </ul>
            </div>

            <div className="grid gap-5 sm:grid-cols-2" data-mega-item>
              {featured.map((property) => (
                <Link
                  key={property.id}
                  href={link(`proprieta/${property.slug}`)}
                  className="group relative block overflow-hidden"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-surface-soft">
                    <CoverImage
                      image={property.images[0]}
                      className="absolute inset-0"
                      sizes="(max-width: 1024px) 50vw, 22vw"
                      imageClassName="object-cover transition-transform duration-[1.2s] ease-[var(--ease-luxe)] group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                  </div>
                  <div className="absolute inset-x-0 bottom-0 p-4">
                    <p className="text-[0.6rem] uppercase tracking-[0.24em] text-champagne-soft">
                      {property.location.city}
                    </p>
                    <p className="mt-1 font-display text-lg leading-tight text-white">
                      {property.content[locale].title}
                    </p>
                    <p className="mt-1 text-xs text-white/70">
                      {property.priceOnRequest
                        ? t.common.priceOnRequest
                        : formatPriceCompact(property.price, locale)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* ---------------- Menu mobile ---------------- */}
      <div
        ref={mobileRef}
        style={{ display: "none" }}
        className="fixed inset-0 z-[70] hidden flex-col bg-surface px-6 py-6 lg:hidden"
      >
        <div className="flex items-center justify-between">
          <Logo />
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            aria-label={t.nav.close}
            className="p-2 text-ink/70 hover:text-champagne"
          >
            <X size={24} strokeWidth={1.2} />
          </button>
        </div>

        <nav className="mt-16 flex flex-1 flex-col gap-6">
          {[{ label: t.nav.home, path: "" }, ...leftLinks, ...rightLinks].map((item) => (
            <Link
              key={item.path || "home"}
              href={link(item.path)}
              data-mobile-item
              className="font-display text-4xl text-ink/85 transition-colors hover:text-champagne"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div data-mobile-item className="space-y-4 border-t border-line pt-6">
          <a href={`tel:${COMPANY.phoneHref}`} className="flex items-center gap-3 text-sm text-ink/70">
            <Phone size={15} strokeWidth={1.4} className="text-champagne" />
            {COMPANY.phone}
          </a>
          <p className="text-xs text-ink/60">
            {COMPANY.localOffice.street}, {COMPANY.localOffice.city}
          </p>
        </div>
      </div>
    </>
  );
}
