import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Emblema del marchio come data URI, per le immagini generate con next/og
 * (favicon, icona iOS, card social). Satori non legge dal filesystem: l'unico
 * modo per dargli un file di /public è incorporarlo nella sorgente.
 *
 * Si usa sempre la variante per fondo scuro perché tutte le immagini generate
 * hanno il fondo notte del marchio.
 *
 * Il file viene letto una volta sola: queste rotte sono generate in build.
 */
let cached: string | null = null;

export function brandMarkDataUri(): string {
  if (cached) return cached;
  const svg = readFileSync(join(process.cwd(), "public", "logo_ii_on_dark.svg"));
  cached = `data:image/svg+xml;base64,${svg.toString("base64")}`;
  return cached;
}
