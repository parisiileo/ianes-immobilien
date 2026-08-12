"use client";

import { useState } from "react";
import { GalleryCarousel } from "./GalleryCarousel";
import { Lightbox } from "./Lightbox";
import type { PropertyImage } from "@/types/property";

/**
 * Galleria della scheda immobile: striscia scorrevole più visore a schermo
 * intero.
 *
 * Prima era una griglia a mosaico: mostrava tutto insieme ma cresceva in
 * altezza con il numero di scatti e costringeva ad aprire il visore per
 * vedere una fotografia a una dimensione decente. La striscia tiene la
 * sezione alta quanto una foto sola e si sfoglia con la rotellina, con il
 * trascinamento o con le frecce.
 */
export function Gallery({ images }: { images: PropertyImage[] }) {
  const [lightbox, setLightbox] = useState<number | null>(null);

  return (
    <>
      <GalleryCarousel images={images} onOpen={setLightbox} />
      <Lightbox
        images={images}
        index={lightbox}
        onIndexChange={setLightbox}
        onClose={() => setLightbox(null)}
      />
    </>
  );
}
