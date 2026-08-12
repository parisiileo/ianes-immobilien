import { COMPANY, SITE_URL } from "./company";
import { href, LOCALE_TAGS, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n";
import { absoluteUrl } from "./seo";
import type { Property } from "@/types/property";

type Json = Record<string, unknown>;

/* ------------------------------------------------------------------ *
 * Schema globale: RealEstateAgent (che è già un LocalBusiness)
 * ------------------------------------------------------------------ */
export function organizationSchema(locale: Locale): Json {
  const t = getDictionary(locale);

  return {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    "@id": `${SITE_URL}/#organization`,
    name: COMPANY.brandName,
    legalName: COMPANY.legalName,
    url: absoluteUrl(href(locale).slice(1)),
    logo: {
      "@type": "ImageObject",
      url: absoluteUrl(`${href(locale).slice(1)}/opengraph-image`),
    },
    image: absoluteUrl(`${href(locale).slice(1)}/opengraph-image`),
    description: t.meta.home.description,
    sameAs: COMPANY.social.map((profile) => profile.url),
    telephone: COMPANY.phone,
    email: COMPANY.pec,
    vatID: COMPANY.vat,
    taxID: COMPANY.taxCode,
    identifier: [
      { "@type": "PropertyValue", name: "P.IVA", value: COMPANY.vat },
      { "@type": "PropertyValue", name: "REA", value: COMPANY.rea },
    ],
    address: {
      "@type": "PostalAddress",
      streetAddress: COMPANY.registeredOffice.street,
      postalCode: COMPANY.registeredOffice.postalCode,
      addressLocality: COMPANY.registeredOffice.city,
      addressRegion: COMPANY.registeredOffice.province,
      addressCountry: COMPANY.registeredOffice.country,
    },
    location: {
      "@type": "Place",
      name: `${COMPANY.brandName}, ${COMPANY.localOffice.city}`,
      address: {
        "@type": "PostalAddress",
        streetAddress: COMPANY.localOffice.street,
        postalCode: COMPANY.localOffice.postalCode,
        addressLocality: COMPANY.localOffice.city,
        addressRegion: COMPANY.localOffice.province,
        addressCountry: COMPANY.localOffice.country,
      },
      geo: {
        "@type": "GeoCoordinates",
        latitude: COMPANY.localOffice.lat,
        longitude: COMPANY.localOffice.lng,
      },
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: COMPANY.registeredOffice.lat,
      longitude: COMPANY.registeredOffice.lng,
    },
    areaServed: [
      { "@type": "AdministrativeArea", name: "Alto Adige / Südtirol" },
      { "@type": "AdministrativeArea", name: "Trentino" },
      { "@type": "City", name: "Merano" },
      { "@type": "City", name: "Trento" },
      { "@type": "City", name: "Bolzano" },
    ],
    knowsLanguage: Object.values(LOCALE_TAGS),
    priceRange: "€€€€",
    currenciesAccepted: "EUR",
    openingHoursSpecification: COMPANY.openingHours.map((slot) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: slot.days,
      opens: slot.opens,
      closes: slot.closes,
    })),
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: COMPANY.rating.value,
      reviewCount: COMPANY.rating.count,
      bestRating: COMPANY.rating.best,
      worstRating: 1,
    },
  };
}

export function webSiteSchema(locale: Locale): Json {
  const t = getDictionary(locale);
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: t.meta.siteName,
    url: absoluteUrl(href(locale).slice(1)),
    inLanguage: LOCALE_TAGS[locale],
    publisher: { "@id": `${SITE_URL}/#organization` },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${absoluteUrl(href(locale, "proprieta").slice(1))}?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

/* ------------------------------------------------------------------ *
 * Schema per singolo immobile
 * ------------------------------------------------------------------ */
const SCHEMA_TYPE_BY_CATEGORY: Record<Property["category"], string> = {
  villa: "SingleFamilyResidence",
  chalet: "SingleFamilyResidence",
  estate: "SingleFamilyResidence",
  penthouse: "Apartment",
  apartment: "Apartment",
  hotel: "Accommodation",
};

export function propertySchema(property: Property, locale: Locale): Json {
  const t = getDictionary(locale);
  const content = property.content[locale];
  const url = absoluteUrl(href(locale, `proprieta/${property.slug}`).slice(1));
  const images = property.images.map((i) => absoluteUrl(i.src));
  const residenceType = SCHEMA_TYPE_BY_CATEGORY[property.category];

  const residence: Json = {
    "@type": residenceType,
    "@id": `${url}#residence`,
    name: content.title,
    description: content.description,
    url,
    image: images,
    numberOfRooms: property.rooms,
    numberOfBedrooms: property.bedrooms,
    numberOfBathroomsTotal: property.bathrooms,
    yearBuilt: property.constructionYear,
    floorSize: { "@type": "QuantitativeValue", value: property.surfaceSqm, unitCode: "MTK" },
    ...(property.lotSqm
      ? { lotSize: { "@type": "QuantitativeValue", value: property.lotSqm, unitCode: "MTK" } }
      : {}),
    address: {
      "@type": "PostalAddress",
      streetAddress: property.location.address,
      addressLocality: property.location.city,
      addressRegion: property.location.province,
      postalCode: property.location.postalCode,
      addressCountry: "IT",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: property.location.lat,
      longitude: property.location.lng,
    },
    amenityFeature: [
      ...property.amenities.map((a) => ({
        "@type": "LocationFeatureSpecification",
        name: t.enums.amenity[a],
        value: true,
      })),
      {
        "@type": "LocationFeatureSpecification",
        name: t.property.energyClass,
        value: property.energyClass,
      },
      {
        "@type": "LocationFeatureSpecification",
        name: t.property.heating,
        value: t.enums.heating[property.heating],
      },
    ],
  };

  return {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    "@id": `${url}#listing`,
    url,
    name: content.title,
    headline: content.title,
    description: content.metaDescription,
    inLanguage: LOCALE_TAGS[locale],
    datePosted: property.createdAt,
    dateModified: property.updatedAt,
    image: images,
    provider: { "@id": `${SITE_URL}/#organization` },
    about: residence,
    mainEntity: residence,
    offers: {
      "@type": "Offer",
      "@id": `${url}#offer`,
      url,
      price: property.price,
      priceCurrency: "EUR",
      availability:
        property.status === "available"
          ? "https://schema.org/InStock"
          : property.status === "reserved"
            ? "https://schema.org/LimitedAvailability"
            : "https://schema.org/SoldOut",
      businessFunction:
        property.listingType === "rent"
          ? "http://purl.org/goodrelations/v1#LeaseOut"
          : "http://purl.org/goodrelations/v1#Sell",
      seller: { "@id": `${SITE_URL}/#organization` },
      ...(property.listingType === "rent"
        ? {
            priceSpecification: {
              "@type": "UnitPriceSpecification",
              price: property.price,
              priceCurrency: "EUR",
              unitCode: "MON",
              billingIncrement: 1,
            },
          }
        : {}),
    },
  };
}

/* ------------------------------------------------------------------ *
 * Breadcrumb
 * ------------------------------------------------------------------ */
export interface Crumb {
  name: string;
  /** path relativo senza prefisso lingua */
  path: string;
}

export function breadcrumbSchema(crumbs: Crumb[], locale: Locale): Json {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: absoluteUrl(href(locale, crumb.path).slice(1)),
    })),
  };
}

/** Elenco ordinato usato nelle pagine di listing. */
export function itemListSchema(properties: Property[], locale: Locale): Json {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    numberOfItems: properties.length,
    itemListElement: properties.map((property, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: absoluteUrl(href(locale, `proprieta/${property.slug}`).slice(1)),
      name: property.content[locale].title,
    })),
  };
}
