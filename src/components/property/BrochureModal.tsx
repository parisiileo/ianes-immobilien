"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { Check, FileText, X } from "lucide-react";
import { useLocale } from "@/i18n/LocaleProvider";
import { Checkbox } from "@/components/ui/Checkbox";
import { useFormShield } from "@/components/ui/FormShield";
import { submitLead } from "@/lib/leads";
import { gsap } from "@/lib/gsap";
import type { Property } from "@/types/property";

/**
 * Richiesta della brochure riservata.
 *
 * Registra la richiesta nella tabella `leads` e consegna subito il PDF
 * generato lato client, così l'utente non deve aspettare una mail.
 */
export function BrochureModal({
  property,
  open,
  onClose,
}: {
  property: Property;
  open: boolean;
  onClose: () => void;
}) {
  const { t, locale, link } = useLocale();
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const shield = useFormShield();
  const [busy, setBusy] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    document.documentElement.style.overflow = "hidden";
    gsap.fromTo(
      panelRef.current,
      { opacity: 0, y: 40 },
      { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" },
    );
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => {
      document.documentElement.style.overflow = "";
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose, open]);

  if (!open) return null;

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!form.name.trim()) return setError(t.common.required);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email)) return setError(t.common.invalidEmail);
    if (!consent) return setError(t.home.newsletter.consentError);
    /*
      Invio automatico: si chiude con l'esito positivo senza registrare il lead
      e senza generare il PDF — a un bot non serve, e ogni brochure costa
      ~350 kB di jsPDF più il rendering.
    */
    if (!shield.looksHuman()) return setDone(true);

    setError(null);
    setBusy(true);
    try {
      const result = await submitLead({
        kind: "brochure",
        email: form.email,
        name: form.name,
        phone: form.phone,
        message: form.message,
        propertyId: property.id,
        propertyReference: property.reference,
        locale,
        consent,
      });

      // jsPDF pesa ~350 kB: si carica al clic, non con la pagina.
      const { generateBrochure } = await import("@/lib/brochure");

      // Il PDF viene consegnato comunque: è generato in locale e la richiesta
      // non riuscita viene segnalata separatamente.
      await generateBrochure(property, locale);

      if (result.ok) setDone(true);
      else if (result.reason === "not-configured") setError(t.common.sendUnavailable);
      else if (result.reason === "rate-limited") setError(t.common.sendTooMany);
      else setError(t.common.sendError);
    } finally {
      setBusy(false);
    }
  }

  const field =
    "w-full border border-line-strong bg-surface px-4 py-3.5 text-sm text-ink outline-none transition-colors placeholder:text-ink/60 focus:border-champagne/70";

  return (
    <div className="fixed inset-0 z-[95] flex items-end justify-center bg-surface/80 p-4 backdrop-blur-md sm:items-center">
      <button type="button" aria-label={t.nav.close} onClick={onClose} className="absolute inset-0 cursor-default" />

      <div ref={panelRef} className="panel relative z-10 w-full max-w-lg p-8 sm:p-10">
        <button
          type="button"
          onClick={onClose}
          aria-label={t.nav.close}
          className="absolute right-5 top-5 p-1 text-ink/60 transition-colors hover:text-ink"
        >
          <X size={18} strokeWidth={1.3} />
        </button>

        {done ? (
          <div className="py-8 text-center">
            <Check size={28} strokeWidth={1.2} className="mx-auto text-champagne" />
            <p className="mt-6 font-display text-2xl text-ink">{t.property.brochureForm.success}</p>
            <p className="mt-3 text-sm text-ink/60">{t.admin.pdf.done}</p>
          </div>
        ) : (
          <form onSubmit={submit} noValidate className="space-y-4">
            <input {...shield.honeypotProps} />

            <div className="flex items-center gap-3">
              <FileText size={18} strokeWidth={1.3} className="text-champagne" />
              <h2 className="font-display text-2xl text-ink">{t.property.brochureForm.title}</h2>
            </div>
            <p className="text-sm leading-relaxed text-ink/60">{t.property.brochureForm.text}</p>

            <input
              value={form.name}
              onChange={(event) => setForm((f) => ({ ...f, name: event.target.value }))}
              placeholder={t.property.brochureForm.name}
              autoComplete="name"
              className={field}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <input
                type="email"
                value={form.email}
                onChange={(event) => setForm((f) => ({ ...f, email: event.target.value }))}
                placeholder={t.property.brochureForm.email}
                autoComplete="email"
                className={field}
              />
              <input
                type="tel"
                value={form.phone}
                onChange={(event) => setForm((f) => ({ ...f, phone: event.target.value }))}
                placeholder={t.property.brochureForm.phone}
                autoComplete="tel"
                className={field}
              />
            </div>
            <textarea
              value={form.message}
              onChange={(event) => setForm((f) => ({ ...f, message: event.target.value }))}
              placeholder={t.property.brochureForm.message}
              rows={3}
              className={`${field} resize-none`}
            />

            <Checkbox
              checked={consent}
              onChange={setConsent}
              label={
                <span>
                  {t.property.brochureForm.consent}{" "}
                  <Link href={link("privacy-policy")} className="text-champagne underline-offset-4 hover:underline">
                    {t.cookie.privacyLink}
                  </Link>
                </span>
              }
            />

            {error && <p className="text-xs text-red-700">{error}</p>}

            <button
              type="submit"
              disabled={busy}
              className="w-full bg-champagne-deep px-8 py-4 text-[0.7rem] uppercase tracking-[0.2em] text-surface transition-colors hover:bg-ink disabled:opacity-60"
            >
              {busy ? t.admin.pdf.generating : t.property.brochureForm.submit}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
