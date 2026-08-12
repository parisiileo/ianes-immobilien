"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Check, Globe } from "lucide-react";
import { LOCALES, LOCALE_LABELS, isLocale, type Locale } from "@/i18n/config";
import { useLocale } from "@/i18n/LocaleProvider";
import { cn } from "@/lib/cn";

const STORAGE_KEY = "ianes.locale";

/**
 * Switcher di lingua: riscrive il primo segmento del path mantenendo
 * la rotta corrente, e memorizza la preferenza per le visite successive.
 */
export function LanguageSwitcher({ tone = "default" }: { tone?: "default" | "onPhoto" }) {
  const { locale, t } = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDown(event: MouseEvent) {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  function switchTo(next: Locale) {
    setOpen(false);
    if (next === locale) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
      document.cookie = `${STORAGE_KEY}=${next};path=/;max-age=31536000;samesite=lax`;
    } catch {
      /* storage non disponibile: la navigazione funziona comunque */
    }
    const segments = pathname.split("/");
    if (isLocale(segments[1])) segments[1] = next;
    else segments.splice(1, 0, next);
    router.push(segments.join("/") || `/${next}`);
  }

  const onPhoto = tone === "onPhoto";

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={t.nav.changeLanguage}
        aria-expanded={open}
        className={cn(
          "flex items-center gap-2 px-2.5 py-2 text-[0.6875rem] uppercase tracking-[0.16em] transition-colors duration-300",
          onPhoto ? "text-white/85 hover:text-white" : "text-ink/60 hover:text-ink",
        )}
      >
        <Globe size={14} strokeWidth={1.4} />
        {LOCALE_LABELS[locale].short}
      </button>

      {open && (
        <div className="panel absolute right-0 z-[100] mt-2 w-40 animate-[fade-up_0.22s_var(--ease-luxe)_both] overflow-hidden">
          {LOCALES.map((code) => (
            <button
              key={code}
              type="button"
              onClick={() => switchTo(code)}
              lang={code}
              className="flex w-full items-center justify-between px-4 py-2.5 text-sm text-ink/75 transition-colors hover:bg-surface-soft hover:text-ink"
            >
              {LOCALE_LABELS[code].long}
              {code === locale && <Check size={13} strokeWidth={1.6} className="text-champagne" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
