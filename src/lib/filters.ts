import type { Locale } from "@/i18n/config";
import type { Property, PropertyFilters, SortKey } from "@/types/property";
import { DEFAULT_PRICE_RANGE, EMPTY_FILTERS } from "@/types/property";

/** Filtro testuale su titolo, comune, zona, riferimento e categoria. */
function matchesQuery(property: Property, query: string, locale: Locale): boolean {
  if (!query.trim()) return true;
  const needle = query.trim().toLowerCase();
  const haystack = [
    property.content[locale].title,
    property.content[locale].subtitle,
    property.location.city,
    property.location.zone ?? "",
    property.location.address,
    property.reference,
    property.category,
  ]
    .join(" ")
    .toLowerCase();
  return needle.split(/\s+/).every((token) => haystack.includes(token));
}

export function applyFilters(properties: Property[], filters: PropertyFilters, locale: Locale): Property[] {
  return properties.filter((property) => {
    if (filters.listingType !== "all" && property.listingType !== filters.listingType) return false;
    if (filters.status !== "all" && property.status !== filters.status) return false;
    if (filters.city !== "all" && property.location.city !== filters.city) return false;
    if (filters.category !== "all" && property.category !== filters.category) return false;
    if (property.surfaceSqm < filters.surfaceMin) return false;
    if (property.bedrooms < filters.bedroomsMin) return false;

    // Il prezzo degli affitti è mensile: la fascia di prezzo si applica solo
    // alle vendite, altrimenti ogni locazione finirebbe sotto il minimo.
    if (property.listingType === "sale") {
      if (property.price < filters.priceMin) return false;
      if (filters.priceMax < DEFAULT_PRICE_RANGE[1] && property.price > filters.priceMax) return false;
    }

    if (filters.amenities.length && !filters.amenities.every((a) => property.amenities.includes(a))) return false;
    if (filters.energyClasses.length && !filters.energyClasses.includes(property.energyClass)) return false;

    return matchesQuery(property, filters.query, locale);
  });
}

export function sortProperties(properties: Property[], sort: SortKey): Property[] {
  const list = [...properties];
  switch (sort) {
    case "priceDesc":
      return list.sort((a, b) => b.price - a.price);
    case "priceAsc":
      return list.sort((a, b) => a.price - b.price);
    case "surfaceDesc":
      return list.sort((a, b) => b.surfaceSqm - a.surfaceSqm);
    case "newest":
      return list.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
    case "relevance":
    default:
      // In evidenza prima, poi disponibili, poi per prezzo decrescente.
      return list.sort((a, b) => {
        if (a.featured !== b.featured) return a.featured ? -1 : 1;
        if (a.status !== b.status) return a.status === "available" ? -1 : 1;
        return b.price - a.price;
      });
  }
}

/** Numero di filtri diversi dal default: alimenta il badge sul pulsante "Filtri". */
export function countActiveFilters(filters: PropertyFilters): number {
  let count = 0;
  if (filters.listingType !== EMPTY_FILTERS.listingType) count++;
  if (filters.city !== EMPTY_FILTERS.city) count++;
  if (filters.category !== EMPTY_FILTERS.category) count++;
  if (filters.status !== EMPTY_FILTERS.status) count++;
  if (filters.query.trim()) count++;
  if (filters.priceMin !== EMPTY_FILTERS.priceMin || filters.priceMax !== EMPTY_FILTERS.priceMax) count++;
  if (filters.surfaceMin !== EMPTY_FILTERS.surfaceMin) count++;
  if (filters.bedroomsMin !== EMPTY_FILTERS.bedroomsMin) count++;
  count += filters.amenities.length;
  count += filters.energyClasses.length;
  return count;
}

/** Serializza i filtri in querystring per link condivisibili e SSR. */
export function filtersToSearchParams(filters: PropertyFilters, sort: SortKey): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.listingType !== "all") params.set("tipo", filters.listingType);
  if (filters.query.trim()) params.set("q", filters.query.trim());
  if (filters.city !== "all") params.set("comune", filters.city);
  if (filters.category !== "all") params.set("categoria", filters.category);
  if (filters.priceMin > DEFAULT_PRICE_RANGE[0]) params.set("min", String(filters.priceMin));
  if (filters.priceMax < DEFAULT_PRICE_RANGE[1]) params.set("max", String(filters.priceMax));
  if (filters.surfaceMin > 0) params.set("mq", String(filters.surfaceMin));
  if (filters.bedroomsMin > 0) params.set("camere", String(filters.bedroomsMin));
  if (filters.amenities.length) params.set("comfort", filters.amenities.join(","));
  if (filters.energyClasses.length) params.set("energia", filters.energyClasses.join(","));
  if (sort !== "relevance") params.set("ordina", sort);
  return params;
}

export function filtersFromSearchParams(params: URLSearchParams): { filters: PropertyFilters; sort: SortKey } {
  const filters: PropertyFilters = { ...EMPTY_FILTERS };
  const tipo = params.get("tipo");
  if (tipo === "sale" || tipo === "rent") filters.listingType = tipo;
  filters.query = params.get("q") ?? "";
  filters.city = params.get("comune") ?? "all";
  filters.category = (params.get("categoria") as PropertyFilters["category"]) ?? "all";
  filters.priceMin = Number(params.get("min") ?? DEFAULT_PRICE_RANGE[0]);
  filters.priceMax = Number(params.get("max") ?? DEFAULT_PRICE_RANGE[1]);
  filters.surfaceMin = Number(params.get("mq") ?? 0);
  filters.bedroomsMin = Number(params.get("camere") ?? 0);
  const comfort = params.get("comfort");
  if (comfort) filters.amenities = comfort.split(",") as PropertyFilters["amenities"];
  const energia = params.get("energia");
  if (energia) filters.energyClasses = energia.split(",") as PropertyFilters["energyClasses"];
  const sort = (params.get("ordina") as SortKey) ?? "relevance";
  return { filters, sort };
}
