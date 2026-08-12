"use client";

import { GState, jsPDF } from "jspdf";
import { COMPANY } from "./company";
import { getDictionary } from "@/i18n";
import type { Locale } from "@/i18n/config";
import { formatArea, formatListingPrice, formatNumber } from "./format";
import type { Property } from "@/types/property";

/* ------------------------------------------------------------------ *
 * Generatore di brochure PDF (A4 orizzontale, pronto per la stampa).
 *
 * Struttura richiesta dal cliente:
 *   1. Copertina        — brand, titolo, foto principale, dati chiave
 *   2. Narrazione       — descrizione e punti di forza
 *   3. Scheda tecnica   — tabella specifiche + badge energetico + consulente
 *   4+ Galleria         — una o due foto a pagina, a tutta pagina
 *   n. Note legali      — disclaimer, P.IVA, REA, riservatezza
 *
 * Tutto avviene nel browser: nessun servizio esterno riceve i dati.
 * ------------------------------------------------------------------ */

const PAGE = { w: 297, h: 210 };
const MARGIN = 18;

const INK: [number, number, number] = [11, 11, 12];
const BONE: [number, number, number] = [249, 248, 246];
const GOLD: [number, number, number] = [212, 175, 55];
const MUTED: [number, number, number] = [138, 133, 125];

/** Carica un'immagine e la converte in JPEG base64 per jsPDF. */
async function loadImage(src: string, maxWidth = 1800): Promise<{ data: string; ratio: number } | null> {
  return new Promise((resolve) => {
    const image = new window.Image();
    image.crossOrigin = "anonymous";
    image.onload = () => {
      const scale = Math.min(1, maxWidth / image.naturalWidth);
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(image.naturalWidth * scale);
      canvas.height = Math.round(image.naturalHeight * scale);
      const context = canvas.getContext("2d");
      if (!context) return resolve(null);
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      resolve({ data: canvas.toDataURL("image/jpeg", 0.86), ratio: canvas.width / canvas.height });
    };
    image.onerror = () => resolve(null);
    image.src = src;
  });
}

/** Riempie un rettangolo mantenendo le proporzioni (equivalente di object-fit: cover). */
function drawCover(
  doc: jsPDF,
  image: { data: string; ratio: number },
  x: number,
  y: number,
  w: number,
  h: number,
) {
  const boxRatio = w / h;
  let drawW = w;
  let drawH = h;
  if (image.ratio > boxRatio) {
    drawH = h;
    drawW = h * image.ratio;
  } else {
    drawW = w;
    drawH = w / image.ratio;
  }
  const offsetX = x - (drawW - w) / 2;
  const offsetY = y - (drawH - h) / 2;

  // Clip manuale: jsPDF non ha overflow, quindi si disegna dentro un rettangolo salvato.
  doc.saveGraphicsState();
  doc.rect(x, y, w, h);
  doc.clip();
  doc.addImage(image.data, "JPEG", offsetX, offsetY, drawW, drawH, undefined, "FAST");
  doc.restoreGraphicsState();
}

function veil(doc: jsPDF, x: number, y: number, w: number, h: number, opacity: number) {
  doc.saveGraphicsState();
  doc.setGState(new GState({ opacity }));
  doc.setFillColor(...INK);
  doc.rect(x, y, w, h, "F");
  doc.restoreGraphicsState();
}

function goldRule(doc: jsPDF, x: number, y: number, w: number) {
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(0.4);
  doc.line(x, y, x + w, y);
}

function brandMark(doc: jsPDF, x: number, y: number, light = true) {
  doc.setTextColor(...(light ? BONE : INK));
  doc.setFont("times", "normal");
  doc.setFontSize(19);
  doc.text("IANES", x, y, { charSpace: 1.6 });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.setTextColor(...(light ? MUTED : MUTED));
  doc.text("IMMOBILIEN", x, y + 4.6, { charSpace: 2.6 });
}

function footer(doc: jsPDF, page: number, total: number, label: string, dark = false) {
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(...(dark ? MUTED : MUTED));
  doc.text(`${COMPANY.legalName} · ${COMPANY.phone} · ${COMPANY.pec}`, MARGIN, PAGE.h - 8);
  doc.text(`${label} ${page} / ${total}`, PAGE.w - MARGIN, PAGE.h - 8, { align: "right" });
}

/**
 * Costruisce il documento senza salvarlo: separato da `generateBrochure`
 * per poter ispezionare il PDF (pagine, peso) senza innescare un download.
 */
export async function buildBrochure(property: Property, locale: Locale): Promise<jsPDF> {
  const t = getDictionary(locale);
  const content = property.content[locale];

  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4", compress: true });

  const images = (await Promise.all(property.images.map((image) => loadImage(image.src)))).filter(
    (image): image is { data: string; ratio: number } => image !== null,
  );

  const galleryImages = images.slice(1);
  const galleryPages = Math.ceil(galleryImages.length / 2);
  const totalPages = 3 + galleryPages + 1;
  let pageNumber = 0;

  const priceLabel = property.priceOnRequest
    ? t.common.priceOnRequest
    : formatListingPrice(property.price, locale, property.listingType, t.common.perMonth);

  /* ---------------------------- 1. COPERTINA ---------------------------- */
  pageNumber++;
  doc.setFillColor(...INK);
  doc.rect(0, 0, PAGE.w, PAGE.h, "F");

  if (images[0]) {
    drawCover(doc, images[0], 0, 0, PAGE.w, PAGE.h);
    veil(doc, 0, 0, PAGE.w, PAGE.h, 0.52);
    veil(doc, 0, PAGE.h * 0.45, PAGE.w, PAGE.h * 0.55, 0.35);
  }

  brandMark(doc, MARGIN, MARGIN + 6);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(...GOLD);
  doc.text(t.brochure.coverKicker.toUpperCase(), PAGE.w - MARGIN, MARGIN + 4, {
    align: "right",
    charSpace: 2,
  });
  doc.setTextColor(...MUTED);
  doc.text(`${t.common.reference} ${property.reference}`, PAGE.w - MARGIN, MARGIN + 10, { align: "right" });

  doc.setFont("times", "normal");
  doc.setFontSize(34);
  doc.setTextColor(...BONE);
  const coverTitle = doc.splitTextToSize(content.title, PAGE.w * 0.62);
  doc.text(coverTitle, MARGIN, PAGE.h - 62 - (coverTitle.length - 1) * 12);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(...MUTED);
  doc.text(`${property.location.city} (${property.location.province}) · ${content.subtitle}`, MARGIN, PAGE.h - 50);

  goldRule(doc, MARGIN, PAGE.h - 42, PAGE.w - MARGIN * 2);

  const coverFacts: Array<[string, string]> = [
    [t.property.surface, formatArea(property.surfaceSqm, locale)],
    [t.property.bedrooms, String(property.bedrooms)],
    [t.property.energyClass, property.energyClass],
    [t.common.price, priceLabel],
  ];
  coverFacts.forEach(([label, value], index) => {
    const x = MARGIN + index * ((PAGE.w - MARGIN * 2) / coverFacts.length);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(...MUTED);
    doc.text(label.toUpperCase(), x, PAGE.h - 33, { charSpace: 1.4 });
    doc.setFont("times", "normal");
    doc.setFontSize(16);
    doc.setTextColor(...BONE);
    doc.text(value, x, PAGE.h - 24);
  });

  /* --------------------------- 2. NARRAZIONE ---------------------------- */
  doc.addPage();
  pageNumber++;
  doc.setFillColor(...BONE);
  doc.rect(0, 0, PAGE.w, PAGE.h, "F");
  brandMark(doc, MARGIN, MARGIN, false);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(...GOLD);
  doc.text(t.brochure.description.toUpperCase(), MARGIN, MARGIN + 20, { charSpace: 2 });

  doc.setFont("times", "normal");
  doc.setFontSize(22);
  doc.setTextColor(...INK);
  const narrativeTitle = doc.splitTextToSize(content.title, PAGE.w * 0.5);
  doc.text(narrativeTitle, MARGIN, MARGIN + 33);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(60, 58, 55);
  const paragraphs = content.description.split("\n\n");
  let cursorY = MARGIN + 33 + narrativeTitle.length * 9 + 6;
  for (const paragraph of paragraphs) {
    const lines = doc.splitTextToSize(paragraph, PAGE.w * 0.5);
    doc.text(lines, MARGIN, cursorY, { lineHeightFactor: 1.55 });
    cursorY += lines.length * 5 + 5;
  }

  // Colonna destra: punti di forza + consulente
  const rightX = PAGE.w * 0.58;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(...GOLD);
  doc.text(t.property.highlights.toUpperCase(), rightX, MARGIN + 20, { charSpace: 2 });

  let highlightY = MARGIN + 30;
  doc.setFontSize(9);
  for (const highlight of content.highlights) {
    doc.setFillColor(...GOLD);
    doc.rect(rightX, highlightY - 2.2, 1.6, 1.6, "F");
    doc.setTextColor(40, 38, 36);
    const lines = doc.splitTextToSize(highlight, PAGE.w * 0.34);
    doc.text(lines, rightX + 5, highlightY, { lineHeightFactor: 1.5 });
    highlightY += lines.length * 5 + 3.5;
  }

  doc.setDrawColor(214, 210, 203);
  doc.setLineWidth(0.2);
  doc.line(rightX, highlightY + 4, PAGE.w - MARGIN, highlightY + 4);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(...GOLD);
  doc.text(t.brochure.agent.toUpperCase(), rightX, highlightY + 14, { charSpace: 2 });
  doc.setFontSize(9);
  doc.setTextColor(40, 38, 36);
  doc.text(
    [
      COMPANY.brandName,
      `${COMPANY.localOffice.street}, ${COMPANY.localOffice.postalCode} ${COMPANY.localOffice.city}`,
      COMPANY.phone,
      COMPANY.pec,
    ],
    rightX,
    highlightY + 21,
    { lineHeightFactor: 1.6 },
  );

  footer(doc, pageNumber, totalPages, t.brochure.page);

  /* -------------------------- 3. SCHEDA TECNICA ------------------------- */
  doc.addPage();
  pageNumber++;
  doc.setFillColor(...BONE);
  doc.rect(0, 0, PAGE.w, PAGE.h, "F");
  brandMark(doc, MARGIN, MARGIN, false);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(...GOLD);
  doc.text(t.brochure.specs.toUpperCase(), MARGIN, MARGIN + 20, { charSpace: 2 });

  const rows: Array<[string, string]> = [
    [t.property.reference, property.reference],
    [t.property.category, t.enums.category[property.category]],
    [t.property.status, t.enums.status[property.status]],
    [t.filters.listingType, t.enums.listingTypeShort[property.listingType]],
    [t.property.surface, formatArea(property.surfaceSqm, locale)],
    ...(property.lotSqm ? ([[t.property.lot, formatArea(property.lotSqm, locale)]] as Array<[string, string]>) : []),
    [t.property.rooms, String(property.rooms)],
    [t.property.bedrooms, String(property.bedrooms)],
    [t.property.bathrooms, String(property.bathrooms)],
    ...(property.floor ? ([[t.property.floor, property.floor]] as Array<[string, string]>) : []),
    [t.property.heating, t.enums.heating[property.heating]],
    [t.property.year, String(property.constructionYear)],
    ...(property.renovationYear
      ? ([[t.property.renovation, String(property.renovationYear)]] as Array<[string, string]>)
      : []),
    [
      t.property.energyIndex,
      property.energyIndex ? `${formatNumber(property.energyIndex, locale)} kWh/m²a` : "—",
    ],
    [t.property.location, `${property.location.address}, ${property.location.city}`],
    [t.common.price, priceLabel],
  ];

  const colWidth = (PAGE.w - MARGIN * 2 - 12) / 2;
  rows.forEach(([label, value], index) => {
    const column = index < Math.ceil(rows.length / 2) ? 0 : 1;
    const rowIndex = column === 0 ? index : index - Math.ceil(rows.length / 2);
    const x = MARGIN + column * (colWidth + 12);
    const y = MARGIN + 32 + rowIndex * 9;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...MUTED);
    doc.text(label.toUpperCase(), x, y, { charSpace: 0.8 });
    doc.setFontSize(9.5);
    doc.setTextColor(30, 29, 28);
    doc.text(value, x + colWidth, y, { align: "right" });
    doc.setDrawColor(222, 218, 211);
    doc.setLineWidth(0.15);
    doc.line(x, y + 3, x + colWidth, y + 3);
  });

  // Badge classe energetica
  const badgeY = PAGE.h - 46;
  doc.setFillColor(...INK);
  doc.rect(MARGIN, badgeY, 62, 26, "F");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.setTextColor(...MUTED);
  doc.text(t.brochure.energy.toUpperCase(), MARGIN + 6, badgeY + 9, { charSpace: 1.6 });
  doc.setFont("times", "normal");
  doc.setFontSize(24);
  doc.setTextColor(...GOLD);
  doc.text(property.energyClass, MARGIN + 6, badgeY + 21);
  if (property.energyIndex) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...BONE);
    doc.text(`${formatNumber(property.energyIndex, locale)} kWh/m²a`, MARGIN + 56, badgeY + 21, {
      align: "right",
    });
  }

  // Planimetrie riassunte
  if (property.floorPlans.length) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(...GOLD);
    doc.text(t.brochure.plans.toUpperCase(), MARGIN + 74, badgeY + 4, { charSpace: 2 });
    doc.setFontSize(8.5);
    doc.setTextColor(60, 58, 55);
    property.floorPlans.forEach((floorPlan, index) => {
      doc.text(
        `${floorPlan.name[locale]} — ${formatArea(floorPlan.areaSqm, locale)} · ${floorPlan.rooms
          .map((room) => t.enums.rooms[room])
          .join(", ")}`,
        MARGIN + 74,
        badgeY + 12 + index * 6,
      );
    });
  }

  footer(doc, pageNumber, totalPages, t.brochure.page);

  /* ---------------------------- 4+. GALLERIA ---------------------------- */
  for (let index = 0; index < galleryImages.length; index += 2) {
    doc.addPage();
    pageNumber++;
    doc.setFillColor(...INK);
    doc.rect(0, 0, PAGE.w, PAGE.h, "F");

    const pair = galleryImages.slice(index, index + 2);
    if (pair.length === 1) {
      drawCover(doc, pair[0], 0, 0, PAGE.w, PAGE.h - 16);
    } else {
      drawCover(doc, pair[0], 0, 0, PAGE.w / 2 - 1, PAGE.h - 16);
      drawCover(doc, pair[1], PAGE.w / 2 + 1, 0, PAGE.w / 2 - 1, PAGE.h - 16);
    }

    doc.setFillColor(...INK);
    doc.rect(0, PAGE.h - 16, PAGE.w, 16, "F");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(...GOLD);
    doc.text(t.brochure.gallery.toUpperCase(), MARGIN, PAGE.h - 8, { charSpace: 2 });
    doc.setTextColor(...MUTED);
    doc.text(`${content.title} · ${t.brochure.page} ${pageNumber} / ${totalPages}`, PAGE.w - MARGIN, PAGE.h - 8, {
      align: "right",
    });
  }

  /* --------------------------- n. NOTE LEGALI --------------------------- */
  doc.addPage();
  pageNumber++;
  doc.setFillColor(...INK);
  doc.rect(0, 0, PAGE.w, PAGE.h, "F");
  brandMark(doc, MARGIN, MARGIN + 6);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(...GOLD);
  doc.text(t.brochure.disclaimerTitle.toUpperCase(), MARGIN, MARGIN + 26, { charSpace: 2 });

  doc.setFontSize(8);
  doc.setTextColor(...MUTED);
  let legalY = MARGIN + 36;
  for (const clause of t.brochure.disclaimer) {
    const lines = doc.splitTextToSize(clause, PAGE.w * 0.55);
    doc.text(lines, MARGIN, legalY, { lineHeightFactor: 1.6 });
    legalY += lines.length * 4.4 + 4;
  }

  const legalX = PAGE.w * 0.64;
  goldRule(doc, legalX, MARGIN + 24, PAGE.w - MARGIN - legalX);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(...GOLD);
  doc.text(t.footer.companyTitle.toUpperCase(), legalX, MARGIN + 32, { charSpace: 2 });

  doc.setFontSize(8.5);
  doc.setTextColor(...BONE);
  doc.text(
    [
      COMPANY.legalName,
      `${t.footer.vat} ${COMPANY.vat}`,
      `${t.footer.rea} ${COMPANY.rea}`,
      "",
      t.footer.registeredOffice,
      `${COMPANY.registeredOffice.street}`,
      `${COMPANY.registeredOffice.postalCode} ${COMPANY.registeredOffice.city} (${COMPANY.registeredOffice.province})`,
      "",
      t.footer.localOffice,
      `${COMPANY.localOffice.street}`,
      `${COMPANY.localOffice.postalCode} ${COMPANY.localOffice.city} (${COMPANY.localOffice.province})`,
      "",
      COMPANY.phone,
      COMPANY.pec,
    ],
    legalX,
    MARGIN + 42,
    { lineHeightFactor: 1.55 },
  );

  doc.setFontSize(7);
  doc.setTextColor(...MUTED);
  doc.text(t.brochure.confidential.toUpperCase(), MARGIN, PAGE.h - 8, { charSpace: 2 });
  doc.text(`${t.brochure.page} ${pageNumber} / ${totalPages}`, PAGE.w - MARGIN, PAGE.h - 8, { align: "right" });

  doc.setProperties({
    title: `${content.title} — ${COMPANY.brandName}`,
    subject: content.metaDescription,
    author: COMPANY.legalName,
    keywords: [property.location.city, t.enums.category[property.category], property.reference].join(", "),
    creator: COMPANY.brandName,
  });

  return doc;
}

/** Genera e scarica la brochure. */
export async function generateBrochure(property: Property, locale: Locale): Promise<void> {
  const doc = await buildBrochure(property, locale);
  doc.save(`${property.reference}-${property.slug}-${locale}.pdf`);
}
