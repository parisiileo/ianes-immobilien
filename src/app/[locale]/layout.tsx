import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { Archivo, Newsreader } from "next/font/google";
import "../globals.css";

import { LOCALES, LOCALE_TAGS, isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n";
import { LocaleProvider } from "@/i18n/LocaleProvider";
import { buildMetadata } from "@/lib/seo";
import { SITE_URL } from "@/lib/company";
import { organizationSchema, webSiteSchema } from "@/lib/jsonld";
import { JsonLd } from "@/components/seo/JsonLd";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CookieBanner } from "@/components/layout/CookieBanner";
import { SmoothScroll } from "@/components/layout/SmoothScroll";
import { PropertiesProvider } from "@/components/PropertiesProvider";
import { fetchPublishedProperties } from "@/lib/properties/queries";

/** Gli immobili cambiano di rado: HTML statico rigenerato ogni 5 minuti. */
export const revalidate = 300;

/*
  Newsreader + Archivo al posto di Cormorant Garamond + Inter.
  La coppia precedente è quella di default di mezzo web di settore e si
  riconosce a colpo d'occhio; queste due hanno più carattere e restano
  neutre. Newsreader tiene i pesi leggeri (200-800) su cui è tarata la scala
  tipografica, quindi il cambio non tocca il resto del design system.
*/
const newsreader = Newsreader({
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "500"],
  style: ["normal", "italic"],
  variable: "--font-newsreader",
  display: "swap",
});

/* latin-ext copre le lettere accentate del tedesco nei testi DE. */
const archivo = Archivo({
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "500"],
  variable: "--font-archivo",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#fbfaf8",
  colorScheme: "light",
};

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = getDictionary(locale);

  return {
    metadataBase: new URL(SITE_URL),
    ...buildMetadata({
      locale,
      title: t.meta.home.title,
      description: t.meta.home.description,
    }),
    // Nessun template: ogni pagina dichiara il proprio titolo completo,
    // brand incluso, per controllarne la lunghezza in SERP.
    title: { absolute: t.meta.home.title },
    applicationName: t.meta.siteName,
    authors: [{ name: "IMMOBIL IANES S.R.L." }],
    creator: "IMMOBIL IANES S.R.L.",
    publisher: "IMMOBIL IANES S.R.L.",
    formatDetection: { telephone: true, address: true, email: true },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const typedLocale = locale as Locale;
  const properties = await fetchPublishedProperties();

  return (
    <html lang={LOCALE_TAGS[typedLocale]} className={`${newsreader.variable} ${archivo.variable}`}>
      <body className="bg-surface text-ink antialiased">
        <JsonLd data={[organizationSchema(typedLocale), webSiteSchema(typedLocale)]} />

        <LocaleProvider locale={typedLocale}>
          <PropertiesProvider properties={properties}>
            <SmoothScroll />
            <Header />
            <main id="main">{children}</main>
            <Footer />
            <CookieBanner />
          </PropertiesProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
