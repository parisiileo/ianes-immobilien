"use client";

import Link from "next/link";
import { ArrowUpRight, Bath, BedDouble, Expand, Maximize } from "lucide-react";
import { useLocale } from "@/i18n/LocaleProvider";
import { formatListingPrice, formatNumber } from "@/lib/format";
import { CoverImage } from "./CoverImage";
import { cn } from "@/lib/cn";
import type { Property } from "@/types/property";

interface PropertyCardProps {
  property: Property;
  priority?: boolean;
  className?: string;
  /** Callback usate dalla listing page per sincronizzare la mappa. */
  onHover?: (id: string | null) => void;
  active?: boolean;
  /** Se presente aggiunge il pulsante "vista rapida" accanto al prezzo. */
  onQuickView?: (property: Property) => void;
  sizes?: string;
}

/**
 * Scheda immobile: un'unica implementazione per home, listing e "simili".
 *
 * È una superficie chiusa (bordo + fondo) con il testo in un blocco che ha
 * il suo respiro: prima il testo arrivava a filo del bordo perché la card
 * era pensata senza cornice, e con la cornice risultava schiacciata.
 * `flex-col` + `mt-auto` tengono prezzo e dati allineati fra card di
 * altezza diversa nella stessa riga.
 */
export function PropertyCard({
  property,
  priority = false,
  className,
  onHover,
  active = false,
  onQuickView,
  sizes = "(max-width: 640px) 92vw, (max-width: 1280px) 45vw, 30vw",
}: PropertyCardProps) {
  const { t, link, locale } = useLocale();
  const content = property.content[locale];
  const cover = property.images[0];
  const href = link(`proprieta/${property.slug}`);

  const statusTone =
    property.status === "available"
      ? "border-champagne-soft/70 bg-black/35 text-champagne-soft"
      : property.status === "reserved"
        ? "border-white/40 bg-black/35 text-white/90"
        : "border-white/25 bg-black/50 text-white/70";

  return (
    <article
      onMouseEnter={() => onHover?.(property.id)}
      onMouseLeave={() => onHover?.(null)}
      className={cn(
        "group flex flex-col border bg-surface transition-all duration-500",
        active ? "border-champagne shadow-float" : "border-line hover:border-line-strong hover:shadow-float",
        className,
      )}
    >
      <Link href={href} className="block">
        <div className="relative aspect-[4/3] overflow-hidden bg-surface-soft">
          <CoverImage
            image={cover}
            priority={priority}
            className="absolute inset-0"
            sizes={sizes}
            imageClassName="object-cover transition-transform duration-[1.4s] ease-[var(--ease-luxe)] group-hover:scale-[1.05]"
          />
          {/* Velatura leggera: serve solo a far leggere le etichette. */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-transparent to-transparent" />

          <div className="absolute left-4 top-4 flex flex-wrap gap-2">
            <span
              className={cn(
                "border px-3 py-1.5 text-[0.58rem] uppercase tracking-[0.14em] backdrop-blur-md",
                statusTone,
              )}
            >
              {t.enums.status[property.status]}
            </span>
            <span className="border border-white/40 bg-black/35 px-3 py-1.5 text-[0.58rem] uppercase tracking-[0.14em] text-white/90 backdrop-blur-md">
              {t.enums.listingTypeShort[property.listingType]}
            </span>
          </div>

          <span className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center border border-white/40 bg-black/35 text-white opacity-0 backdrop-blur-md transition-all duration-500 group-hover:opacity-100">
            <ArrowUpRight size={15} strokeWidth={1.4} />
          </span>
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-6 xl:p-8">
        <p className="text-[0.6rem] uppercase tracking-[0.16em] text-champagne">
          {property.location.city}
          {property.location.zone ? ` · ${property.location.zone}` : ""}
        </p>

        <Link href={href} className="mt-3 block">
          <h3 className="line-clamp-2 font-display text-[1.5rem] leading-[1.18] text-ink transition-colors duration-300 group-hover:text-champagne xl:text-[1.75rem]">
            {content.title}
          </h3>
        </Link>

        {content.subtitle && (
          <p className="mt-2.5 line-clamp-2 text-sm leading-relaxed text-ink/60">{content.subtitle}</p>
        )}

        {/* mt-auto: dati e prezzo restano allineati fra card di testo diverso. */}
        <dl className="mt-auto flex flex-wrap items-center gap-x-6 gap-y-2 pt-7 text-xs text-ink/65">
          <div className="flex items-center gap-2">
            <Maximize size={13} strokeWidth={1.3} className="text-ink/60" />
            <dd>{formatNumber(property.surfaceSqm, locale)} m²</dd>
          </div>
          <div className="flex items-center gap-2">
            <BedDouble size={13} strokeWidth={1.3} className="text-ink/60" />
            <dd>{property.bedrooms}</dd>
          </div>
          <div className="flex items-center gap-2">
            <Bath size={13} strokeWidth={1.3} className="text-ink/60" />
            <dd>{property.bathrooms}</dd>
          </div>
          <dd className="ml-auto border border-line px-2.5 py-1 text-[0.6rem] tracking-[0.12em] text-ink/65">
            {property.energyClass}
          </dd>
        </dl>

        <div className="mt-5 flex items-end justify-between gap-4 border-t border-line pt-5">
          <p className="font-display text-xl leading-none text-ink">
            {property.priceOnRequest
              ? t.common.priceOnRequest
              : formatListingPrice(property.price, locale, property.listingType, t.common.perMonth)}
          </p>

          {onQuickView && (
            <button
              type="button"
              onClick={() => onQuickView(property)}
              className="flex shrink-0 items-center gap-2 text-[0.6rem] uppercase tracking-[0.16em] text-ink/60 transition-colors hover:text-champagne"
            >
              <Expand size={12} strokeWidth={1.4} />
              {t.common.quickView}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
