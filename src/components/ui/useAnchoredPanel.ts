"use client";

import { useCallback, useEffect, useState, type RefObject } from "react";

/** Spazio da lasciare all'header fisso quando la tendina si apre verso l'alto. */
const HEADER_SAFE = 96;
/** Distacco dal campo. */
const GAP = 8;
/** Margine minimo dal bordo del viewport. */
const EDGE = 16;

export interface AnchoredPlacement {
  top?: number;
  bottom?: number;
  left?: number;
  right?: number;
  minWidth: number;
  maxHeight: number;
  dropUp: boolean;
}

/**
 * Calcola dove appoggiare una tendina agganciata a un campo, in coordinate di
 * viewport: serve ai pannelli montati sul <body> con un portale.
 *
 * Il portale è l'unico modo perché la tendina non venga tagliata o coperta:
 * i contenitori che ospitano questi campi — il mega menu della ricerca, il
 * pannello filtri — scorrono al proprio interno e i loro blocchi animati con
 * GSAP creano contesti di impilamento, contro cui nessun z-index interno può
 * vincere.
 *
 * Restituisce anche `measure`, da chiamare subito prima di aprire: l'effetto
 * scatterebbe solo dopo il primo disegno e la tendina comparirebbe per un
 * fotogramma nel posto sbagliato.
 */
export function useAnchoredPanel({
  open,
  anchorRef,
  align = "left",
  estimatedHeight,
}: {
  open: boolean;
  anchorRef: RefObject<HTMLElement | null>;
  align?: "left" | "right";
  /** Altezza attesa della tendina: decide se aprire verso l'alto. */
  estimatedHeight: number;
}): [AnchoredPlacement | null, () => void] {
  const [placement, setPlacement] = useState<AnchoredPlacement | null>(null);

  const measure = useCallback(() => {
    const rect = anchorRef.current?.getBoundingClientRect();
    if (!rect) return;

    const spaceBelow = window.innerHeight - rect.bottom - EDGE;
    const spaceAbove = rect.top - HEADER_SAFE;
    const dropUp = spaceBelow < estimatedHeight && spaceAbove > spaceBelow;

    setPlacement({
      dropUp,
      top: dropUp ? undefined : rect.bottom + GAP,
      bottom: dropUp ? window.innerHeight - rect.top + GAP : undefined,
      left: align === "left" ? rect.left : undefined,
      right: align === "right" ? window.innerWidth - rect.right : undefined,
      minWidth: rect.width,
      maxHeight: Math.max(160, Math.min(320, (dropUp ? spaceAbove : spaceBelow) - GAP)),
    });
  }, [align, anchorRef, estimatedHeight]);

  /**
   * In posizione fissa la tendina va riallineata quando la pagina o il
   * contenitore del campo scorrono. `capture` serve proprio a questo: gli
   * eventi di scroll non risalgono dai contenitori interni.
   */
  useEffect(() => {
    if (!open) {
      setPlacement(null);
      return;
    }
    measure();
    window.addEventListener("resize", measure);
    document.addEventListener("scroll", measure, true);
    return () => {
      window.removeEventListener("resize", measure);
      document.removeEventListener("scroll", measure, true);
    };
  }, [measure, open]);

  return [placement, measure];
}
