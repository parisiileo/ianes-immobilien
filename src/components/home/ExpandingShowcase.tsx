"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { ArrowUpRight } from "lucide-react";
import { useLocale } from "@/i18n/LocaleProvider";
import { useProperties } from "@/components/PropertiesProvider";
import { gsap, prefersReducedMotion } from "@/lib/gsap";

/**
 * Espansione dell'immagine allo scroll.
 *
 * La card parte incorniciata (62vw × 64vh) e, mentre la sezione resta
 * appiccicata al viewport, cresce fino a occuparlo interamente. Uso
 * `position: sticky` invece del pin di ScrollTrigger: con Lenis attivo il pin
 * introduce un offset di un frame sul primo scroll, sticky no.
 */
export function ExpandingShowcase() {
  const { t, link, locale } = useLocale();
  const properties = useProperties();
  const hero = properties.find((property) => property.featured) ?? properties[0];

  const sectionRef = useRef<HTMLElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const captionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const frame = frameRef.current;
    if (!section || !frame) return;

    // Senza animazione la didascalia resterebbe al suo stato iniziale, cioè
    // invisibile: la si mostra subito, velatura compresa.
    if (prefersReducedMotion()) {
      gsap.set(captionRef.current, { opacity: 1, y: 0 });
      return;
    }

    const ctx = gsap.context(() => {
      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.6,
        },
      });

      timeline
        .fromTo(
          frame,
          { width: "62vw", height: "64vh" },
          { width: "100vw", height: "100vh", ease: "power2.inOut" },
          0,
        )
        .fromTo(
          captionRef.current,
          { opacity: 0, y: 40 },
          { opacity: 1, y: 0, ease: "power2.out", duration: 0.4 },
          0.45,
        );
    }, section);

    return () => ctx.revert();
  }, []);

  // Senza immagine di copertina la sezione non ha nulla da espandere.
  if (!hero || !hero.images[0]) return null;

  return (
    <section ref={sectionRef} className="relative h-[240vh] bg-surface" aria-labelledby="showcase-title">
      <div className="sticky top-0 flex h-screen items-center justify-center overflow-hidden">
        <div
          ref={frameRef}
          className="relative overflow-hidden"
          style={{ width: "62vw", height: "64vh" }}
        >
          <Image
            src={hero.images[0].src}
            alt={hero.images[0].alt[locale]}
            fill
            sizes="100vw"
            className="object-cover"
          />
          <div
            ref={captionRef}
            className="absolute inset-x-0 bottom-0 p-8 md:p-16"
            style={{ opacity: 0 }}
          >
            {/*
              La velatura è agganciata alla didascalia, non al fotogramma: una
              patina bianca su tutta l'immagine la sbiadiva proprio mentre si
              apre a schermo intero. Così copre esattamente il testo — e solo
              quello — a qualsiasi altezza di riquadro, mentre il resto della
              fotografia resta pieno.
            */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 bottom-0 -top-24"
              style={{
                background:
                  "linear-gradient(to top, rgba(251,250,248,0.97) 0%, rgba(251,250,248,0.94) 48%, rgba(251,250,248,0.72) 74%, rgba(251,250,248,0) 100%)",
              }}
            />

            <div className="shell relative">
              <p className="eyebrow">{t.home.showcase.eyebrow}</p>
              <h2
                id="showcase-title"
                className="mt-5 max-w-3xl font-display text-[clamp(2.2rem,5.4vw,4.6rem)] leading-[1.02] text-ink"
              >
                {t.home.showcase.title}
              </h2>
              <p className="mt-5 max-w-xl text-sm leading-relaxed text-ink/60">{t.home.showcase.subtitle}</p>

              <Link
                href={link(`proprieta/${hero.slug}`)}
                className="group mt-8 inline-flex items-center gap-3 border border-line bg-surface/40 px-7 py-3.5 text-[0.7rem] uppercase tracking-[0.2em] text-ink backdrop-blur-md transition-colors hover:border-champagne hover:text-champagne"
              >
                {hero.content[locale].title}
                <ArrowUpRight
                  size={14}
                  strokeWidth={1.4}
                  className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
