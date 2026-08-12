"use client";

import Image from "next/image";
import { useCallback, useEffect } from "react";
import { ArrowLeft, ArrowRight, X } from "lucide-react";
import { useLocale } from "@/i18n/LocaleProvider";
import type { PropertyImage } from "@/types/property";

/**
 * Visore a schermo intero, con navigazione da tastiera.
 *
 * Vive separato dalla galleria perché lo aprono due cose diverse — la
 * striscia scorrevole della scheda immobile e, in prospettiva, qualunque
 * altra miniatura — e nessuna delle due deve possederlo.
 */
export function Lightbox({
  images,
  index,
  onIndexChange,
  onClose,
}: {
  images: PropertyImage[];
  /** null = chiuso. */
  index: number | null;
  onIndexChange: (index: number) => void;
  onClose: () => void;
}) {
  const { t, locale } = useLocale();

  const move = useCallback(
    (delta: number) => {
      if (index === null) return;
      onIndexChange((index + delta + images.length) % images.length);
    },
    [images.length, index, onIndexChange],
  );

  useEffect(() => {
    if (index === null) return;
    document.documentElement.style.overflow = "hidden";

    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowRight") move(1);
      if (event.key === "ArrowLeft") move(-1);
    }
    document.addEventListener("keydown", onKey);
    return () => {
      document.documentElement.style.overflow = "";
      document.removeEventListener("keydown", onKey);
    };
  }, [index, move, onClose]);

  if (index === null) return null;
  const image = images[index];
  if (!image) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t.property.gallery}
      className="fixed inset-0 z-[95] flex flex-col bg-surface/97 backdrop-blur-xl"
    >
      <div className="flex items-center justify-between border-b border-line px-6 py-5">
        <p className="text-[0.65rem] uppercase tracking-[0.22em] text-ink/60">
          {index + 1} / {images.length}
        </p>
        <button
          type="button"
          onClick={onClose}
          aria-label={t.a11y.closeGallery}
          className="flex h-10 w-10 items-center justify-center border border-line text-ink/70 transition-colors hover:border-champagne hover:text-champagne"
        >
          <X size={18} strokeWidth={1.3} />
        </button>
      </div>

      <div className="relative flex-1">
        <Image
          key={index}
          src={image.src}
          alt={image.alt[locale]}
          fill
          sizes="100vw"
          className="animate-[fade-up_0.5s_var(--ease-luxe)_both] object-contain p-4 md:p-10"
        />
      </div>

      <div className="flex items-center justify-between gap-6 border-t border-line px-6 py-5">
        <p className="max-w-2xl text-xs text-ink/60">{image.caption?.[locale] ?? image.alt[locale]}</p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => move(-1)}
            aria-label={t.a11y.prevImage}
            className="flex h-11 w-11 items-center justify-center border border-line text-ink/70 transition-colors hover:border-champagne hover:text-champagne"
          >
            <ArrowLeft size={16} strokeWidth={1.3} />
          </button>
          <button
            type="button"
            onClick={() => move(1)}
            aria-label={t.a11y.nextImage}
            className="flex h-11 w-11 items-center justify-center border border-line text-ink/70 transition-colors hover:border-champagne hover:text-champagne"
          >
            <ArrowRight size={16} strokeWidth={1.3} />
          </button>
        </div>
      </div>
    </div>
  );
}
