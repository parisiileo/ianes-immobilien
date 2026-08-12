import type { Locale } from "@/i18n/config";
import { LOCALES } from "@/i18n/config";
import type {
  Amenity,
  EnergyClass,
  FeesPayableBy,
  FloorPlan,
  ListingType,
  Property,
  PropertyCategory,
  PropertyContent,
  PropertyImage,
  PropertyStatus,
} from "@/types/property";

/** Riga della tabella `public.properties` così come arriva da Supabase. */
export interface PropertyRow {
  id: string;
  slug: string;
  reference: string;
  listing_type: ListingType;
  status: PropertyStatus;
  category: PropertyCategory;
  published: boolean;
  featured: boolean;
  price: number | string;
  price_on_request: boolean;
  surface_sqm: number;
  lot_sqm: number | null;
  rooms: number;
  bedrooms: number;
  bathrooms: number;
  floor: string | null;
  floors: number | null;
  energy_class: EnergyClass;
  energy_index: number | string | null;
  emissions_class: EnergyClass | null;
  emissions_index: number | string | null;
  heating: Property["heating"];
  construction_year: number | null;
  renovation_year: number | null;
  co_ownership: boolean | null;
  co_ownership_proceedings: boolean | null;
  fees_payable_by: FeesPayableBy | null;
  amenities: string[] | null;
  address: string | null;
  city: string | null;
  province: string | null;
  postal_code: string | null;
  zone: string | null;
  lat: number | null;
  lng: number | null;
  images: unknown;
  floor_plans: unknown;
  content: unknown;
  created_at: string;
  updated_at: string;
}

const EMPTY_CONTENT: PropertyContent = {
  title: "",
  subtitle: "",
  description: "",
  metaDescription: "",
  highlights: [],
};

function asArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

/**
 * Normalizza i testi: se una lingua non è stata compilata si ricade
 * sull'italiano, così la pagina tradotta non resta mai vuota.
 */
function normalizeContent(raw: unknown): Record<Locale, PropertyContent> {
  const source = (raw ?? {}) as Partial<Record<Locale, Partial<PropertyContent>>>;
  const fallback = { ...EMPTY_CONTENT, ...(source.it ?? {}) } as PropertyContent;

  const result = {} as Record<Locale, PropertyContent>;
  for (const locale of LOCALES) {
    const entry = source[locale] ?? {};
    result[locale] = {
      title: entry.title?.trim() || fallback.title,
      subtitle: entry.subtitle?.trim() || fallback.subtitle,
      description: entry.description?.trim() || fallback.description,
      metaDescription: entry.metaDescription?.trim() || fallback.metaDescription,
      highlights: entry.highlights?.length ? entry.highlights : fallback.highlights,
    };
  }
  return result;
}

export function rowToProperty(row: PropertyRow): Property {
  return {
    id: row.id,
    slug: row.slug,
    reference: row.reference,
    listingType: row.listing_type,
    status: row.status,
    category: row.category,
    published: row.published,
    featured: row.featured,
    price: Number(row.price ?? 0),
    priceOnRequest: row.price_on_request,
    surfaceSqm: row.surface_sqm ?? 0,
    lotSqm: row.lot_sqm ?? undefined,
    rooms: row.rooms ?? 0,
    bedrooms: row.bedrooms ?? 0,
    bathrooms: row.bathrooms ?? 0,
    floor: row.floor ?? undefined,
    floors: row.floors ?? undefined,
    energyClass: row.energy_class,
    energyIndex: row.energy_index === null ? undefined : Number(row.energy_index),
    emissionsClass: row.emissions_class ?? undefined,
    emissionsIndex: row.emissions_index === null ? undefined : Number(row.emissions_index),
    heating: row.heating,
    constructionYear: row.construction_year ?? 0,
    renovationYear: row.renovation_year ?? undefined,
    // Le righe salvate prima di questi campi non li hanno: il default è la
    // risposta prudente, cioè «non in condominio, nessuna procedura».
    coOwnership: row.co_ownership ?? false,
    coOwnershipProceedings: row.co_ownership_proceedings ?? false,
    feesPayableBy: row.fees_payable_by ?? "buyer",
    amenities: (row.amenities ?? []) as Amenity[],
    location: {
      address: row.address ?? "",
      city: row.city ?? "",
      province: row.province ?? "",
      postalCode: row.postal_code ?? "",
      zone: row.zone ?? undefined,
      lat: row.lat ?? 0,
      lng: row.lng ?? 0,
    },
    images: asArray<PropertyImage>(row.images),
    floorPlans: asArray<FloorPlan>(row.floor_plans),
    content: normalizeContent(row.content),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/** Payload per insert/update: l'id resta fuori, lo gestisce il database. */
export function propertyToRow(property: Property): Omit<PropertyRow, "id" | "created_at" | "updated_at"> {
  return {
    slug: property.slug,
    reference: property.reference,
    listing_type: property.listingType,
    status: property.status,
    category: property.category,
    published: property.published,
    featured: property.featured,
    price: property.price,
    price_on_request: property.priceOnRequest,
    surface_sqm: property.surfaceSqm,
    lot_sqm: property.lotSqm ?? null,
    rooms: property.rooms,
    bedrooms: property.bedrooms,
    bathrooms: property.bathrooms,
    floor: property.floor ?? null,
    floors: property.floors ?? null,
    energy_class: property.energyClass,
    energy_index: property.energyIndex ?? null,
    emissions_class: property.emissionsClass ?? null,
    emissions_index: property.emissionsIndex ?? null,
    heating: property.heating,
    construction_year: property.constructionYear || null,
    renovation_year: property.renovationYear ?? null,
    co_ownership: property.coOwnership,
    co_ownership_proceedings: property.coOwnershipProceedings,
    fees_payable_by: property.feesPayableBy,
    amenities: property.amenities,
    address: property.location.address,
    city: property.location.city,
    province: property.location.province,
    postal_code: property.location.postalCode,
    zone: property.location.zone ?? null,
    lat: property.location.lat,
    lng: property.location.lng,
    images: property.images,
    floor_plans: property.floorPlans,
    content: property.content,
  };
}
