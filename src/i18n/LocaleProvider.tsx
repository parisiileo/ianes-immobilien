"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import { getDictionary, interpolate, type Dictionary } from "./index";
import { href as buildHref, type Locale } from "./config";

interface LocaleContextValue {
  locale: Locale;
  t: Dictionary;
  /** Costruisce un link mantenendo il prefisso di lingua corrente. */
  link: (path?: string) => string;
  /** interpolate() legato al dizionario corrente. */
  fill: (template: string, values: Record<string, string | number>) => string;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ locale, children }: { locale: Locale; children: ReactNode }) {
  const value = useMemo<LocaleContextValue>(
    () => ({
      locale,
      t: getDictionary(locale),
      link: (path = "") => buildHref(locale, path),
      fill: interpolate,
    }),
    [locale],
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale deve essere usato dentro <LocaleProvider>");
  return ctx;
}
