"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { ChevronDown, MapPin, Search, SlidersHorizontal, X } from "lucide-react";
import { useLocale } from "@/i18n/LocaleProvider";
import { useProperties } from "@/components/PropertiesProvider";
import { Select, type SelectOption } from "@/components/ui/Select";
import { useAnchoredPanel } from "@/components/ui/useAnchoredPanel";
import { RangeSlider } from "@/components/ui/RangeSlider";
import { Chip } from "@/components/ui/Checkbox";
import {
  AMENITIES,
  DEFAULT_PRICE_RANGE,
  EMPTY_FILTERS,
  PROPERTY_CATEGORIES,
  type PropertyFilters,
} from "@/types/property";
import { applyFilters, countActiveFilters, filtersToSearchParams } from "@/lib/filters";
import { formatPriceCompact } from "@/lib/format";
import { gsap } from "@/lib/gsap";
import { cn } from "@/lib/cn";

type Mode = "sale" | "rent" | "estimate";

/**
 * Barra di ricerca dell'hero.
 *
 * Volutamente minuta: tre linguette di testo e una riga con poche celle.
 * Tutto il resto — fascia di prezzo, camere, comfort — vive nel mega menu
 * che si apre *dentro* l'hero al primo clic, così la prima schermata resta
 * pulita e la ricerca avanzata è comunque a un gesto di distanza.
 */
export function SearchModule({ tone = "default" }: { tone?: "default" | "onPhoto" } = {}) {
  const { t, link, locale, fill } = useLocale();
  const onPhoto = tone === "onPhoto";
  const router = useRouter();
  const properties = useProperties();

  const [mode, setMode] = useState<Mode>("sale");
  const [filters, setFilters] = useState<PropertyFilters>({ ...EMPTY_FILTERS, listingType: "sale" });
  const [open, setOpen] = useState(false);
  const [suggestOpen, setSuggestOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const locationFieldRef = useRef<HTMLDivElement>(null);

  const locations = useMemo(() => {
    const values = new Set<string>();
    for (const property of properties) {
      if (property.location.city) values.add(property.location.city);
      if (property.location.zone) values.add(`${property.location.zone}, ${property.location.city}`);
    }
    return Array.from(values).sort((a, b) => a.localeCompare(b));
  }, [properties]);

  const cities = useMemo(
    () =>
      Array.from(new Set(properties.map((p) => p.location.city).filter(Boolean))).sort((a, b) =>
        a.localeCompare(b),
      ),
    [properties],
  );

  const suggestions = useMemo(() => {
    const needle = filters.query.trim().toLowerCase();
    if (!needle) return locations.slice(0, 6);
    return locations.filter((location) => location.toLowerCase().includes(needle)).slice(0, 6);
  }, [filters.query, locations]);

  const [suggestPlacement, measureSuggestions] = useAnchoredPanel({
    open: suggestOpen && suggestions.length > 0,
    anchorRef: locationFieldRef,
    estimatedHeight: suggestions.length * 42 + 34,
  });

  const matching = useMemo(() => applyFilters(properties, filters, locale), [filters, locale, properties]);
  const activeCount = countActiveFilters(filters);

  /* Apertura / chiusura del mega menu */
  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;
    gsap.killTweensOf(panel);

    if (open) {
      gsap.set(panel, { display: "flex" });
      gsap.fromTo(
        panel,
        { opacity: 0, y: 18, clipPath: "inset(0 0 100% 0)" },
        { opacity: 1, y: 0, clipPath: "inset(0 0 0% 0)", duration: 0.55, ease: "power3.out" },
      );
      gsap.fromTo(
        panel.querySelectorAll("[data-mega-block]"),
        { opacity: 0, y: 14 },
        {
          opacity: 1,
          y: 0,
          duration: 0.45,
          stagger: 0.05,
          delay: 0.1,
          ease: "power3.out",
          /* Senza questo i blocchi restano con una `transform` inline: ognuno
             diventa un contesto di impilamento e qualsiasi elemento sovrapposto
             finirebbe sotto i campi che lo seguono nel DOM. */
          clearProps: "transform,opacity",
        },
      );
    } else {
      gsap.to(panel, {
        opacity: 0,
        y: 12,
        duration: 0.28,
        ease: "power2.in",
        onComplete: () => gsap.set(panel, { display: "none" }),
      });
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onDown(event: MouseEvent) {
      const target = event.target as HTMLElement;
      // Le tendine vivono in un portale sul <body>: fuori dal modulo nel DOM,
      // ma parte del mega menu per l'utente.
      if (target.closest?.("[data-floating-panel]")) return;
      if (!rootRef.current?.contains(target)) setOpen(false);
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function submit() {
    if (mode === "estimate") {
      router.push(link("valutazione"));
      return;
    }
    const params = filtersToSearchParams({ ...filters, listingType: mode }, "relevance");
    router.push(`${link("proprieta")}?${params.toString()}`);
  }

  const set = <K extends keyof PropertyFilters>(key: K, value: PropertyFilters[K]) =>
    setFilters((current) => ({ ...current, [key]: value }));

  const modes: Array<{ key: Mode; label: string }> = [
    { key: "sale", label: t.enums.listingType.sale },
    { key: "rent", label: t.enums.listingType.rent },
    { key: "estimate", label: t.enums.listingType.estimate },
  ];

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
  const surfaceOptions: SelectOption[] = [
    { value: "0", label: t.common.any },
    ...[80, 120, 180, 250, 350, 500].map((n) => ({ value: String(n), label: `${n} m²+` })),
  ];

  const budgetTouched = filters.priceMax < DEFAULT_PRICE_RANGE[1] || filters.priceMin > DEFAULT_PRICE_RANGE[0];
  const budgetLabel = budgetTouched
    ? `${formatPriceCompact(filters.priceMin, locale)} – ${formatPriceCompact(filters.priceMax, locale)}`
    : t.common.any;

  const cellClass =
    "flex min-w-0 flex-1 flex-col items-start gap-0.5 px-5 py-3 text-left transition-colors hover:bg-surface-soft";
  const cellLabel = "text-[0.58rem] uppercase tracking-[0.14em] text-ink/60";
  const cellValue = "w-full truncate text-sm text-ink";

  return (
    <div ref={rootRef} className="relative mx-auto w-full max-w-3xl">
      {/* Linguette */}
      <div className="mb-3 flex items-center justify-center gap-7">
        {modes.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => {
              const next = item.key;
              setMode(next);
              if (next !== "estimate") set("listingType", next);
              else setOpen(false);
            }}
            className={cn(
              "relative pb-1.5 text-[0.68rem] uppercase tracking-[0.16em] transition-colors duration-300",
              onPhoto
                ? mode === item.key
                  ? "text-white"
                  : "text-white/60 hover:text-white/90"
                : mode === item.key
                  ? "text-ink"
                  : "text-ink/60 hover:text-ink/80",
            )}
          >
            {item.label}
            <span
              className={cn(
                "absolute inset-x-0 bottom-0 h-px transition-transform duration-300",
                onPhoto ? "bg-champagne-soft" : "bg-champagne",
                mode === item.key ? "scale-x-100" : "scale-x-0",
              )}
            />
          </button>
        ))}
      </div>

      {/* Barra compatta */}
      <div className="panel flex items-stretch divide-x divide-[color:var(--color-line)]">
        {mode === "estimate" ? (
          <button type="button" onClick={submit} className={cn(cellClass, "flex-row items-center gap-3 py-4")}>
            <MapPin size={15} strokeWidth={1.4} className="shrink-0 text-champagne" />
            <span className="text-sm text-ink/70">{t.valuation.formTitle}</span>
          </button>
        ) : (
          <>
            <button type="button" onClick={() => setOpen(true)} className={cellClass}>
              <span className={cellLabel}>{t.search.locationLabel}</span>
              <span className={cn(cellValue, !filters.query && "text-ink/60")}>
                {filters.query || t.common.all}
              </span>
            </button>

            <button type="button" onClick={() => setOpen(true)} className={cn(cellClass, "hidden sm:flex")}>
              <span className={cellLabel}>{t.search.categoryLabel}</span>
              <span className={cn(cellValue, filters.category === "all" && "text-ink/60")}>
                {filters.category === "all" ? t.common.all : t.enums.category[filters.category]}
              </span>
            </button>

            <button type="button" onClick={() => setOpen(true)} className={cn(cellClass, "hidden md:flex")}>
              <span className={cellLabel}>{t.search.budgetLabel}</span>
              <span className={cn(cellValue, !budgetTouched && "text-ink/60")}>{budgetLabel}</span>
            </button>

            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-label={t.search.openFilters}
              className="flex items-center gap-2 px-4 text-[0.62rem] uppercase tracking-[0.14em] text-ink/60 transition-colors hover:bg-surface-soft hover:text-ink"
            >
              <SlidersHorizontal size={14} strokeWidth={1.4} />
              {activeCount > 0 && (
                <span className="flex h-4 min-w-4 items-center justify-center bg-champagne-deep px-1 text-[0.58rem] text-surface">
                  {activeCount}
                </span>
              )}
              <ChevronDown
                size={13}
                strokeWidth={1.5}
                className={cn("transition-transform duration-300", open && "rotate-180")}
              />
            </button>
          </>
        )}

        <button
          type="button"
          onClick={submit}
          className="flex items-center gap-2 bg-champagne-deep px-6 text-[0.66rem] uppercase tracking-[0.14em] text-surface transition-colors hover:bg-ink"
        >
          <Search size={14} strokeWidth={2} />
          <span className="hidden sm:inline">
            {mode === "estimate" ? t.enums.listingType.estimate : t.search.submit}
          </span>
        </button>
      </div>

      {/* ------------------------- MEGA MENU ------------------------- */}
      <div
        ref={panelRef}
        style={{ display: "none" }}
        className="panel absolute inset-x-0 bottom-full z-50 mb-3 hidden max-h-[66vh] flex-col text-left"
      >
        {/* Intestazione e piè di pagina restano fermi: scorre solo la zona dei
            campi, così il pulsante dei risultati è sempre raggiungibile. */}
        <div className="flex shrink-0 items-start justify-between gap-6 border-b border-line px-6 py-5 md:px-8">
          <div>
            <p className="eyebrow">{t.common.filters}</p>
            <h2 className="mt-2 font-display text-2xl text-ink">{t.search.title}</h2>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label={t.nav.close}
            className="-mr-1 p-1 text-ink/60 transition-colors hover:text-ink"
          >
            <X size={18} strokeWidth={1.4} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-6 md:px-8">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Località con autocomplete */}
            <div data-mega-block>
              <span className="mb-2 block text-[0.6875rem] uppercase tracking-[0.16em] text-ink/60">
                {t.search.locationLabel}
              </span>
              <div
                ref={locationFieldRef}
                className="flex items-center gap-3 border border-line bg-surface px-4 py-3 transition-colors focus-within:border-champagne"
              >
                <MapPin size={15} strokeWidth={1.4} className="shrink-0 text-champagne" />
                <input
                  ref={inputRef}
                  value={filters.query}
                  onChange={(event) => {
                    set("query", event.target.value);
                    setSuggestOpen(true);
                  }}
                  onFocus={() => {
                    measureSuggestions();
                    setSuggestOpen(true);
                  }}
                  onBlur={() => window.setTimeout(() => setSuggestOpen(false), 140)}
                  onKeyDown={(event) => event.key === "Enter" && submit()}
                  placeholder={t.search.locationPlaceholder}
                  className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-ink/60"
                />
              </div>

              {/* Fuori dal pannello, come le tendine dei Select: qui dentro
                  verrebbero tagliati dal bordo dell'area che scorre. */}
              {suggestOpen &&
                suggestions.length > 0 &&
                suggestPlacement &&
                createPortal(
                  <div
                    data-floating-panel
                    style={{
                      position: "fixed",
                      top: suggestPlacement.top,
                      bottom: suggestPlacement.bottom,
                      left: suggestPlacement.left,
                      minWidth: suggestPlacement.minWidth,
                      maxHeight: suggestPlacement.maxHeight,
                    }}
                    className="panel z-[200] overflow-y-auto overscroll-contain py-2"
                  >
                    <p className="px-4 pb-1.5 text-[0.6rem] uppercase tracking-[0.16em] text-ink/60">
                      {filters.query.trim() ? t.search.suggestions : t.search.popular}
                    </p>
                    {suggestions.map((suggestion) => (
                      <button
                        key={suggestion}
                        type="button"
                        onMouseDown={(event) => {
                          event.preventDefault();
                          set("query", suggestion);
                          setSuggestOpen(false);
                          inputRef.current?.blur();
                        }}
                        className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-ink/70 transition-colors hover:bg-surface-soft hover:text-ink"
                      >
                        <MapPin size={13} strokeWidth={1.3} className="text-ink/60" />
                        {suggestion}
                      </button>
                    ))}
                  </div>,
                  document.body,
                )}
            </div>

            <div data-mega-block>
              <Select
                label={t.filters.city}
                value={filters.city}
                options={cityOptions}
                searchable
                onChange={(value) => set("city", value)}
              />
            </div>

            <div data-mega-block>
              <Select
                label={t.search.categoryLabel}
                value={filters.category}
                options={categoryOptions}
                onChange={(value) => set("category", value as PropertyFilters["category"])}
              />
            </div>

            <div data-mega-block>
              <Select
                label={t.filters.bedrooms}
                value={String(filters.bedroomsMin)}
                options={bedroomOptions}
                onChange={(value) => set("bedroomsMin", Number(value))}
              />
            </div>

            <div data-mega-block>
              <Select
                label={t.filters.surface}
                value={String(filters.surfaceMin)}
                options={surfaceOptions}
                onChange={(value) => set("surfaceMin", Number(value))}
              />
            </div>

            <div data-mega-block className="md:pt-1">
              <RangeSlider
                min={DEFAULT_PRICE_RANGE[0]}
                max={DEFAULT_PRICE_RANGE[1]}
                step={50_000}
                value={[filters.priceMin, filters.priceMax]}
                onChange={([min, max]) => setFilters((f) => ({ ...f, priceMin: min, priceMax: max }))}
                format={(value) => formatPriceCompact(value, locale)}
                label={t.filters.price}
              />
            </div>
          </div>

          <div className="mt-7" data-mega-block>
            <p className="mb-3 text-[0.6875rem] uppercase tracking-[0.16em] text-ink/60">{t.filters.amenities}</p>
            <div className="flex flex-wrap gap-2">
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
                  className="px-3 py-1.5 text-[0.68rem]"
                >
                  {t.enums.amenity[amenity]}
                </Chip>
              ))}
            </div>
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap items-center justify-between gap-4 border-t border-line px-6 py-4 md:px-8">
          <button
            type="button"
            onClick={() => setFilters({ ...EMPTY_FILTERS, listingType: mode === "rent" ? "rent" : "sale" })}
            className="text-[0.68rem] uppercase tracking-[0.14em] text-ink/60 transition-colors hover:text-ink"
          >
            {t.filters.clearAll}
          </button>
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              submit();
            }}
            className="flex items-center gap-3 bg-ink px-7 py-3.5 text-[0.68rem] uppercase tracking-[0.14em] text-surface transition-colors hover:bg-champagne-deep"
          >
            {fill(t.listing.showingResults, { count: matching.length })}
          </button>
        </div>
      </div>
    </div>
  );
}
