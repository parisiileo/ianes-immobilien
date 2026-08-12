"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Map as MapIcon, SlidersHorizontal, X } from "lucide-react";
import { useLocale } from "@/i18n/LocaleProvider";
import { useProperties } from "@/components/PropertiesProvider";
import { PropertyCard } from "@/components/property/PropertyCard";
import { MapPanel } from "@/components/property/MapPanel";
import { FiltersPanel } from "@/components/search/FiltersPanel";
import { FiltersSidebar } from "@/components/search/FiltersSidebar";
import { Select, type SelectOption } from "@/components/ui/Select";
import {
  applyFilters,
  countActiveFilters,
  filtersFromSearchParams,
  filtersToSearchParams,
  sortProperties,
} from "@/lib/filters";
import { EMPTY_FILTERS, type PropertyFilters, type SortKey } from "@/types/property";
import { refreshScrollTriggers } from "@/components/ui/SplitText";
import { cn } from "@/lib/cn";

/**
 * Listing.
 *
 * Colonna sinistra fissa con mappa in formato ridotto e filtri sempre a
 * vista; a destra la griglia. Rispetto alla mappa a mezza pagina di prima
 * si guadagna spazio per le fotografie, che sono la cosa che si guarda
 * davvero, e i filtri restano raggiungibili senza aprire nulla.
 */
export function PropertiesView() {
  const { t, fill, locale, link } = useLocale();
  const properties = useProperties();

  const [filters, setFilters] = useState<PropertyFilters>({ ...EMPTY_FILTERS });
  const [sort, setSort] = useState<SortKey>("relevance");
  const [panelOpen, setPanelOpen] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [mobileMapOpen, setMobileMapOpen] = useState(false);

  /**
   * Stato iniziale dalla querystring (link condivisi, mega menu, hero).
   * Si legge da `window.location` invece che da `useSearchParams` di proposito:
   * quell'hook forzerebbe il fallback di Suspense nell'HTML prerenderizzato,
   * lasciando ai crawler una pagina vuota al posto della griglia.
   */
  useEffect(() => {
    function readUrl() {
      const parsed = filtersFromSearchParams(new URLSearchParams(window.location.search));
      setFilters(parsed.filters);
      setSort(parsed.sort);
    }
    readUrl();
    window.addEventListener("popstate", readUrl);
    return () => window.removeEventListener("popstate", readUrl);
  }, []);

  const cities = useMemo(
    () =>
      Array.from(new Set(properties.map((p) => p.location.city).filter(Boolean))).sort((a, b) =>
        a.localeCompare(b),
      ),
    [properties],
  );

  const results = useMemo(
    () => sortProperties(applyFilters(properties, filters, locale), sort),
    [filters, locale, properties, sort],
  );

  useEffect(() => {
    refreshScrollTriggers();
  }, [results.length]);

  /** Allinea l'URL ai filtri correnti senza aggiungere voci alla cronologia. */
  function syncUrl(nextFilters: PropertyFilters, nextSort: SortKey) {
    const params = filtersToSearchParams(nextFilters, nextSort);
    const query = params.toString();
    window.history.replaceState(null, "", query ? `?${query}` : window.location.pathname);
  }

  function updateFilters(next: PropertyFilters) {
    setFilters(next);
    syncUrl(next, sort);
  }

  function updateSort(next: SortKey) {
    setSort(next);
    syncUrl(filters, next);
  }

  const sortOptions: SelectOption<SortKey>[] = (
    ["relevance", "priceDesc", "priceAsc", "surfaceDesc", "newest"] as SortKey[]
  ).map((key) => ({ value: key, label: t.enums.sort[key] }));

  const activeCount = countActiveFilters(filters);

  const activeChips: Array<{ label: string; clear: () => void }> = [];
  if (filters.listingType !== "all")
    activeChips.push({
      label: t.enums.listingTypeShort[filters.listingType],
      clear: () => updateFilters({ ...filters, listingType: "all" }),
    });
  if (filters.category !== "all")
    activeChips.push({
      label: t.enums.category[filters.category],
      clear: () => updateFilters({ ...filters, category: "all" }),
    });
  if (filters.city !== "all")
    activeChips.push({ label: filters.city, clear: () => updateFilters({ ...filters, city: "all" }) });
  if (filters.query.trim())
    activeChips.push({ label: `“${filters.query}”`, clear: () => updateFilters({ ...filters, query: "" }) });
  for (const amenity of filters.amenities)
    activeChips.push({
      label: t.enums.amenity[amenity],
      clear: () => updateFilters({ ...filters, amenities: filters.amenities.filter((a) => a !== amenity) }),
    });
  for (const energyClass of filters.energyClasses)
    activeChips.push({
      label: energyClass,
      clear: () =>
        updateFilters({ ...filters, energyClasses: filters.energyClasses.filter((e) => e !== energyClass) }),
    });

  const emptyCatalogue = properties.length === 0;

  return (
    <>
      {/* -------------------------- INTESTAZIONE -------------------------- */}
      <section className="border-b border-line bg-surface-soft pt-32 md:pt-40">
        <div className="shell-wide flex flex-wrap items-end justify-between gap-8 pb-12">
          <div className="max-w-2xl">
            <h1 className="font-display text-[clamp(2.6rem,6vw,4.6rem)] leading-[1.02] text-ink">
              {t.listing.title}
            </h1>
            <p className="mt-5 max-w-xl text-sm leading-relaxed text-ink/60">{t.listing.subtitle}</p>
          </div>

          <p className="font-display text-[clamp(2.4rem,5vw,3.6rem)] leading-none text-champagne">
            {String(results.length).padStart(2, "0")}
            <span className="ml-3 align-middle text-[0.62rem] uppercase tracking-[0.16em] text-ink/60">
              {results.length === 1 ? t.common.result : t.common.results}
            </span>
          </p>
        </div>
      </section>

      {/* ----------------------------- CORPO ------------------------------ */}
      <div className="shell-wide py-10 lg:py-14">
        <div className="grid gap-10 lg:grid-cols-[18rem_1fr] xl:grid-cols-[20rem_1fr] xl:gap-16">
          {/* Colonna sinistra: mappa ridotta + filtri, agganciate sotto l'header */}
          <aside className="hidden lg:block">
            {/*
              `sticky` si aggancia solo se la colonna sta dentro lo schermo:
              più alta del viewport, scorrerebbe via come un blocco normale.
              Di qui il tetto d'altezza con scorrimento interno.
            */}
            <div className="sticky top-[104px] max-h-[calc(100vh-8rem)] space-y-6 overflow-y-auto overscroll-contain pr-1">
              <MapPanel
                properties={results}
                activeId={activeId}
                onActiveChange={setActiveId}
                compact
                className="h-56 border border-line xl:h-64"
              />
              <FiltersSidebar
                filters={filters}
                onChange={updateFilters}
                cities={cities}
                onOpenAdvanced={() => setPanelOpen(true)}
              />
            </div>
          </aside>

          {/* Colonna destra: barra strumenti + griglia */}
          <div>
            <div className="flex flex-wrap items-center gap-3 border-b border-line pb-4">
              <button
                type="button"
                onClick={() => setPanelOpen(true)}
                className="flex items-center gap-2 border border-line px-4 py-2.5 text-[0.65rem] uppercase tracking-[0.14em] text-ink/75 transition-all hover:border-champagne hover:text-champagne lg:hidden"
              >
                <SlidersHorizontal size={14} strokeWidth={1.4} />
                {t.common.filters}
                {activeCount > 0 && (
                  <span className="ml-1 flex h-4 min-w-4 items-center justify-center bg-champagne-deep px-1 text-[0.58rem] text-surface">
                    {activeCount}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setMobileMapOpen((v) => !v)}
                aria-pressed={mobileMapOpen}
                className={cn(
                  "flex items-center gap-2 border px-4 py-2.5 text-[0.65rem] uppercase tracking-[0.14em] transition-all lg:hidden",
                  mobileMapOpen
                    ? "border-champagne text-champagne"
                    : "border-line text-ink/75 hover:border-champagne hover:text-champagne",
                )}
              >
                <MapIcon size={14} strokeWidth={1.4} />
                {t.listing.mapView}
              </button>

              <p className="hidden text-xs text-ink/60 lg:block">
                {fill(t.listing.showingResults, { count: results.length })}
              </p>

              <div className="ml-auto flex items-center gap-3">
                <span className="hidden text-[0.62rem] uppercase tracking-[0.14em] text-ink/60 sm:inline">
                  {t.listing.sortBy}
                </span>
                <Select
                  value={sort}
                  options={sortOptions}
                  onChange={updateSort}
                  align="right"
                  className="min-w-44 sm:min-w-52"
                  buttonClassName="py-2.5"
                />
              </div>
            </div>

            {/* Mappa su mobile, a scomparsa */}
            {mobileMapOpen && (
              <MapPanel
                properties={results}
                activeId={activeId}
                onActiveChange={setActiveId}
                className="mt-6 h-72 border border-line lg:hidden"
              />
            )}

            {activeChips.length > 0 && (
              <div className="mt-5 flex flex-wrap items-center gap-2">
                {activeChips.map((chip, index) => (
                  <button
                    key={`${chip.label}-${index}`}
                    type="button"
                    onClick={chip.clear}
                    className="flex items-center gap-2 border border-champagne/40 px-3 py-1.5 text-xs text-champagne transition-colors hover:bg-champagne/10"
                  >
                    {chip.label}
                    <X size={11} strokeWidth={1.6} />
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => updateFilters({ ...EMPTY_FILTERS })}
                  className="ml-1 text-[0.65rem] uppercase tracking-[0.14em] text-ink/60 underline-offset-4 hover:text-ink hover:underline"
                >
                  {t.common.reset}
                </button>
              </div>
            )}

            {emptyCatalogue ? (
              /* Catalogo vuoto: è diverso da «nessun risultato per questi filtri». */
              <div className="mt-10 border border-line p-14 text-center">
                <p className="font-display text-2xl text-ink">{t.listing.emptyTitle}</p>
                <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-ink/60">
                  {t.listing.emptyText}
                </p>
                <Link
                  href={link("contatti")}
                  className="mt-8 inline-block border border-line px-6 py-3 text-[0.68rem] uppercase tracking-[0.14em] text-ink/70 transition-colors hover:border-champagne hover:text-champagne"
                >
                  {t.nav.contact}
                </Link>
              </div>
            ) : results.length === 0 ? (
              <div className="mt-10 border border-line p-14 text-center">
                <p className="font-display text-2xl text-ink">{t.common.noResults}</p>
                <p className="mt-3 text-sm text-ink/60">{t.common.noResultsHint}</p>
                <button
                  type="button"
                  onClick={() => updateFilters({ ...EMPTY_FILTERS })}
                  className="mt-8 border border-line px-6 py-3 text-[0.68rem] uppercase tracking-[0.14em] text-ink/70 transition-colors hover:border-champagne hover:text-champagne"
                >
                  {t.filters.clearAll}
                </button>
              </div>
            ) : (
              /*
                Due colonne a qualsiasi larghezza, anche su schermi molto
                grandi: la terza colonna faceva rimpicciolire le fotografie
                proprio dove c'era spazio per mostrarle grandi.
              */
              <div className="mt-8 grid gap-7 sm:grid-cols-2 xl:gap-9">
                {results.map((property, index) => (
                  <PropertyCard
                    key={property.id}
                    property={property}
                    priority={index < 2}
                    onHover={setActiveId}
                    active={activeId === property.id}
                    sizes="(max-width: 640px) 92vw, (max-width: 1024px) 46vw, 34vw"
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <FiltersPanel
        open={panelOpen}
        onClose={() => setPanelOpen(false)}
        filters={filters}
        onChange={updateFilters}
        onApply={() => syncUrl(filters, sort)}
        cities={cities}
        resultCount={results.length}
      />
    </>
  );
}
