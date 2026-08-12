import type { Property } from "@/types/property";

/* ==========================================================================
 * SCHEDE DIMOSTRATIVE — SOLO PER LO SVILUPPO
 *
 * Servono a vedere il sito popolato finché il progetto Supabase non è
 * collegato. Indirizzi, prezzi e metrature NON corrispondono a immobili
 * reali: il riferimento inizia con "DEMO-" per renderlo evidente.
 *
 * Vengono usate solo quando mancano le variabili Supabase E la build non è
 * di produzione (vedi src/lib/properties/queries.ts): un deploy senza
 * database mostra gli empty state, non questi dati.
 *
 * Gli stessi record esistono in supabase/seed.sql per popolare il database.
 * ========================================================================== */

const img = (src: string, alt: string) => ({ src, alt: { it: alt, de: alt, en: alt } });

const text = (title: string, subtitle: string) => ({
  title,
  subtitle,
  description:
    "Scheda dimostrativa usata per mostrare l'impaginazione della pagina immobile: fotografie, scheda tecnica, planimetrie e brochure PDF.\n\nI testi definitivi si inseriscono dall'area riservata, una lingua alla volta.",
  metaDescription: "Scheda dimostrativa.",
  highlights: ["Punto di forza uno", "Punto di forza due", "Punto di forza tre"],
});

const content = (it: [string, string], de: [string, string], en: [string, string]) => ({
  it: text(it[0], it[1]),
  de: text(de[0], de[1]),
  en: text(en[0], en[1]),
});

/** Valori comuni a tutte le schede dimostrative. */
const base: Pick<
  Property,
  | "published"
  | "priceOnRequest"
  | "createdAt"
  | "updatedAt"
  | "floorPlans"
  | "coOwnership"
  | "coOwnershipProceedings"
  | "feesPayableBy"
> = {
  published: true,
  priceOnRequest: false,
  createdAt: "2026-07-01T09:00:00.000Z",
  updatedAt: "2026-08-01T09:00:00.000Z",
  floorPlans: [],
  // Case indipendenti: nessun condominio. Le schede in condominio ridefiniscono.
  coOwnership: false,
  coOwnershipProceedings: false,
  feesPayableBy: "buyer",
};

export const DEMO_PROPERTIES: Property[] = [
  {
    ...base,
    id: "demo-1",
    slug: "demo-villa-panoramica-merano",
    reference: "DEMO-001",
    listingType: "sale",
    status: "available",
    category: "villa",
    featured: true,
    price: 4_250_000,
    surfaceSqm: 480,
    lotSqm: 2400,
    rooms: 9,
    bedrooms: 5,
    bathrooms: 5,
    floors: 3,
    energyClass: "A2",
    energyIndex: 28,
    emissionsClass: "A2",
    emissionsIndex: 6,
    heating: "heatPump",
    constructionYear: 2019,
    amenities: ["pool", "spa", "mountainView", "terrace", "garden", "garage"],
    location: {
      address: "Indirizzo dimostrativo 1",
      city: "Merano",
      province: "BZ",
      postalCode: "39012",
      zone: "Maia Alta",
      lat: 46.682,
      lng: 11.1712,
    },
    images: [
      img("/demo/villa-esterno.jpg", "Villa contemporanea fra i vigneti al tramonto"),
      img("/demo/soggiorno-vetrate.jpg", "Soggiorno a doppia altezza con vetrate panoramiche"),
      img("/demo/piscina-crepuscolo.jpg", "Piscina illuminata al crepuscolo"),
    ],
    floorPlans: [
      {
        level: 0,
        name: { it: "Piano terra", de: "Erdgeschoss", en: "Ground floor" },
        areaSqm: 210,
        rooms: ["entrance", "living", "kitchen", "dining", "bathroom", "terrace"],
      },
      {
        level: 1,
        name: { it: "Primo piano", de: "Obergeschoss", en: "First floor" },
        areaSqm: 180,
        rooms: ["master", "bedroom", "bedroom", "bathroom", "studio"],
      },
    ],
    content: content(
      ["Villa panoramica con piscina", "Scheda dimostrativa — Merano"],
      ["Panorama-Villa mit Pool", "Demo-Objekt — Meran"],
      ["Panoramic villa with pool", "Demo listing — Merano"],
    ),
  },

  {
    ...base,
    id: "demo-2",
    slug: "demo-attico-centro-trento",
    reference: "DEMO-002",
    listingType: "sale",
    status: "available",
    category: "penthouse",
    featured: true,
    price: 1_480_000,
    surfaceSqm: 212,
    rooms: 5,
    bedrooms: 3,
    bathrooms: 3,
    floor: "6",
    floors: 2,
    energyClass: "A3",
    energyIndex: 22,
    emissionsClass: "A1",
    emissionsIndex: 9,
    heating: "underfloor",
    constructionYear: 2021,
    coOwnership: true,
    amenities: ["terrace", "elevator", "garage", "smartHome", "mountainView"],
    location: {
      address: "Indirizzo dimostrativo 2",
      city: "Trento",
      province: "TN",
      postalCode: "38122",
      zone: "Centro storico",
      lat: 46.0703,
      lng: 11.1245,
    },
    images: [
      img("/demo/cucina-mansarda.jpg", "Attico open space con lucernari"),
      img("/demo/soggiorno-vetrate.jpg", "Zona giorno con vetrate a tutta altezza"),
    ],
    content: content(
      ["Attico su due livelli", "Scheda dimostrativa — Trento"],
      ["Penthouse auf zwei Ebenen", "Demo-Objekt — Trient"],
      ["Two-level penthouse", "Demo listing — Trento"],
    ),
  },

  {
    ...base,
    id: "demo-3",
    slug: "demo-chalet-dolomiti",
    reference: "DEMO-003",
    listingType: "sale",
    status: "reserved",
    category: "chalet",
    featured: true,
    price: 4_900_000,
    surfaceSqm: 392,
    lotSqm: 1650,
    rooms: 10,
    bedrooms: 6,
    bathrooms: 6,
    floors: 3,
    energyClass: "A1",
    energyIndex: 34,
    emissionsClass: "A",
    emissionsIndex: 11,
    heating: "geothermal",
    constructionYear: 2016,
    amenities: ["spa", "mountainView", "fireplace", "garage", "wineCellar"],
    location: {
      address: "Indirizzo dimostrativo 3",
      city: "Selva di Val Gardena",
      province: "BZ",
      postalCode: "39048",
      zone: "Dolomiti",
      lat: 46.5546,
      lng: 11.7601,
    },
    images: [
      img("/demo/piscina-crepuscolo.jpg", "Chalet contemporaneo in pietra e legno"),
      img("/demo/stube-legno.jpg", "Stube con travi a vista in legno antico"),
    ],
    content: content(
      ["Chalet con area wellness", "Scheda dimostrativa — Val Gardena"],
      ["Chalet mit Wellnessbereich", "Demo-Objekt — Gröden"],
      ["Chalet with wellness area", "Demo listing — Val Gardena"],
    ),
  },

  {
    ...base,
    id: "demo-5",
    slug: "demo-tenuta-vigneto",
    reference: "DEMO-005",
    listingType: "sale",
    status: "available",
    category: "estate",
    featured: true,
    price: 6_400_000,
    priceOnRequest: true,
    surfaceSqm: 720,
    lotSqm: 34_000,
    rooms: 14,
    bedrooms: 8,
    bathrooms: 7,
    floors: 3,
    energyClass: "B",
    energyIndex: 68,
    emissionsClass: "D",
    emissionsIndex: 29,
    heating: "autonomous",
    constructionYear: 1780,
    renovationYear: 2018,
    amenities: ["lakeView", "wineCellar", "pool", "garden", "fireplace"],
    location: {
      address: "Indirizzo dimostrativo 5",
      city: "Caldaro sulla Strada del Vino",
      province: "BZ",
      postalCode: "39052",
      lat: 46.4147,
      lng: 11.2447,
    },
    images: [
      img("/demo/stube-legno.jpg", "Salone con travi in legno antico"),
      img("/demo/villa-esterno.jpg", "La tenuta immersa nei vigneti"),
    ],
    content: content(
      ["Tenuta con vigneto", "Scheda dimostrativa — prezzo su richiesta"],
      ["Anwesen mit Weinberg", "Demo-Objekt — Preis auf Anfrage"],
      ["Estate with vineyard", "Demo listing — price on request"],
    ),
  },

  {
    ...base,
    id: "demo-4",
    slug: "demo-appartamento-affitto-bolzano",
    reference: "DEMO-004",
    listingType: "rent",
    status: "available",
    category: "apartment",
    featured: false,
    price: 3200,
    surfaceSqm: 128,
    rooms: 4,
    bedrooms: 2,
    bathrooms: 2,
    floor: "4",
    floors: 1,
    energyClass: "A1",
    energyIndex: 26,
    emissionsClass: "A1",
    emissionsIndex: 8,
    heating: "districtHeating",
    constructionYear: 2020,
    coOwnership: true,
    coOwnershipProceedings: true,
    amenities: ["elevator", "terrace", "garage", "mountainView"],
    location: {
      address: "Indirizzo dimostrativo 4",
      city: "Bolzano",
      province: "BZ",
      postalCode: "39100",
      zone: "Talvera",
      lat: 46.4983,
      lng: 11.3298,
    },
    images: [img("/demo/cucina-mansarda.jpg", "Cucina open space con vista sulle montagne")],
    content: content(
      ["Appartamento con loggia", "Scheda dimostrativa — locazione"],
      ["Wohnung mit Loggia", "Demo-Objekt — Miete"],
      ["Apartment with loggia", "Demo listing — rental"],
    ),
  },
];
