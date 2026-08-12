"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { ArrowRight } from "lucide-react";
import { useLocale } from "@/i18n/LocaleProvider";
import { useProperties } from "@/components/PropertiesProvider";
import { formatListingPrice, formatNumber } from "@/lib/format";
import { gsap, prefersReducedMotion } from "@/lib/gsap";

/**
 * Vetrina orizzontale: la sezione resta ferma a schermo mentre la traccia
 * scorre lateralmente. L'altezza della sezione è calcolata sulla larghezza
 * reale della traccia, così la velocità percepita resta costante su ogni
 * viewport e non c'è "coda" vuota alla fine.
 *
 * La traccia è un contenitore con overflow nativo e l'avanzamento legato allo
 * scorrimento della pagina scrive su `scrollLeft`, non su una trasformazione.
 * Costa un attributo in più ma cambia l'uso: la striscia si sfoglia anche a
 * mano — trascinandola, con lo swipe, con shift+rotellina, con Tab — e non
 * solo scorrendo la pagina. Con una `transform` le due cose si escluderebbero,
 * perché il contenuto non uscirebbe mai dal riquadro e non ci sarebbe niente
 * da scorrere.
 */
export function HorizontalCollection() {
  const { t, link, locale } = useLocale();
  const properties = useProperties();
  // La vetrina orizzontale vive di immagini: le schede senza foto sono escluse.
  const items = properties.filter((property) => property.images.length > 0).slice(0, 6);

  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track) return;

    // Senza animazione la striscia resta comunque sfogliabile a mano: non
    // c'è nulla da disattivare, solo l'aggancio allo scorrimento della pagina.
    if (prefersReducedMotion()) {
      section.style.height = "";
      return;
    }

    const ctx = gsap.context(() => {
      const getDistance = () => Math.max(0, track.scrollWidth - track.clientWidth);

      const proxy = { value: 0 };
      gsap.to(proxy, {
        value: () => getDistance(),
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: () => `+=${getDistance()}`,
          scrub: 0.8,
          invalidateOnRefresh: true,
        },
        onUpdate: () => {
          track.scrollLeft = proxy.value;
        },
      });

      // L'altezza della sezione deve coprire l'intera corsa orizzontale.
      const setHeight = () => {
        section.style.height = `${window.innerHeight + getDistance()}px`;
      };
      setHeight();
      window.addEventListener("resize", setHeight);
      return () => window.removeEventListener("resize", setHeight);
    }, section);

    return () => ctx.revert();
  }, [items.length]);

  /**
   * Trascinamento col puntatore.
   *
   * Lo swipe su telefono lo dà già il browser; con il mouse no, e il testo di
   * servizio invita da sempre a trascinare. Oltre la soglia di qualche pixel
   * il click viene annullato in cattura, altrimenti il rilascio del
   * trascinamento aprirebbe la scheda dell'immobile sotto il cursore.
   */
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    let pointerId: number | null = null;
    let startX = 0;
    let startScroll = 0;
    let dragged = false;

    function onPointerDown(event: PointerEvent) {
      if (event.pointerType !== "mouse" || event.button !== 0) return;
      pointerId = event.pointerId;
      startX = event.clientX;
      startScroll = track!.scrollLeft;
      dragged = false;
    }

    function onPointerMove(event: PointerEvent) {
      if (pointerId !== event.pointerId) return;
      const delta = event.clientX - startX;
      if (!dragged && Math.abs(delta) < 4) return;
      dragged = true;
      track!.scrollLeft = startScroll - delta;
    }

    function endDrag(event: PointerEvent) {
      if (pointerId !== event.pointerId) return;
      pointerId = null;
      // Il flag sopravvive un giro di eventi: serve al click che segue.
      if (dragged) window.setTimeout(() => (dragged = false), 0);
    }

    function onClickCapture(event: MouseEvent) {
      if (!dragged) return;
      event.preventDefault();
      event.stopPropagation();
    }

    track.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", endDrag);
    window.addEventListener("pointercancel", endDrag);
    track.addEventListener("click", onClickCapture, true);

    return () => {
      track.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", endDrag);
      window.removeEventListener("pointercancel", endDrag);
      track.removeEventListener("click", onClickCapture, true);
    };
  }, []);

  if (items.length === 0) return null;

  return (
    <section ref={sectionRef} className="relative bg-surface-soft" aria-labelledby="collection-title">
      <div className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden py-14 md:py-20">
        <div className="shell mb-8 flex flex-wrap items-end justify-between gap-6 md:mb-10">
          <div>
            <h2
              id="collection-title"
              className="font-display text-[clamp(2.2rem,4.6vw,3.8rem)] leading-none text-ink"
            >
              {t.home.horizontal.title}
            </h2>
          </div>
          <p className="flex items-center gap-3 text-[0.65rem] uppercase tracking-[0.16em] text-ink/60">
            {t.home.horizontal.hint}
            <ArrowRight size={14} strokeWidth={1.2} />
          </p>
        </div>

        <div
          ref={trackRef}
          className="no-scrollbar flex min-h-0 flex-1 cursor-grab items-center gap-6 overflow-x-auto overscroll-x-contain px-5 active:cursor-grabbing md:px-10 xl:px-16"
        >
          {items.map((property, index) => (
            <Link
              key={property.id}
              href={link(`proprieta/${property.slug}`)}
              className="group relative block aspect-[3/4] h-full max-h-[46rem] w-auto min-w-[62vw] max-w-[86vw] shrink-0 sm:min-w-0 sm:max-w-none"
            >
              <div className="relative h-full w-full overflow-hidden bg-surface">
                <Image
                  src={property.images[Math.min(1, property.images.length - 1)].src}
                  alt={property.images[Math.min(1, property.images.length - 1)].alt[locale]}
                  fill
                  sizes="(max-width: 640px) 86vw, (max-width: 1024px) 50vw, 620px"
                  className="object-cover transition-transform duration-[1.4s] ease-[var(--ease-luxe)] group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/10" />

                <span className="absolute left-5 top-5 font-display text-4xl text-white/40 sm:text-5xl">
                  {String(index + 1).padStart(2, "0")}
                </span>

                <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
                  <p className="text-[0.6rem] uppercase tracking-[0.16em] text-champagne-soft">
                    {property.location.city}
                  </p>
                  <h3 className="mt-2 font-display text-2xl leading-tight text-white">
                    {property.content[locale].title}
                  </h3>
                  <div className="mt-4 flex items-center justify-between border-t border-white/25 pt-3 text-xs text-white/75">
                    <span>{formatNumber(property.surfaceSqm, locale)} m²</span>
                    <span>
                      {property.priceOnRequest
                        ? t.common.priceOnRequest
                        : formatListingPrice(property.price, locale, property.listingType, t.common.perMonth)}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}

          <Link
            href={link("proprieta")}
            className="flex h-full max-h-[46rem] w-[52vw] shrink-0 items-center justify-center border border-line px-8 text-center sm:w-[30vw] lg:w-[20vw]"
          >
            <span className="group flex flex-col items-center gap-4">
              <span className="font-display text-3xl text-ink">{t.common.viewAll}</span>
              <ArrowRight
                size={20}
                strokeWidth={1}
                className="text-champagne transition-transform duration-300 group-hover:translate-x-1"
              />
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
