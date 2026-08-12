"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown, Search } from "lucide-react";
import { cn } from "@/lib/cn";
import { useLocale } from "@/i18n/LocaleProvider";
import { useAnchoredPanel } from "./useAnchoredPanel";

export interface SelectOption<T extends string = string> {
  value: T;
  label: string;
  hint?: string;
}

interface SelectProps<T extends string> {
  value: T;
  options: SelectOption<T>[];
  onChange: (value: T) => void;
  label?: string;
  placeholder?: string;
  /** Attiva il campo di ricerca interno (per elenchi lunghi, es. comuni). */
  searchable?: boolean;
  className?: string;
  buttonClassName?: string;
  align?: "left" | "right";
  /** "onPhoto" = controllo appoggiato su una fotografia (testo chiaro). */
  tone?: "default" | "onPhoto";
  disabled?: boolean;
  id?: string;
}

/**
 * Dropdown completamente custom: nessun <select> nativo nel progetto.
 * Gestisce tastiera (frecce, Home/End, Enter, Esc), click esterno,
 * ricerca interna e apertura verso l'alto quando manca spazio sotto.
 *
 * Il pannello è **opaco** e con z-index alto di proposito: una tendina
 * traslucida sopra testo o fotografie diventa illeggibile. Ed è appeso al
 * <body> con un portale — vedi `useAnchoredPanel` per il perché.
 */
export function Select<T extends string>({
  value,
  options,
  onChange,
  label,
  placeholder,
  searchable = false,
  className,
  buttonClassName,
  align = "left",
  tone = "default",
  disabled = false,
  id,
}: SelectProps<T>) {
  const { t } = useLocale();
  const generatedId = useId();
  const listboxId = `${id ?? generatedId}-listbox`;
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const optionRefs = useRef<Array<HTMLLIElement | null>>([]);

  const selected = options.find((option) => option.value === value);

  const visible = useMemo(() => {
    if (!searchable || !query.trim()) return options;
    const needle = query.trim().toLowerCase();
    return options.filter((option) => option.label.toLowerCase().includes(needle));
  }, [options, query, searchable]);

  const [placement, measure] = useAnchoredPanel({
    open,
    anchorRef: buttonRef,
    align,
    estimatedHeight: Math.min(288, options.length * 44 + (searchable ? 46 : 0) + 16),
  });

  useEffect(() => {
    if (!open) return;
    const index = visible.findIndex((option) => option.value === value);
    setActiveIndex(index >= 0 ? index : 0);
    if (searchable) requestAnimationFrame(() => searchRef.current?.focus());
  }, [open, searchable, value, visible]);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: MouseEvent) {
      const target = event.target as Node;
      if (rootRef.current?.contains(target) || panelRef.current?.contains(target)) return;
      setOpen(false);
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  function commit(next: T) {
    onChange(next);
    setOpen(false);
  }

  function onKeyDown(event: React.KeyboardEvent) {
    if (disabled) return;
    if (!open && (event.key === "Enter" || event.key === " " || event.key === "ArrowDown")) {
      event.preventDefault();
      setOpen(true);
      return;
    }
    if (!open) return;

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, visible.length - 1));
        break;
      case "ArrowUp":
        event.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
        break;
      case "Home":
        event.preventDefault();
        setActiveIndex(0);
        break;
      case "End":
        event.preventDefault();
        setActiveIndex(visible.length - 1);
        break;
      case "Enter":
        event.preventDefault();
        if (visible[activeIndex]) commit(visible[activeIndex].value);
        break;
      case "Tab":
        setOpen(false);
        break;
    }
  }

  useEffect(() => {
    if (!open) return;
    optionRefs.current[activeIndex]?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, open]);

  const onPhoto = tone === "onPhoto";

  /* La tendina vive fuori dal campo, ma resta figlia nell'albero React: gli
     eventi di tastiera continuano quindi a salire fino a `onKeyDown` qui. */
  const dropdown = open && placement && (
    <div
      ref={panelRef}
      data-floating-panel
      style={{
        position: "fixed",
        top: placement.top,
        bottom: placement.bottom,
        left: placement.left,
        right: placement.right,
        minWidth: placement.minWidth,
      }}
      className={cn(
        "panel z-[200] overflow-hidden",
        "animate-[fade-up_0.22s_var(--ease-luxe)_both]",
        placement.dropUp ? "origin-bottom" : "origin-top",
      )}
    >
      {searchable && (
        <div className="flex items-center gap-2 border-b border-line px-3 py-2.5">
          <Search size={14} strokeWidth={1.5} className="text-ink/60" />
          <input
            ref={searchRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t.common.searchInList}
            className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-ink/60"
          />
        </div>
      )}

      <ul
        id={listboxId}
        role="listbox"
        aria-activedescendant={visible[activeIndex] ? `${listboxId}-${activeIndex}` : undefined}
        style={{ maxHeight: placement.maxHeight - (searchable ? 46 : 0) }}
        className="overflow-y-auto overscroll-contain py-1"
      >
        {visible.length === 0 && <li className="px-4 py-3 text-sm text-ink/60">{t.common.nothingFound}</li>}
        {visible.map((option, index) => {
          const isSelected = option.value === value;
          const isActive = index === activeIndex;
          return (
            <li
              key={option.value}
              id={`${listboxId}-${index}`}
              ref={(node) => {
                optionRefs.current[index] = node;
              }}
              role="option"
              aria-selected={isSelected}
              onMouseEnter={() => setActiveIndex(index)}
              onClick={() => commit(option.value)}
              className={cn(
                "flex cursor-pointer items-center justify-between gap-3 px-4 py-2.5 text-sm transition-colors duration-150",
                isActive ? "bg-surface-soft text-ink" : "text-ink/75",
              )}
            >
              <span className="flex min-w-0 flex-col">
                <span className="truncate">{option.label}</span>
                {option.hint && <span className="truncate text-xs text-ink/60">{option.hint}</span>}
              </span>
              {isSelected && <Check size={14} strokeWidth={1.5} className="shrink-0 text-champagne" />}
            </li>
          );
        })}
      </ul>
    </div>
  );

  return (
    <div ref={rootRef} className={cn("relative", className)} onKeyDown={onKeyDown}>
      {label && (
        <span
          className={cn(
            "mb-2 block text-[0.6875rem] uppercase tracking-[0.16em]",
            onPhoto ? "text-white/70" : "text-ink/60",
          )}
        >
          {label}
        </span>
      )}

      <button
        ref={buttonRef}
        type="button"
        id={id}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listboxId : undefined}
        onClick={() => {
          if (!open) measure();
          setOpen((v) => !v);
        }}
        className={cn(
          "flex w-full items-center justify-between gap-3 border px-4 py-3 text-left text-sm transition-colors duration-300",
          onPhoto
            ? "border-white/25 bg-black/25 text-white backdrop-blur-md hover:border-white/50"
            : "border-line bg-surface text-ink hover:border-line-strong",
          disabled && "cursor-not-allowed opacity-40",
          open && (onPhoto ? "border-white/70" : "border-champagne"),
          buttonClassName,
        )}
      >
        <span className={cn("truncate", !selected && (onPhoto ? "text-white/60" : "text-ink/60"))}>
          {selected?.label ?? placeholder ?? t.common.selectPlaceholder}
        </span>
        <ChevronDown
          size={15}
          strokeWidth={1.5}
          className={cn(
            "shrink-0 transition-transform duration-300",
            open && "rotate-180",
            onPhoto ? "text-white/80" : "text-champagne",
          )}
        />
      </button>

      {dropdown && createPortal(dropdown, document.body)}
    </div>
  );
}
