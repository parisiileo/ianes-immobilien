"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { ArrowDown, ArrowUpRight, Star } from "lucide-react";
import { useLocale } from "@/i18n/LocaleProvider";
import { COMPANY } from "@/lib/company";
import { LOCALE_TAGS } from "@/i18n/config";
import { HERO_IMAGE, HERO_IMAGE_ALT, HERO_IMAGE_CREDIT } from "@/lib/hero-media";
import { SearchModule } from "@/components/search/SearchModule";
import { gsap, ScrollTrigger, prefersReducedMotion } from "@/lib/gsap";

/**
 * Punteggio pubblico del profilo Google: cinque stelle vuote e, sopra, la
 * stessa fila ritagliata alla frazione esatta della media, così l'ultima
 * stella resta parziale invece di arrotondare 4,7 a cinque piene.
 *
 * Decorativo: il valore è già scritto in chiaro accanto alle stelle.
 */
function RatingStars({ ratio }: { ratio: number }) {
  const stars = (filled: boolean) =>
    Array.from({ length: COMPANY.rating.best }).map((_, index) => (
      <Star
        key={index}
        size={15}
        strokeWidth={1}
        className={filled ? "shrink-0 fill-champagne-soft text-champagne-soft" : "shrink-0 text-white/30"}
      />
    ));

  return (
    <span aria-hidden className="relative inline-flex">
      <span className="flex gap-1">{stars(false)}</span>
      <span
        className="absolute inset-y-0 left-0 flex gap-1 overflow-hidden"
        style={{ width: `${ratio * 100}%` }}
      >
        {stars(true)}
      </span>
    </span>
  );
}

/**
 * Apertura della home: fotografia a tutta pagina con testo chiaro sopra.
 *
 * È l'unica schermata del sito su fondo scuro. La velatura è uniforme e
 * matta — niente gradienti che spengono l'immagine a metà — e regge il
 * contrasto del testo bianco senza dover schiarire la foto.
 *
 * Il ritmo verticale è tarato in `vh` perché la barra di ricerca deve restare
 * dentro la prima schermata: è il primo gesto che ci si aspetta dalla home.
 */
export function Hero() {
  const { t, link, locale } = useLocale();
  const sectionRef = useRef<HTMLElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const rating = COMPANY.rating;
  const ratingLabel = rating.value.toLocaleString(LOCALE_TAGS[locale], { minimumFractionDigits: 1 });

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      gsap.to(imageRef.current, {
        yPercent: 12,
        scale: 1.06,
        ease: "none",
        scrollTrigger: { trigger: section, start: "top top", end: "bottom top", scrub: true },
      });

      gsap.to(contentRef.current, {
        yPercent: -10,
        opacity: 0,
        ease: "none",
        scrollTrigger: { trigger: section, start: "top top", end: "75% top", scrub: true },
      });
    }, section);

    return () => {
      ctx.revert();
      ScrollTrigger.refresh();
    };
  }, []);

  return (
    <section ref={sectionRef} className="relative min-h-[100svh] overflow-hidden bg-ink">
      {/*
        z-0 e non un indice negativo: la sezione ha un fondo opaco (bg-ink) e
        `position: relative` senza z-index non apre un contesto di
        impilamento, quindi un livello a z negativo finirebbe *dietro* quel
        fondo e la fotografia non si vedrebbe affatto.
      */}
      <div ref={imageRef} className="absolute inset-0 z-0 will-change-transform">
        <Image
          src={HERO_IMAGE}
          alt={HERO_IMAGE_ALT[locale]}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        {/* Velatura matta uniforme: l'immagine resta leggibile ovunque. */}
        <div className="absolute inset-0 bg-ink/45" />
        {/* Rinforzo dove cadono testo e barra di ricerca. */}
        <div className="absolute inset-0 bg-gradient-to-r from-ink/70 via-ink/25 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-ink/85 to-transparent" />
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-ink/70 to-transparent" />
        <div className="grain absolute inset-0" />
      </div>

      {/*
        Corpi e spaziature sono limitati anche in `vh`, non solo in `vw`: su un
        portatile 1280×640 una scala legata alla sola larghezza farebbe
        traboccare la colonna e la barra di ricerca finirebbe sotto la piega.
      */}
      <div className="shell relative flex min-h-[100svh] flex-col justify-between pb-[clamp(0.75rem,2.4vh,1.75rem)] pt-[max(5.75rem,min(7rem,12vh))] md:pt-[max(5.75rem,min(8rem,13vh))]">
        <div ref={contentRef} className="flex flex-1 flex-col justify-center py-[clamp(0.5rem,2.5vh,2.5rem)]">
          <p className="animate-[fade-up_1s_var(--ease-luxe)_0.15s_both] text-[0.6875rem] font-medium uppercase tracking-[0.28em] text-champagne-soft">
            {t.hero.eyebrow}
          </p>

          <h1 className="mt-[clamp(0.5rem,2.2vh,1.5rem)] max-w-5xl font-display leading-[0.94]">
            {/*
              Il minimo in `rem` serve ai telefoni, dove i valori in `vw` sono
              minuscoli; la variante sotto lo abbassa sugli schermi bassi, dove
              quel minimo sarebbe l'unica cosa a far traboccare la colonna.
            */}
            <span className="block animate-[fade-up_1.1s_var(--ease-luxe)_0.25s_both] text-[max(1.7rem,min(3.4vw,5.6vh,2.9rem))] font-extralight text-white/90 [@media(max-height:700px)]:text-[max(1.4rem,min(3.4vw,5.6vh,2.9rem))]">
              {t.hero.titleLead}
            </span>
            <span className="gold-text-on-dark block animate-[fade-up_1.1s_var(--ease-luxe)_0.4s_both] text-[max(3.1rem,min(7.4vw,13vh,6.4rem))] font-light italic leading-[0.88] [@media(max-height:700px)]:text-[max(2.4rem,min(7.4vw,13vh,6.4rem))]">
              {t.hero.titleAccent}
            </span>
            <span className="mt-1 block animate-[fade-up_1.1s_var(--ease-luxe)_0.55s_both] text-[max(1.15rem,min(2.3vw,3.7vh,1.9rem))] font-extralight tracking-tight text-white/75">
              {t.hero.titleTail}
            </span>
          </h1>

          <p className="mt-[clamp(0.6rem,2.4vh,1.75rem)] max-w-xl animate-[fade-up_1.1s_var(--ease-luxe)_0.7s_both] text-[0.9rem] leading-[1.6] text-white/75 [@media(max-height:700px)]:text-[0.82rem]">
            {t.hero.subtitle}
          </p>

          <div className="mt-[clamp(0.85rem,3vh,2.25rem)] flex animate-[fade-up_1.1s_var(--ease-luxe)_0.85s_both] flex-wrap items-center gap-4 [@media(max-height:700px)]:gap-2.5">
            <Link
              href={link("proprieta")}
              className="group flex items-center gap-3 bg-surface px-8 py-[clamp(0.7rem,1.6vh,0.875rem)] text-[0.7rem] uppercase tracking-[0.2em] text-ink transition-colors duration-300 hover:bg-champagne-soft"
            >
              {t.hero.ctaPrimary}
              <ArrowUpRight
                size={15}
                strokeWidth={1.5}
                className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </Link>
            <Link
              href={link("valutazione")}
              className="border border-white/40 px-8 py-[clamp(0.7rem,1.6vh,0.875rem)] text-[0.7rem] uppercase tracking-[0.2em] text-white/90 backdrop-blur-sm transition-all duration-300 hover:border-white hover:bg-white/10"
            >
              {t.hero.ctaSecondary}
            </Link>
          </div>

          {/* Unico dato in apertura: il punteggio pubblico su Google. */}
          <div className="mt-[clamp(0.85rem,3vh,2.25rem)] flex w-fit animate-[fade-up_1.1s_var(--ease-luxe)_1s_both] flex-wrap items-center gap-x-4 gap-y-2 border-t border-white/20 pt-[clamp(0.75rem,2.2vh,1.25rem)]">
            <RatingStars ratio={rating.value / rating.best} />
            <p className="flex items-baseline gap-1.5 font-display text-xl text-white">
              {ratingLabel}
              <span className="text-white/60">/ {rating.best}</span>
            </p>
            <p className="text-[0.62rem] uppercase tracking-[0.2em] text-white/60">{t.hero.stat3}</p>
          </div>
        </div>

        {/* Ricerca compatta, centrata sul bordo inferiore dell'hero */}
        <div className="shrink-0 animate-[fade-up_1.2s_var(--ease-luxe)_1.15s_both]">
          <SearchModule tone="onPhoto" />

          {/* Su schermi bassi l'invito a scorrere cede il posto alla ricerca. */}
          <div className="mt-[clamp(0.5rem,1.6vh,1rem)] flex items-center justify-center gap-3 text-[0.62rem] uppercase tracking-[0.24em] text-white/60 [@media(max-height:700px)]:hidden">
            <ArrowDown size={13} strokeWidth={1.2} className="animate-bounce" />
            {t.common.scroll}
          </div>

          {HERO_IMAGE_CREDIT && (
            <p className="mt-2 text-center text-[0.6rem] text-white/60">{HERO_IMAGE_CREDIT}</p>
          )}
        </div>
      </div>
    </section>
  );
}
