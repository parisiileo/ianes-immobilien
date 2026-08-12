import type { Locale } from "@/i18n/config";

export type PropertyStatus = "available" | "reserved" | "sold";
export type PropertyCategory = "villa" | "penthouse" | "chalet" | "apartment" | "estate" | "hotel";
export type ListingType = "sale" | "rent";

export type EnergyClass = "A4" | "A3" | "A2" | "A1" | "A" | "B" | "C" | "D" | "E" | "F" | "G";

export const ENERGY_CLASSES: EnergyClass[] = ["A4", "A3", "A2", "A1", "A", "B", "C", "D", "E", "F", "G"];

/**
 * Emissioni di gas serra: stessa scala a lettere del fabbisogno energetico,
 * ma è un indicatore distinto — un immobile può consumare poco e continuare a
 * emettere molto, per esempio se è riscaldato a gasolio.
 */
export type EmissionClass = EnergyClass;
export const EMISSION_CLASSES = ENERGY_CLASSES;

/** Su chi grava la provvigione di mediazione. */
export type FeesPayableBy = "buyer" | "seller" | "shared";
export const FEES_PAYABLE_BY: FeesPayableBy[] = ["buyer", "seller", "shared"];

export const PROPERTY_CATEGORIES: PropertyCategory[] = [
  "villa",
  "penthouse",
  "chalet",
  "apartment",
  "estate",
  "hotel",
];

export const AMENITIES = [
  "pool",
  "spa",
  "mountainView",
  "lakeView",
  "terrace",
  "garden",
  "garage",
  "elevator",
  "wineCellar",
  "smartHome",
  "fireplace",
  "concierge",
] as const;
export type Amenity = (typeof AMENITIES)[number];

export type HeatingType = "autonomous" | "centralized" | "heatPump" | "underfloor" | "districtHeating" | "geothermal";

export const HEATING_TYPES: HeatingType[] = [
  "autonomous",
  "centralized",
  "heatPump",
  "underfloor",
  "districtHeating",
  "geothermal",
];

/** Testi tradotti per lingua: ogni immobile porta con sé le tre varianti. */
export interface PropertyContent {
  title: string;
  subtitle: string;
  description: string;
  /** meta description dedicata, gestibile dal pannello admin */
  metaDescription: string;
  /** punti salienti mostrati nella scheda immobile */
  highlights: string[];
}

export interface PropertyImage {
  src: string;
  /** ALT testuale per SEO/accessibilità, uno per lingua */
  alt: Record<Locale, string>;
  /** Etichetta mostrata in galleria (facoltativa) */
  caption?: Record<Locale, string>;
}

/** Ambienti tipo: le etichette vivono nei dizionari, i dati restano neutri. */
export const ROOM_KEYS = [
  "entrance",
  "living",
  "kitchen",
  "dining",
  "master",
  "bedroom",
  "bathroom",
  "studio",
  "spa",
  "cellar",
  "garage",
  "terrace",
  "loggia",
  "staff",
] as const;
export type RoomKey = (typeof ROOM_KEYS)[number];

export interface FloorPlan {
  level: number;
  name: Record<Locale, string>;
  /** immagine o PDF della pianta */
  src?: string;
  areaSqm: number;
  rooms: RoomKey[];
}

export interface Property {
  id: string;
  /** slug leggibile usato nell'URL: /it/proprieta/<slug> */
  slug: string;
  reference: string;
  listingType: ListingType;
  status: PropertyStatus;
  category: PropertyCategory;
  /** Solo gli immobili pubblicati sono visibili sul sito (filtro applicato anche da RLS). */
  published: boolean;
  featured: boolean;
  /** In euro. Per gli affitti è il canone mensile. */
  price: number;
  priceOnRequest: boolean;
  surfaceSqm: number;
  lotSqm?: number;
  rooms: number;
  bedrooms: number;
  bathrooms: number;
  floor?: string;
  floors?: number;
  energyClass: EnergyClass;
  /** kWh/m²·anno */
  energyIndex?: number;
  /** Classe delle emissioni di gas serra dell'APE. */
  emissionsClass?: EmissionClass;
  /** kg CO₂/m²·anno */
  emissionsIndex?: number;
  heating: HeatingType;
  constructionYear: number;
  renovationYear?: number;

  /* --- Informazioni legali obbligatorie nell'annuncio --- */
  /** L'immobile fa parte di un condominio. */
  coOwnership: boolean;
  /** Procedure in corso a carico del condominio (art. 63 disp. att. c.c.). */
  coOwnershipProceedings: boolean;
  /** Su chi grava la provvigione di mediazione. */
  feesPayableBy: FeesPayableBy;

  amenities: Amenity[];
  location: {
    address: string;
    city: string;
    province: string;
    postalCode: string;
    zone?: string;
    lat: number;
    lng: number;
  };
  images: PropertyImage[];
  floorPlans: FloorPlan[];
  content: Record<Locale, PropertyContent>;
  createdAt: string;
  updatedAt: string;
}

/** Parametri di filtro condivisi tra home, listing page e store. */
export interface PropertyFilters {
  listingType: ListingType | "all";
  query: string;
  city: string | "all";
  category: PropertyCategory | "all";
  priceMin: number;
  priceMax: number;
  surfaceMin: number;
  bedroomsMin: number;
  amenities: Amenity[];
  energyClasses: EnergyClass[];
  status: PropertyStatus | "all";
}

export type SortKey = "relevance" | "priceDesc" | "priceAsc" | "surfaceDesc" | "newest";

export const DEFAULT_PRICE_RANGE: [number, number] = [0, 8_000_000];

export const EMPTY_FILTERS: PropertyFilters = {
  listingType: "all",
  query: "",
  city: "all",
  category: "all",
  priceMin: DEFAULT_PRICE_RANGE[0],
  priceMax: DEFAULT_PRICE_RANGE[1],
  surfaceMin: 0,
  bedroomsMin: 0,
  amenities: [],
  energyClasses: [],
  status: "all",
};
