"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { Property } from "@/types/property";

/**
 * Gli immobili pubblicati vengono letti una volta sola dal layout server e
 * distribuiti ai componenti client: header, hero, sezioni della home e
 * listing lavorano tutti sullo stesso array, senza fetch duplicati e senza
 * differenze tra HTML server e client.
 */
const PropertiesContext = createContext<Property[]>([]);

export function PropertiesProvider({ properties, children }: { properties: Property[]; children: ReactNode }) {
  return <PropertiesContext.Provider value={properties}>{children}</PropertiesContext.Provider>;
}

export function useProperties(): Property[] {
  return useContext(PropertiesContext);
}

export function useCities(): string[] {
  const properties = useProperties();
  return Array.from(new Set(properties.map((property) => property.location.city).filter(Boolean))).sort((a, b) =>
    a.localeCompare(b),
  );
}
