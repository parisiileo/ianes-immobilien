"use client";

import Image from "next/image";
import { ImageOff } from "lucide-react";
import { useLocale } from "@/i18n/LocaleProvider";
import { cn } from "@/lib/cn";
import type { PropertyImage } from "@/types/property";

/**
 * Copertina di un immobile.
 *
 * Le schede arrivano dal database e possono essere pubblicate prima che il
 * servizio fotografico sia pronto: senza questo fallback la pagina andrebbe
 * in errore su `images[0]`.
 */
export function CoverImage({
  image,
  className,
  sizes,
  priority = false,
  imageClassName,
}: {
  image?: PropertyImage;
  className?: string;
  sizes?: string;
  priority?: boolean;
  imageClassName?: string;
}) {
  const { locale } = useLocale();

  if (!image) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-[linear-gradient(135deg,#f3f0ea_0%,#e6e0d4_55%,#efebe3_100%)]",
          className,
        )}
      >
        <ImageOff size={22} strokeWidth={1} className="text-ink/60" />
      </div>
    );
  }

  return (
    <Image
      src={image.src}
      alt={image.alt?.[locale] ?? ""}
      fill
      priority={priority}
      sizes={sizes}
      className={imageClassName}
    />
  );
}
