"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Expand } from "lucide-react";
import { useLocale } from "@/i18n/LocaleProvider";
import { cn } from "@/lib/cn";
import type { PropertyImage } from "@/types/property";

/**
 * Galleria a scorrimento orizzontale della scheda immobile.
 *
 * È un contenitore con overflow nativo, non una pila di trasformazioni: si
 * sfoglia con la rotellina, con il trackpad, trascinando, con Tab e con le
 * frecce, e su telefono con lo swipe di sistema. Lo scatto (`snap`) allinea
 * sempre una fotografia al bordo sinistro.
 *
 * La rotellina verticale viene convertita in scorrimento orizzontale solo
 * finché la striscia ha ancora strada da fare in quella direzione: arrivata in
 * fondo la pagina riprende a scorrere normalmente, così la galleria non
 * intrappola chi sta solo attraversando la sezione.
 */
export function GalleryCarousel({
  images,
  onOpen,
}: {
  images: PropertyImage[];
  onOpen: (index: number) => void;
}) {
  const { t, locale } = useLocale();
  const trackRef = useRef<HTMLUListElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const syncEdges = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const max = track.scrollWidth - track.clientWidth;
    setAtStart(track.scrollLeft <= 1);
    setAtEnd(track.scrollLeft >= max - 1);
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    syncEdges();

    const observer = new ResizeObserver(syncEdges);
    observer.observe(track);
    return () => observer.disconnect();
  }, [syncEdges, images.length]);

  /**
   * La rotellina verticale muove la striscia. `passive: false` è necessario
   * per poter annullare l'evento: senza, il browser scorrerebbe comunque la
   * pagina e si vedrebbero i due movimenti insieme.
   */
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    function onWheel(event: WheelEvent) {
      const el = trackRef.current;
      if (!el) return;
      // Un gesto già orizzontale (trackpad, shift+rotellina) lo gestisce il browser.
      if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;

      const max = el.scrollWidth - el.clientWidth;
      if (max <= 0) return;
      const heading = Math.sign(event.deltaY);
      const room = heading > 0 ? max - el.scrollLeft : el.scrollLeft;
      if (room <= 1) return; // fine corsa: la pagina riprende a scorrere

      event.preventDefault();
      el.scrollLeft += event.deltaY;
    }

    track.addEventListener("wheel", onWheel, { passive: false });
    return () => track.removeEventListener("wheel", onWheel);
  }, []);

  /** Un passo = la larghezza della prima diapositiva più il divario. */
  const step = useCallback((direction: 1 | -1) => {
    const track = trackRef.current;
    if (!track) return;
    const slide = track.firstElementChild as HTMLElement | null;
    const amount = slide ? slide.offsetWidth + 12 : track.clientWidth * 0.8;
    track.scrollBy({ left: amount * direction, behavior: "smooth" });
  }, []);

  if (images.length === 0) return null;

  const arrowClass =
    "flex h-11 w-11 items-center justify-center border border-line text-ink/70 transition-colors hover:border-champagne hover:text-champagne disabled:pointer-events-none disabled:opacity-30";

  return (
    <div>
      <ul
        ref={trackRef}
        onScroll={syncEdges}
        tabIndex={0}
        aria-label={t.property.gallery}
        className="no-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain pb-1 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-champagne"
      >
        {images.map((image, index) => (
          <li
            key={image.src + index}
            className={cn(
              "relative shrink-0 snap-start",
              // Altezza unica per tutte e larghezza variabile: è la striscia
              // di una pellicola. Con l'aspetto fisso invece dell'altezza, la
              // prima diapositiva — più larga — diventava anche molto più
              // alta delle altre e la fila risultava sfalsata.
              index === 0 ? "w-[86vw] md:w-[56vw]" : "w-[86vw] md:w-[38vw] lg:w-[30vw]",
            )}
          >
            <button
              type="button"
              onClick={() => onOpen(index)}
              aria-label={`${t.property.galleryOpen} — ${image.alt[locale]}`}
              className="group relative block h-[clamp(16rem,52vh,30rem)] w-full overflow-hidden bg-surface-soft"
            >
              <Image
                src={image.src}
                alt={image.alt[locale]}
                fill
                sizes="(max-width: 768px) 86vw, 60vw"
                className="object-cover transition-transform duration-[1.4s] ease-[var(--ease-luxe)] group-hover:scale-105"
              />
              <span className="absolute inset-0 bg-surface/0 transition-colors duration-500 group-hover:bg-surface/20" />
              <span className="absolute bottom-3 right-3 flex h-8 w-8 items-center justify-center border border-line bg-surface/60 text-ink/80 opacity-0 backdrop-blur-md transition-opacity duration-300 group-hover:opacity-100">
                <Expand size={13} strokeWidth={1.4} />
              </span>
              <span className="absolute left-3 top-3 bg-ink/55 px-2.5 py-1 text-[0.6rem] tracking-[0.14em] text-white backdrop-blur-md">
                {String(index + 1).padStart(2, "0")} / {String(images.length).padStart(2, "0")}
              </span>
            </button>

            {image.caption && (
              <p className="mt-3 text-xs leading-relaxed text-ink/60">{image.caption[locale]}</p>
            )}
          </li>
        ))}
      </ul>

      <div className="mt-6 flex items-center justify-between gap-6">
        <p className="text-[0.65rem] uppercase tracking-[0.2em] text-ink/60">{t.property.galleryHint}</p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => step(-1)}
            disabled={atStart}
            aria-label={t.a11y.prevImage}
            className={arrowClass}
          >
            <ArrowLeft size={16} strokeWidth={1.3} />
          </button>
          <button
            type="button"
            onClick={() => step(1)}
            disabled={atEnd}
            aria-label={t.a11y.nextImage}
            className={arrowClass}
          >
            <ArrowRight size={16} strokeWidth={1.3} />
          </button>
        </div>
      </div>
    </div>
  );
}
