"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { Check } from "lucide-react";
import { useLocale } from "@/i18n/LocaleProvider";
import { Select, type SelectOption } from "@/components/ui/Select";
import { Checkbox } from "@/components/ui/Checkbox";
import { Reveal } from "@/components/ui/SplitText";
import { useFormShield } from "@/components/ui/FormShield";
import { useProperties } from "@/components/PropertiesProvider";
import { submitLead } from "@/lib/leads";
import { PROPERTY_CATEGORIES, type PropertyCategory } from "@/types/property";

/** Richiesta di valutazione: raccoglie i dati minimi per pianificare il sopralluogo. */
export function ValuationForm() {
  const { t, link, locale } = useLocale();
  const properties = useProperties();
  const [category, setCategory] = useState<PropertyCategory>("villa");
  const [city, setCity] = useState<string>("Merano");
  const [form, setForm] = useState({ name: "", email: "", phone: "", address: "", surface: "", message: "" });
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const shield = useFormShield();

  const cityOptions: SelectOption[] = Array.from(
    new Set([...properties.map((p) => p.location.city), "Bolzano", "Merano", "Trento", "Bressanone", "Rovereto"]),
  )
    .sort((a, b) => a.localeCompare(b))
    .map((value) => ({ value, label: value }));

  const categoryOptions: SelectOption<PropertyCategory>[] = PROPERTY_CATEGORIES.map((value) => ({
    value,
    label: t.enums.category[value],
  }));

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!form.name.trim() || !form.address.trim()) return setError(t.common.required);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email)) return setError(t.common.invalidEmail);
    if (!consent) return setError(t.home.newsletter.consentError);
    // Invio automatico: stesso esito di uno riuscito, così il bot non impara nulla.
    if (!shield.looksHuman()) return setDone(true);

    setError(null);
    setBusy(true);
    const result = await submitLead({
      kind: "valuation",
      email: form.email,
      name: form.name,
      phone: form.phone,
      message: form.message,
      locale,
      consent,
      payload: {
        category,
        city,
        address: form.address,
        surfaceSqm: form.surface ? Number(form.surface) : null,
      },
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
        <p className="mt-6 max-w-sm font-display text-2xl text-ink">{t.valuation.success}</p>
      </div>
    );
  }

  return (
    <Reveal>
      <form onSubmit={submit} noValidate className="panel space-y-4 p-8 md:p-10">
        <input {...shield.honeypotProps} />

        <h2 className="font-display text-2xl text-ink">{t.valuation.formTitle}</h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            label={t.valuation.propertyType}
            value={category}
            options={categoryOptions}
            onChange={setCategory}
          />
          <Select label={t.valuation.city} value={city} options={cityOptions} searchable onChange={setCity} />
        </div>

        <div className="grid gap-4 sm:grid-cols-[1.6fr_1fr]">
          <label className="block">
            <span className="sr-only">{t.valuation.address}</span>
            <input
              value={form.address}
              onChange={(event) => setForm((f) => ({ ...f, address: event.target.value }))}
              placeholder={t.valuation.address}
              autoComplete="street-address"
              className={field}
            />
          </label>
          <label className="block">
            <span className="sr-only">{t.valuation.surface}</span>
            <input
              inputMode="numeric"
              value={form.surface}
              onChange={(event) => setForm((f) => ({ ...f, surface: event.target.value.replace(/\D/g, "") }))}
              placeholder={t.valuation.surface}
              className={field}
            />
          </label>
        </div>

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

        <label className="block">
          <span className="sr-only">{t.contact.message}</span>
          <textarea
            value={form.message}
            onChange={(event) => setForm((f) => ({ ...f, message: event.target.value }))}
            placeholder={t.contact.message}
            rows={4}
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
          className="w-full bg-champagne-deep px-8 py-4 text-[0.7rem] uppercase tracking-[0.14em] text-surface transition-colors hover:bg-ink disabled:opacity-60"
        >
          {busy ? t.common.sending : t.valuation.submit}
        </button>
      </form>
    </Reveal>
  );
}
