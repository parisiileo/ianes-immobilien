"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/cn";

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: React.ReactNode;
  className?: string;
  /** "onPhoto" = controllo appoggiato su una fotografia (testo chiaro). */
  tone?: "default" | "onPhoto";
  id?: string;
  /** Spunta non applicabile allo stato corrente del modulo. */
  disabled?: boolean;
}

/** Checkbox custom: input nativo nascosto per accessibilità, resa grafica dedicata. */
export function Checkbox({
  checked,
  onChange,
  label,
  className,
  tone = "default",
  id,
  disabled = false,
}: CheckboxProps) {
  const onPhoto = tone === "onPhoto";
  return (
    <label
      className={cn(
        "group flex items-start gap-3 text-sm leading-relaxed",
        disabled ? "cursor-not-allowed opacity-45" : "cursor-pointer",
        onPhoto ? "text-white/80" : "text-ink/70",
        className,
      )}
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
        className="sr-only"
      />
      <span
        aria-hidden
        className={cn(
          "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center border transition-all duration-200",
          checked
            ? "border-champagne-deep bg-champagne-deep text-surface"
            : onPhoto
              ? "border-white/40 group-hover:border-white"
              : "border-line-strong group-hover:border-champagne",
        )}
      >
        {checked && <Check size={11} strokeWidth={2.5} />}
      </span>
      <span className={cn("transition-colors", onPhoto ? "group-hover:text-white" : "group-hover:text-ink")}>
        {label}
      </span>
    </label>
  );
}

interface ChipProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}

/** Pill selezionabile usata nei filtri (comfort, classi energetiche). */
export function Chip({ active, onClick, children, className }: ChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "border px-3.5 py-2 text-xs tracking-wide transition-all duration-300",
        active
          ? "border-champagne bg-champagne/10 text-champagne"
          : "border-line text-ink/60 hover:border-line-strong hover:text-ink",
        className,
      )}
    >
      {children}
    </button>
  );
}
