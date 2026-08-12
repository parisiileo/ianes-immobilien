"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { useLocale } from "@/i18n/LocaleProvider";
import { Select, type SelectOption } from "@/components/ui/Select";
import { RangeSlider } from "@/components/ui/RangeSlider";
import { Chip } from "@/components/ui/Checkbox";
import {
  AMENITIES,
  DEFAULT_PRICE_RANGE,
  EMPTY_FILTERS,
  ENERGY_CLASSES,
  PROPERTY_CATEGORIES,
  type PropertyFilters,
} from "@/types/property";
import { formatPriceCompact } from "@/lib/format";
import { gsap } from "@/lib/gsap";

interface FiltersPanelProps {
  open: boolean;
  onClose: () => void;
  filters: PropertyFilters;
  onChange: (filters: PropertyFilters) => void;
  onApply: () => void;
  cities: string[];
  resultCount: number;
}

/**
 * Pannello filtri a tutta pagina. Si apre con un wipe GSAP dall'alto e
 * blocca lo scroll di fondo: è pensato come "stanza" separata, non come
 * dropdown, perché i parametri sono molti.
 */
export function FiltersPanel({
  open,
  onClose,
  filters,
  onChange,
  onApply,
  cities,
  resultCount,
}: FiltersPanelProps) {
  const { t, locale } = useLocale();
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    gsap.killTweensOf(root);

    if (open) {
      gsap.set(root, { display: "block" });
      gsap.fromTo(root, { clipPath: "inset(0 0 100% 0)" }, { clipPath: "inset(0 0 0% 0)", duration: 0.7, ease: "power4.inOut" });
      gsap.fromTo(
        root.querySelectorAll("[data-filter-block]"),
        { opacity: 0, y: 26 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.05, delay: 0.2, ease: "power3.out" },
      );
    } else {
      gsap.to(root, {
        clipPath: "inset(0 0 100% 0)",
        duration: 0.5,
        ease: "power4.inOut",
        onComplete: () => gsap.set(root, { display: "none" }),
      });
    }
  }, [open]);

  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    if (open) document.addEventListener("keydown", onKey);
    return () => {
      document.documentElement.style.overflow = "";
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose, open]);

  const set = <K extends keyof PropertyFilters>(key: K, value: PropertyFilters[K]) =>
    onChange({ ...filters, [key]: value });

  const categoryOptions: SelectOption[] = [
    { value: "all", label: t.common.all },
    ...PROPERTY_CATEGORIES.map((c) => ({ value: c, label: t.enums.category[c] })),
  ];

  const cityOptions: SelectOption[] = [
    { value: "all", label: t.common.all },
    ...cities.map((city) => ({ value: city, label: city })),
  ];

  const listingOptions: SelectOption[] = [
    { value: "all", label: t.enums.listingType.all },
    { value: "sale", label: t.enums.listingTypeShort.sale },
    { value: "rent", label: t.enums.listingTypeShort.rent },
  ];

  const bedroomOptions: SelectOption[] = [
    { value: "0", label: t.filters.bedroomsAny },
    ...[1, 2, 3, 4, 5, 6].map((n) => ({ value: String(n), label: `${n}+` })),
  ];

  const surfaceOptions: SelectOption[] = [
    { value: "0", label: t.common.any },
    ...[80, 120, 180, 250, 350, 500].map((n) => ({ value: String(n), label: `${n} m²+` })),
  ];

  return (
    <div
      ref={rootRef}
      style={{ display: "none" }}
      role="dialog"
      aria-modal="true"
      aria-label={t.filters.title}
      className="fixed inset-0 z-[90] hidden overflow-y-auto bg-surface"
    >
      <div className="shell flex min-h-full flex-col py-8">
        <div className="flex items-start justify-between gap-6 border-b border-line pb-8">
          <div data-filter-block>
            <p className="eyebrow">{t.common.filters}</p>
            <h2 className="mt-3 font-display text-4xl text-ink md:text-5xl">{t.filters.title}</h2>
            <p className="mt-3 max-w-md text-sm text-ink/60">{t.filters.subtitle}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t.nav.close}
            className="flex h-11 w-11 items-center justify-center border border-line text-ink/70 transition-colors hover:border-champagne hover:text-champagne"
          >
            <X size={18} strokeWidth={1.3} />
          </button>
        </div>

        <div className="grid flex-1 gap-10 py-10 lg:grid-cols-2 lg:gap-16">
          <div className="space-y-10">
            <div data-filter-block>
              <RangeSlider
                min={DEFAULT_PRICE_RANGE[0]}
                max={DEFAULT_PRICE_RANGE[1]}
                step={50_000}
                value={[filters.priceMin, filters.priceMax]}
                onChange={([min, max]) => onChange({ ...filters, priceMin: min, priceMax: max })}
                format={(value) => formatPriceCompact(value, locale)}
                label={t.filters.price}
              />
            </div>

            <div className="grid gap-6 sm:grid-cols-2" data-filter-block>
              <Select
                label={t.filters.listingType}
                value={filters.listingType}
                options={listingOptions}
                onChange={(value) => set("listingType", value as PropertyFilters["listingType"])}
              />
              <Select
                label={t.filters.category}
                value={filters.category}
                options={categoryOptions}
                onChange={(value) => set("category", value as PropertyFilters["category"])}
              />
              <Select
                label={t.filters.city}
                value={filters.city}
                options={cityOptions}
                searchable
                onChange={(value) => set("city", value)}
              />
              <Select
                label={t.filters.bedrooms}
                value={String(filters.bedroomsMin)}
                options={bedroomOptions}
                onChange={(value) => set("bedroomsMin", Number(value))}
              />
              <Select
                label={t.filters.surface}
                value={String(filters.surfaceMin)}
                options={surfaceOptions}
                onChange={(value) => set("surfaceMin", Number(value))}
              />
            </div>
          </div>

          <div className="space-y-10">
            <div data-filter-block>
              <p className="mb-4 text-[0.6875rem] uppercase tracking-[0.22em] text-ink/60">{t.filters.amenities}</p>
              <div className="flex flex-wrap gap-2.5">
                {AMENITIES.map((amenity) => (
                  <Chip
                    key={amenity}
                    active={filters.amenities.includes(amenity)}
                    onClick={() =>
                      set(
                        "amenities",
                        filters.amenities.includes(amenity)
                          ? filters.amenities.filter((a) => a !== amenity)
                          : [...filters.amenities, amenity],
                      )
                    }
                  >
                    {t.enums.amenity[amenity]}
                  </Chip>
                ))}
              </div>
            </div>

            <div data-filter-block>
              <p className="mb-4 text-[0.6875rem] uppercase tracking-[0.22em] text-ink/60">{t.filters.energy}</p>
              <div className="flex flex-wrap gap-2.5">
                {ENERGY_CLASSES.map((energyClass) => (
                  <Chip
                    key={energyClass}
                    active={filters.energyClasses.includes(energyClass)}
                    onClick={() =>
                      set(
                        "energyClasses",
                        filters.energyClasses.includes(energyClass)
                          ? filters.energyClasses.filter((e) => e !== energyClass)
                          : [...filters.energyClasses, energyClass],
                      )
                    }
                    className="min-w-12 text-center"
                  >
                    {energyClass}
                  </Chip>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div
          data-filter-block
          className="sticky bottom-0 flex flex-col gap-4 border-t border-line bg-surface/95 py-6 backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between"
        >
          <button
            type="button"
            onClick={() => onChange({ ...EMPTY_FILTERS })}
            className="text-left text-[0.7rem] uppercase tracking-[0.2em] text-ink/60 transition-colors hover:text-ink"
          >
            {t.filters.clearAll}
          </button>
          <button
            type="button"
            onClick={() => {
              onApply();
              onClose();
            }}
            className="group flex items-center justify-center gap-3 bg-champagne-deep px-8 py-4 text-[0.7rem] uppercase tracking-[0.2em] text-surface transition-colors hover:bg-ink"
          >
            {t.filters.showResults}
            <span className="font-display text-base leading-none">{resultCount}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
