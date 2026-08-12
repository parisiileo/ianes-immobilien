"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Cookie, X } from "lucide-react";
import { useLocale } from "@/i18n/LocaleProvider";
import { acceptAll, OPEN_PREFERENCES_EVENT, rejectAll, setConsent, useConsent } from "@/lib/consent";
import { Checkbox } from "@/components/ui/Checkbox";
import { gsap } from "@/lib/gsap";
import { cn } from "@/lib/cn";

/**
 * Banner cookie conforme alle linee guida del Garante privacy:
 * stesso peso grafico per "Accetta" e "Rifiuta", nessun cookie non
 * necessario impostato prima della scelta, preferenze granulari,
 * riapribile in qualsiasi momento dal footer.
 */
export function CookieBanner() {
  const { t, link } = useLocale();
  const consent = useConsent();
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [choices, setChoices] = useState({ preferences: true, analytics: false, marketing: false });
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  // Prima visita → banner. Riapertura manuale → pannello dettagliato.
  useEffect(() => {
    if (!mounted) return;
    if (consent === null) setVisible(true);
  }, [consent, mounted]);

  useEffect(() => {
    function onOpen() {
      setChoices({
        preferences: consent?.preferences ?? true,
        analytics: consent?.analytics ?? false,
        marketing: consent?.marketing ?? false,
      });
      setExpanded(true);
      setVisible(true);
    }
    window.addEventListener(OPEN_PREFERENCES_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_PREFERENCES_EVENT, onOpen);
  }, [consent]);

  useEffect(() => {
    const panel = panelRef.current;
    if (!panel || !visible) return;
    gsap.fromTo(
      panel,
      { y: 40, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.7, ease: "power3.out", delay: 0.35 },
    );
  }, [visible]);

  if (!mounted || !visible) return null;

  function close() {
    const panel = panelRef.current;
    if (!panel) return setVisible(false);
    gsap.to(panel, { y: 30, opacity: 0, duration: 0.35, ease: "power2.in", onComplete: () => setVisible(false) });
  }

  type OptionalCategory = keyof typeof choices;
  const categories: Array<{ key: OptionalCategory | null; title: string; text: string }> = [
    { key: null, ...t.cookie.categories.necessary },
    { key: "preferences", ...t.cookie.categories.preferences },
    { key: "analytics", ...t.cookie.categories.analytics },
    { key: "marketing", ...t.cookie.categories.marketing },
  ];

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-label={t.cookie.title}
      className="fixed inset-x-0 bottom-0 z-[80] px-4 pb-4 sm:px-6 sm:pb-6"
    >
      <div
        ref={panelRef}
        className={cn(
          "panel mx-auto max-w-4xl p-6 sm:p-8",
          expanded && "max-h-[80vh] overflow-y-auto",
        )}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <Cookie size={18} strokeWidth={1.3} className="mt-1 shrink-0 text-champagne" />
            <div>
              <h2 className="font-display text-2xl text-ink">{t.cookie.title}</h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink/60">{t.cookie.text}</p>
            </div>
          </div>
          {expanded && (
            <button type="button" onClick={close} aria-label={t.nav.close} className="p-1 text-ink/60 hover:text-ink">
              <X size={18} strokeWidth={1.3} />
            </button>
          )}
        </div>

        {expanded && (
          <div className="mt-6 space-y-4 border-t border-line pt-6">
            {categories.map((category) => (
              <div key={category.title} className="flex items-start justify-between gap-6">
                <div>
                  <p className="text-sm text-ink/90">{category.title}</p>
                  <p className="mt-1 max-w-xl text-xs leading-relaxed text-ink/60">{category.text}</p>
                </div>
                {category.key === null ? (
                  <span className="shrink-0 whitespace-nowrap text-[0.65rem] uppercase tracking-[0.2em] text-champagne">
                    {t.cookie.categories.necessary.always}
                  </span>
                ) : (
                  <Checkbox
                    checked={choices[category.key]}
                    onChange={(checked) =>
                      setChoices((current) => ({ ...current, [category.key as OptionalCategory]: checked }))
                    }
                    label=""
                    className="shrink-0"
                  />
                )}
              </div>
            ))}
          </div>
        )}

        <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-4 text-xs text-ink/60">
            <Link href={link("cookie-policy")} className="underline-offset-4 hover:text-ink hover:underline">
              {t.cookie.policyLink}
            </Link>
            <Link href={link("privacy-policy")} className="underline-offset-4 hover:text-ink hover:underline">
              {t.cookie.privacyLink}
            </Link>
          </div>

          <div className="flex flex-wrap gap-3">
            {!expanded && (
              <button
                type="button"
                onClick={() => setExpanded(true)}
                className="border border-line px-5 py-3 text-[0.7rem] uppercase tracking-[0.2em] text-ink/70 transition-colors hover:border-ink/40 hover:text-ink"
              >
                {t.cookie.customize}
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                rejectAll();
                close();
              }}
              className="border border-line px-5 py-3 text-[0.7rem] uppercase tracking-[0.2em] text-ink/70 transition-colors hover:border-ink/40 hover:text-ink"
            >
              {t.cookie.rejectAll}
            </button>
            {expanded ? (
              <button
                type="button"
                onClick={() => {
                  setConsent(choices);
                  close();
                }}
                className="bg-champagne-deep px-5 py-3 text-[0.7rem] uppercase tracking-[0.2em] text-surface transition-colors hover:bg-ink"
              >
                {t.cookie.save}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  acceptAll();
                  close();
                }}
                className="bg-champagne-deep px-5 py-3 text-[0.7rem] uppercase tracking-[0.2em] text-surface transition-colors hover:bg-ink"
              >
                {t.cookie.acceptAll}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
