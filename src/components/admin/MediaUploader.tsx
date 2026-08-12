"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { ImagePlus, Link2, Trash2, MoveLeft, MoveRight } from "lucide-react";
import { useLocale } from "@/i18n/LocaleProvider";
import { LOCALES } from "@/i18n/config";
import { TextInput } from "./fields";
import { removeMedia, uploadMedia } from "@/lib/properties/admin";
import { cn } from "@/lib/cn";
import type { PropertyImage } from "@/types/property";

/**
 * Caricamento immagini con drag & drop verso il bucket Supabase.
 *
 * Prima dell'upload i file vengono ridimensionati a 2200px sul lato lungo e
 * ricompressi in JPEG: le foto da reflex arrivano spesso a 8-10 MB l'una e
 * rallenterebbero sia il caricamento sia la generazione della brochure.
 */
async function prepareFile(file: File, maxSize = 2200): Promise<File> {
  if (!file.type.startsWith("image/")) return file;

  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height));
  if (scale === 1 && file.size < 1_500_000) {
    bitmap.close();
    return file;
  }

  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const context = canvas.getContext("2d");
  if (!context) {
    bitmap.close();
    return file;
  }
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.86));
  if (!blob) return file;

  const name = file.name.replace(/\.[^.]+$/, "") || "foto";
  return new File([blob], `${name}.jpg`, { type: "image/jpeg" });
}

export function MediaUploader({
  images,
  onChange,
}: {
  images: PropertyImage[];
  onChange: (images: PropertyImage[]) => void;
}) {
  const { t, locale } = useLocale();
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [urlValue, setUrlValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  function emptyAlt(): Record<(typeof LOCALES)[number], string> {
    return { it: "", de: "", en: "" };
  }

  async function addFiles(files: FileList | File[]) {
    setBusy(true);
    setError(null);
    try {
      const accepted = Array.from(files).filter((file) => file.type.startsWith("image/"));
      const uploaded: PropertyImage[] = [];
      for (const file of accepted) {
        const src = await uploadMedia(await prepareFile(file));
        uploaded.push({ src, alt: emptyAlt() });
      }
      if (uploaded.length) onChange([...images, ...uploaded]);
    } catch (cause) {
      setError(`${t.admin.form.uploadError} ${cause instanceof Error ? cause.message : ""}`.trim());
    } finally {
      setBusy(false);
    }
  }

  function removeAt(index: number) {
    const [target] = images.slice(index, index + 1);
    onChange(images.filter((_, i) => i !== index));
    // Il file resta orfano nel bucket se non lo si cancella: si prova, ma un
    // errore qui non deve bloccare la modifica della scheda.
    if (target) void removeMedia(target.src).catch(() => undefined);
  }

  function update(index: number, patch: Partial<PropertyImage>) {
    onChange(images.map((image, i) => (i === index ? { ...image, ...patch } : image)));
  }

  function move(index: number, delta: number) {
    const target = index + delta;
    if (target < 0 || target >= images.length) return;
    const next = [...images];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }

  return (
    <div className="space-y-5">
      <div
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          void addFiles(event.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-3 border border-dashed px-6 py-12 text-center transition-colors",
          dragging ? "border-champagne bg-champagne/5" : "border-line hover:border-ink/35",
        )}
      >
        <ImagePlus size={24} strokeWidth={1.1} className="text-champagne" />
        <p className="max-w-md text-sm text-ink/70">{t.admin.form.imagesHint}</p>
        {busy && <p className="text-xs text-champagne">{t.common.loading}</p>}
        {error && <p className="text-xs text-red-700">{error}</p>}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(event) => event.target.files && void addFiles(event.target.files)}
        />
      </div>

      <div className="flex gap-2">
        <TextInput value={urlValue} onChange={setUrlValue} placeholder="/images/property-1.jpg" />
        <button
          type="button"
          onClick={() => {
            if (!urlValue.trim()) return;
            onChange([...images, { src: urlValue.trim(), alt: emptyAlt() }]);
            setUrlValue("");
          }}
          className="flex shrink-0 items-center gap-2 border border-line px-5 text-[0.65rem] uppercase tracking-[0.14em] text-ink/70 transition-colors hover:border-champagne hover:text-champagne"
        >
          <Link2 size={13} strokeWidth={1.4} />
          {t.admin.form.addImageUrl}
        </button>
      </div>

      {images.length > 0 && (
        <ul className="space-y-3">
          {images.map((image, index) => (
            <li key={`${image.src.slice(0, 32)}-${index}`} className="flex gap-4 border border-line p-3">
              <div className="relative h-24 w-32 shrink-0 overflow-hidden bg-surface-soft">
                <Image src={image.src} alt="" fill sizes="128px" className="object-cover" unoptimized />
              </div>

              <div className="min-w-0 flex-1 space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <p className="truncate text-[0.68rem] text-ink/60">{image.src.slice(0, 58)}</p>
                  <div className="flex shrink-0 gap-1">
                    <button
                      type="button"
                      onClick={() => move(index, -1)}
                      aria-label={t.common.previous}
                      className="p-1.5 text-ink/60 hover:text-champagne"
                    >
                      <MoveLeft size={13} strokeWidth={1.4} />
                    </button>
                    <button
                      type="button"
                      onClick={() => move(index, 1)}
                      aria-label={t.common.next}
                      className="p-1.5 text-ink/60 hover:text-champagne"
                    >
                      <MoveRight size={13} strokeWidth={1.4} />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeAt(index)}
                      aria-label={t.admin.form.remove}
                      className="p-1.5 text-ink/60 hover:text-red-600"
                    >
                      <Trash2 size={13} strokeWidth={1.4} />
                    </button>
                  </div>
                </div>

                <div className="grid gap-2 sm:grid-cols-3">
                  {LOCALES.map((code) => (
                    <input
                      key={code}
                      value={image.alt[code]}
                      onChange={(event) =>
                        update(index, { alt: { ...image.alt, [code]: event.target.value } })
                      }
                      placeholder={`${t.admin.form.imageAlt} ${code.toUpperCase()}`}
                      className="w-full border border-line-strong bg-surface px-3 py-2 text-xs text-ink outline-none placeholder:text-ink/60 focus:border-champagne/60"
                    />
                  ))}
                </div>
                {index === 0 && (
                  <p className="text-[0.65rem] text-champagne/70">
                    {locale === "de"
                      ? "Titelbild: erscheint in Karten, Vorschau und Exposé-Deckblatt."
                      : locale === "en"
                        ? "Cover image: used in cards, previews and the brochure cover."
                        : "Immagine di copertina: usata nelle card, nelle anteprime e in copertina brochure."}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
