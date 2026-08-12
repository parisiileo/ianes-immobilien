"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { Check } from "lucide-react";
import { useLocale } from "@/i18n/LocaleProvider";
import { Select, type SelectOption } from "@/components/ui/Select";
import { Checkbox } from "@/components/ui/Checkbox";
import { Reveal } from "@/components/ui/SplitText";
import { useFormShield } from "@/components/ui/FormShield";
import { submitLead } from "@/lib/leads";

type Subject = "buy" | "sell" | "rent" | "valuation" | "other";

/** Modulo di contatto: la richiesta viene registrata nella tabella `leads`. */
export function ContactForm() {
  const { t, link, locale } = useLocale();
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [subject, setSubject] = useState<Subject>("buy");
  const [reference, setReference] = useState<string | null>(null);
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const shield = useFormShield();

  // Se si arriva da una scheda immobile (?rif=IIM-2401) il messaggio è precompilato.
  useEffect(() => {
    const rif = new URLSearchParams(window.location.search).get("rif");
    if (rif) {
      setReference(rif);
      setForm((f) => ({ ...f, message: `${t.common.reference} ${rif} — ` }));
    }
  }, [t.common.reference]);

  const subjectOptions: SelectOption<Subject>[] = (
    ["buy", "sell", "rent", "valuation", "other"] as Subject[]
  ).map((key) => ({ value: key, label: t.contact.subjects[key] }));

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!form.name.trim()) return setError(t.common.required);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email)) return setError(t.common.invalidEmail);
    if (!consent) return setError(t.home.newsletter.consentError);

    /*
      Invio automatico: si mostra lo stesso esito di un invio riuscito. Dire
      «sei un bot» insegnerebbe a chi scrive il bot esattamente cosa cambiare.
    */
    if (!shield.looksHuman()) return setDone(true);

    setError(null);
    setBusy(true);
    const result = await submitLead({
      kind: "contact",
      email: form.email,
      name: form.name,
      phone: form.phone,
      subject,
      message: form.message,
      propertyReference: reference ?? undefined,
      locale,
      consent,
    });
    setBusy(false);

    if (result.ok) setDone(true);
    else if (result.reason === "not-configured") setError(t.common.sendUnavailable);
    else if (result.reason === "rate-limited") setError(t.common.sendTooMany);
    else setError(t.common.sendError);
  }

  const field =
    "w-full border border-line-strong bg-surface px-4 py-3.5 text-sm text-ink outline-none transition-colors placeholder:text-ink/60 focus:border-champagne/70";

  if (done) {
    return (
      <div className="panel flex min-h-72 flex-col items-start justify-center p-10">
        <Check size={26} strokeWidth={1.2} className="text-champagne" />
        <p className="mt-6 max-w-sm font-display text-2xl text-ink">{t.contact.success}</p>
      </div>
    );
  }

  return (
    <Reveal>
      <form onSubmit={submit} noValidate className="space-y-4">
        <h2 className="font-display text-2xl text-ink">{t.contact.formTitle}</h2>

        <input {...shield.honeypotProps} />


        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="sr-only">{t.contact.name}</span>
            <input
              value={form.name}
              onChange={(event) => setForm((f) => ({ ...f, name: event.target.value }))}
              placeholder={t.contact.name}
              autoComplete="name"
              className={field}
            />
          </label>
          <label className="block">
            <span className="sr-only">{t.contact.phone}</span>
            <input
              type="tel"
              value={form.phone}
              onChange={(event) => setForm((f) => ({ ...f, phone: event.target.value }))}
              placeholder={t.contact.phone}
              autoComplete="tel"
              className={field}
            />
          </label>
        </div>

        <label className="block">
          <span className="sr-only">{t.contact.email}</span>
          <input
            type="email"
            value={form.email}
            onChange={(event) => setForm((f) => ({ ...f, email: event.target.value }))}
            placeholder={t.contact.email}
            autoComplete="email"
            className={field}
          />
        </label>

        <Select label={t.contact.subject} value={subject} options={subjectOptions} onChange={setSubject} />

        <label className="block">
          <span className="sr-only">{t.contact.message}</span>
          <textarea
            value={form.message}
            onChange={(event) => setForm((f) => ({ ...f, message: event.target.value }))}
            placeholder={t.contact.message}
            rows={5}
            className={`${field} resize-none`}
          />
        </label>

        <Checkbox
          checked={consent}
          onChange={setConsent}
          label={
            <span>
              {t.contact.consent}{" "}
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
          className="w-full bg-champagne-deep px-8 py-4 text-[0.7rem] uppercase tracking-[0.2em] text-surface transition-colors hover:bg-ink disabled:opacity-60 sm:w-auto"
        >
          {busy ? t.common.sending : t.contact.submit}
        </button>
      </form>
    </Reveal>
  );
}
