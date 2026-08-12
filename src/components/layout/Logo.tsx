import Image from "next/image";
import { cn } from "@/lib/cn";

/**
 * Marchio: emblema circolare inciso + wordmark spaziato.
 *
 * L'emblema è un SVG a due colori fissi — la ghirlanda oro e il monogramma
 * quasi nero — quindi sulle fotografie scure il monogramma sparirebbe. Per
 * questo esistono due file identici tranne che nel colore delle lettere:
 * niente filtri CSS, che sull'oro darebbero una tinta sbagliata.
 *
 * Sono serviti come file statici con `unoptimized`: l'ottimizzatore di Next
 * non tocca gli SVG e passarli comunque dal suo endpoint aggiungerebbe solo
 * un salto in più rispetto alla cache di /public.
 */
export function Logo({
  className,
  compact = false,
  tone = "default",
}: {
  className?: string;
  compact?: boolean;
  /** "onPhoto" = marchio appoggiato su una fotografia (testo chiaro). */
  tone?: "default" | "onPhoto";
}) {
  const onPhoto = tone === "onPhoto";

  return (
    <span className={cn("flex items-center gap-3", className)}>
      <Image
        src={onPhoto ? "/logo_ii_on_dark.svg" : "/logo_ii.svg"}
        alt=""
        width={44}
        height={44}
        unoptimized
        className="h-11 w-11 shrink-0"
      />
      {!compact && (
        <span className="flex flex-col leading-none">
          <span
            className={cn("font-display text-xl tracking-[0.16em]", onPhoto ? "text-white" : "text-ink")}
          >
            IANES
          </span>
          <span
            className={cn(
              "mt-1 text-[0.5rem] uppercase tracking-[0.42em]",
              onPhoto ? "text-white/65" : "text-ink/60",
            )}
          >
            Immobilien
          </span>
        </span>
      )}
    </span>
  );
}
