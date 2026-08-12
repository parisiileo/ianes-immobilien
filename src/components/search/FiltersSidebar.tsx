"use client";

import { useLocale } from "@/i18n/LocaleProvider";
import { Select, type SelectOption } from "@/components/ui/Select";
import { RangeSlider } from "@/components/ui/RangeSlider";
import { Chip } from "@/components/ui/Checkbox";
import {
  AMENITIES,
  DEFAULT_PRICE_RANGE,
  EMPTY_FILTERS,
  PROPERTY_CATEGORIES,
  type PropertyFilters,
} from "@/types/property";
import { countActiveFilters } from "@/lib/filters";
import { formatPriceCompact } from "@/lib/format";
import { cn } from "@/lib/cn";

/**
 * Filtri sempre visibili nella colonna sinistra della listing.
 *
 * Contiene solo i controlli usati davvero a ogni ricerca: contratto, comune,
 * tipologia, prezzo, camere e comfort. Le classi energetiche, che si toccano
 * di rado, restano nel pannello a tutta pagina.
 */
export function FiltersSidebar({
  filters,
  onChange,
  cities,
  onOpenAdvanced,
  className,
}: {
  filters: PropertyFilters;
  onChange: (filters: PropertyFilters) => void;
  cities: string[];
  onOpenAdvanced: () => void;
  className?: string;
}) {
  const { t, locale } = useLocale();

  const set = <K extends keyof PropertyFilters>(key: K, value: PropertyFilters[K]) =>
    onChange({ ...filters, [key]: value });

  const active = countActiveFilters(filters);

  const categoryOptions: SelectOption[] = [
    { value: "all", label: t.common.all },
    ...PROPERTY_CATEGORIES.map((c) => ({ value: c, label: t.enums.category[c] })),
  ];
  const cityOptions: SelectOption[] = [
    { value: "all", label: t.common.all },
    ...cities.map((city) => ({ value: city, label: city })),
  ];
  const bedroomOptions: SelectOption[] = [
    { value: "0", label: t.filters.bedroomsAny },
    ...[1, 2, 3, 4, 5, 6].map((n) => ({ value: String(n), label: `${n}+` })),
  ];

  const contracts: Array<{ value: PropertyFilters["listingType"]; label: string }> = [
    { value: "all", label: t.enums.listingType.all },
    { value: "sale", label: t.enums.listingTypeShort.sale },
    { value: "rent", label: t.enums.listingTypeShort.rent },
  ];

  return (
    <div className={cn("border border-line bg-surface", className)}>
      <header className="flex items-center justify-between border-b border-line px-6 py-4">
        <p className="text-[0.62rem] uppercase tracking-[0.16em] text-ink/60">{t.common.filters}</p>
        {active > 0 && (
          <button
            type="button"
            onClick={() => onChange({ ...EMPTY_FILTERS })}
            className="text-[0.62rem] uppercase tracking-[0.14em] text-champagne underline-offset-4 hover:underline"
          >
            {t.common.reset}
          </button>
        )}
      </header>

      <div className="space-y-6 px-6 py-6">
        {/* Contratto */}
        <div className="flex border border-line">
          {contracts.map((contract) => (
            <button
              key={contract.value}
              type="button"
              onClick={() => set("listingType", contract.value)}
              className={cn(
                "flex-1 px-2 py-2.5 text-[0.6rem] uppercase tracking-[0.16em] transition-colors",
                filters.listingType === contract.value
                  ? "bg-ink text-surface"
                  : "text-ink/60 hover:bg-surface-soft hover:text-ink",
              )}
            >
              {contract.label}
            </button>
          ))}
        </div>

        <Select
          label={t.filters.city}
          value={filters.city}
          options={cityOptions}
          searchable
          onChange={(value) => set("city", value)}
        />

        <Select
          label={t.filters.category}
          value={filters.category}
          options={categoryOptions}
          onChange={(value) => set("category", value as PropertyFilters["category"])}
        />

        <RangeSlider
          min={DEFAULT_PRICE_RANGE[0]}
          max={DEFAULT_PRICE_RANGE[1]}
          step={50_000}
          value={[filters.priceMin, filters.priceMax]}
          onChange={([min, max]) => onChange({ ...filters, priceMin: min, priceMax: max })}
          format={(value) => formatPriceCompact(value, locale)}
          label={t.filters.price}
        />

        <Select
          label={t.filters.bedrooms}
          value={String(filters.bedroomsMin)}
          options={bedroomOptions}
          onChange={(value) => set("bedroomsMin", Number(value))}
        />

        <div>
          <p className="mb-3 text-[0.6875rem] uppercase tracking-[0.16em] text-ink/60">
            {t.filters.amenities}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {AMENITIES.slice(0, 8).map((amenity) => (
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
                className="px-2.5 py-1.5 text-[0.65rem]"
              >
                {t.enums.amenity[amenity]}
              </Chip>
            ))}
          </div>
        </div>

        {/* Classe energetica e resto dei parametri stanno nel pannello a
            tutta pagina: qui allungherebbero la colonna oltre lo schermo,
            e `sticky` smette di agganciarsi appena supera l'altezza utile. */}
        <button
          type="button"
          onClick={onOpenAdvanced}
          className="w-full border border-line px-4 py-3 text-[0.62rem] uppercase tracking-[0.14em] text-ink/70 transition-colors hover:border-champagne hover:text-champagne"
        >
          {t.search.openFilters}
        </button>
      </div>
    </div>
  );
}
