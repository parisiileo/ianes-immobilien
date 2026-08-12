"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { Check, Send } from "lucide-react";
import { useLocale } from "@/i18n/LocaleProvider";
import { Checkbox } from "@/components/ui/Checkbox";
import { Reveal } from "@/components/ui/SplitText";
import { useFormShield } from "@/components/ui/FormShield";
import { submitLead } from "@/lib/leads";
import { cn } from "@/lib/cn";

/** Iscrizione agli aggiornamenti: la richiesta finisce nella tabella `leads`. */
export function Newsletter() {
  const { t, link, locale } = useLocale();
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "" });
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const shield = useFormShield();

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!consent) {
      setError(t.home.newsletter.consentError);
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email)) {
      setError(t.common.invalidEmail);
      return;
    }
    // Invio automatico: stesso esito di uno riuscito, così il bot non impara nulla.
    if (!shield.looksHuman()) return setDone(true);

    setError(null);
    setBusy(true);
    const result = await submitLead({
      kind: "newsletter",
      email: form.email,
      name: [form.firstName, form.lastName].filter(Boolean).join(" "),
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

  return (
    <section className="relative border-t border-line bg-surface py-28 md:py-36" aria-labelledby="newsletter-title">
      <div className="shell">
        <div className="grid gap-14 lg:grid-cols-2 lg:gap-24">
          <Reveal>
            <h2
              id="newsletter-title"
              className="max-w-md font-display text-[clamp(2.2rem,4.4vw,3.6rem)] leading-[1.04] text-ink"
            >
              {t.home.newsletter.title}
            </h2>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-ink/60">{t.home.newsletter.text}</p>
          </Reveal>

          <Reveal delay={0.12}>
            {done ? (
              <div className="panel flex h-full min-h-56 flex-col items-start justify-center p-10">
                <Check size={26} strokeWidth={1.2} className="text-champagne" />
                <p className="mt-5 max-w-sm font-display text-2xl text-ink">{t.home.newsletter.success}</p>
              </div>
            ) : (
              <form onSubmit={submit} noValidate className="space-y-4">
                <input {...shield.honeypotProps} />

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="sr-only">{t.home.newsletter.firstName}</span>
                    <input
                      value={form.firstName}
                      onChange={(event) => setForm((f) => ({ ...f, firstName: event.target.value }))}
                      placeholder={t.home.newsletter.firstName}
                      autoComplete="given-name"
                      required
                      className={field}
                    />
                  </label>
                  <label className="block">
                    <span className="sr-only">{t.home.newsletter.lastName}</span>
                    <input
                      value={form.lastName}
                      onChange={(event) => setForm((f) => ({ ...f, lastName: event.target.value }))}
                      placeholder={t.home.newsletter.lastName}
                      autoComplete="family-name"
                      required
                      className={field}
                    />
                  </label>
                </div>

                <label className="block">
                  <span className="sr-only">{t.home.newsletter.email}</span>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(event) => setForm((f) => ({ ...f, email: event.target.value }))}
                    placeholder={t.home.newsletter.email}
                    autoComplete="email"
                    required
                    className={field}
                  />
                </label>

                <Checkbox
                  checked={consent}
                  onChange={setConsent}
                  label={
                    <span>
                      {t.home.newsletter.consent}{" "}
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
                  className={cn(
                    "group flex w-full items-center justify-center gap-3 bg-champagne-deep px-8 py-4",
                    "text-[0.7rem] uppercase tracking-[0.14em] text-surface transition-colors hover:bg-ink disabled:opacity-60 sm:w-auto",
                  )}
                >
                  {busy ? t.common.sending : t.home.newsletter.submit}
                  <Send size={14} strokeWidth={1.5} className="transition-transform group-hover:translate-x-0.5" />
                </button>
              </form>
            )}
          </Reveal>
        </div>
      </div>
    </section>
  );
}
