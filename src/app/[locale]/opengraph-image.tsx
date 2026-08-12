import { ImageResponse } from "next/og";
import { brandMarkDataUri } from "@/lib/brand-mark";
import { COMPANY } from "@/lib/company";
import { getDictionary } from "@/i18n";
import { LOCALES, isLocale } from "@/i18n/config";

export const alt = "Ianes Immobilien";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

/**
 * Card social generata dal marchio: nessuna fotografia d'archivio, così
 * l'anteprima condivisa non mostra immobili che non sono in portafoglio.
 */
export default async function OpenGraphImage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = getDictionary(isLocale(locale) ? locale : "it");

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "linear-gradient(135deg, #0b0b0c 0%, #17171a 60%, #0b0b0c 100%)",
          padding: 72,
          color: "#f9f8f6",
          fontFamily: "serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={brandMarkDataUri()} alt="" width={86} height={86} />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 34, letterSpacing: 8 }}>IANES</div>
            <div style={{ fontSize: 14, letterSpacing: 12, color: "rgba(249,248,246,0.5)" }}>IMMOBILIEN</div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ fontSize: 26, letterSpacing: 6, color: "#d4af37", textTransform: "uppercase" }}>
            {t.hero.eyebrow}
          </div>
          {/* Satori richiede un solo nodo di testo per elemento senza display esplicito. */}
          <div style={{ fontSize: 66, lineHeight: 1.05, maxWidth: 900 }}>
            {`${t.hero.titleLead} ${t.hero.titleAccent}`}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            borderTop: "1px solid rgba(249,248,246,0.14)",
            paddingTop: 26,
            fontSize: 22,
            color: "rgba(249,248,246,0.6)",
          }}
        >
          <div style={{ display: "flex" }}>
            {`${COMPANY.registeredOffice.city} · ${COMPANY.localOffice.city}`}
          </div>
          <div style={{ display: "flex" }}>{COMPANY.phone}</div>
        </div>
      </div>
    ),
    size,
  );
}
