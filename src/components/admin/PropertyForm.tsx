"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ExternalLink, FileDown, Plus, Trash2 } from "lucide-react";
import { useLocale } from "@/i18n/LocaleProvider";
import { LOCALES, LOCALE_LABELS, type Locale } from "@/i18n/config";
import { Select, type SelectOption } from "@/components/ui/Select";
import { Checkbox, Chip } from "@/components/ui/Checkbox";
import { Field, NumberInput, Section, TextArea, TextInput } from "./fields";
import { MediaUploader } from "./MediaUploader";
import { slugify } from "@/lib/format";
import { cn } from "@/lib/cn";
import {
  AMENITIES,
  EMISSION_CLASSES,
  ENERGY_CLASSES,
  FEES_PAYABLE_BY,
  HEATING_TYPES,
  PROPERTY_CATEGORIES,
  ROOM_KEYS,
  type EnergyClass,
  type FeesPayableBy,
  type FloorPlan,
  type Property,
  type PropertyCategory,
  type PropertyStatus,
  type RoomKey,
} from "@/types/property";

export function PropertyForm({
  initial,
  onSave,
  onCancel,
}: {
  initial: Property;
  onSave: (property: Property) => Promise<Property>;
  onCancel: () => void;
}) {
  const { t, link } = useLocale();
  const [draft, setDraft] = useState<Property>(structuredClone(initial));
  const [contentLocale, setContentLocale] = useState<Locale>("it");
  const [pdfLocale, setPdfLocale] = useState<Locale>("it");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = <K extends keyof Property>(key: K, value: Property[K]) =>
    setDraft((current) => ({ ...current, [key]: value }));

  const setContent = (field: keyof Property["content"][Locale], value: string | string[]) =>
    setDraft((current) => ({
      ...current,
      content: {
        ...current.content,
        [contentLocale]: { ...current.content[contentLocale], [field]: value },
      },
    }));

  const setLocation = <K extends keyof Property["location"]>(key: K, value: Property["location"][K]) =>
    setDraft((current) => ({ ...current, location: { ...current.location, [key]: value } }));

  const options = useMemo(
    () => ({
      listing: [
        { value: "sale", label: t.enums.listingTypeShort.sale },
        { value: "rent", label: t.enums.listingTypeShort.rent },
      ] as SelectOption[],
      status: (["available", "reserved", "sold"] as PropertyStatus[]).map((value) => ({
        value,
        label: t.enums.status[value],
      })),
      category: PROPERTY_CATEGORIES.map((value) => ({ value, label: t.enums.category[value] })),
      heating: HEATING_TYPES.map((value) => ({ value, label: t.enums.heating[value] })),
      energy: ENERGY_CLASSES.map((value) => ({ value, label: value })),
      // L'APE delle emissioni può mancare: la voce vuota lo consente.
      emissions: [
        { value: "", label: t.common.notSpecified },
        ...EMISSION_CLASSES.map((value) => ({ value, label: value })),
      ] as SelectOption[],
      fees: FEES_PAYABLE_BY.map((value) => ({ value, label: t.enums.feesPayableBy[value] })),
      locale: LOCALES.map((value) => ({ value, label: LOCALE_LABELS[value].long })),
    }),
    [t],
  );

  async function submit() {
    if (!draft.reference.trim() || !draft.slug.trim() || !draft.content.it.title.trim()) {
      setError(t.admin.form.validation);
      return;
    }
    setError(null);
    setBusy(true);
    try {
      await onSave({ ...draft, slug: slugify(draft.slug), updatedAt: new Date().toISOString() });
    } catch (cause) {
      // Vincoli del database (slug o riferimento duplicato, titolo mancante
      // su un immobile pubblicato) arrivano fin qui con il messaggio di Postgres.
      setError(`${t.admin.list.saveError} ${cause instanceof Error ? cause.message : ""}`.trim());
    } finally {
      setBusy(false);
    }
  }

  async function downloadPdf() {
    setBusy(true);
    try {
      // jsPDF entra in scena solo qui: non deve pesare sul caricamento del form.
      const { generateBrochure } = await import("@/lib/brochure");
      await generateBrochure(draft, pdfLocale);
    } finally {
      setBusy(false);
    }
  }

  function updatePlan(index: number, patch: Partial<FloorPlan>) {
    set(
      "floorPlans",
      draft.floorPlans.map((plan, i) => (i === index ? { ...plan, ...patch } : plan)),
    );
  }

  const content = draft.content[contentLocale];

  return (
    <div className="space-y-6">
      {/* Barra azioni */}
      <div className="sticky top-0 z-30 flex flex-wrap items-center justify-between gap-3 border border-line bg-surface/92 px-5 py-4 backdrop-blur-xl">
        <div>
          <p className="text-[0.62rem] uppercase tracking-[0.14em] text-ink/60">{draft.reference}</p>
          <p className="font-display text-xl text-ink">{draft.content.it.title || t.admin.list.newProperty}</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href={link(`proprieta/${draft.slug}`)}
            target="_blank"
            className="flex items-center gap-2 border border-line px-4 py-2.5 text-[0.62rem] uppercase tracking-[0.14em] text-ink/65 transition-colors hover:border-champagne hover:text-champagne"
          >
            <ExternalLink size={13} strokeWidth={1.4} />
            {t.admin.form.preview}
          </Link>
          <button
            type="button"
            onClick={onCancel}
            className="border border-line px-4 py-2.5 text-[0.62rem] uppercase tracking-[0.14em] text-ink/65 transition-colors hover:border-ink/40 hover:text-ink"
          >
            {t.admin.form.cancel}
          </button>
          <button
            type="button"
            onClick={() => void submit()}
            disabled={busy}
            className="bg-champagne-deep px-6 py-2.5 text-[0.62rem] uppercase tracking-[0.14em] text-surface transition-colors hover:bg-ink disabled:opacity-60"
          >
            {busy ? t.common.loading : t.admin.form.save}
          </button>
        </div>
      </div>

      {error && <p className="border border-red-500/40 bg-red-500/5 px-5 py-3 text-sm text-red-700">{error}</p>}

      <div className="grid gap-6 xl:grid-cols-2">
        {/* -------------------- GENERALE -------------------- */}
        <Section title={t.admin.form.sections.general}>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label={t.admin.form.reference}>
              <TextInput value={draft.reference} onChange={(value) => set("reference", value)} />
            </Field>
            <Field label={t.admin.form.slug} hint={`/${contentLocale}/proprieta/${slugify(draft.slug || "")}`}>
              <TextInput value={draft.slug} onChange={(value) => set("slug", value)} />
            </Field>
            <Select
              label={t.admin.form.listingType}
              value={draft.listingType}
              options={options.listing}
              onChange={(value) => set("listingType", value as Property["listingType"])}
            />
            <Select
              label={t.admin.form.status}
              value={draft.status}
              options={options.status}
              onChange={(value) => set("status", value as PropertyStatus)}
            />
            <Select
              label={t.admin.form.category}
              value={draft.category}
              options={options.category}
              onChange={(value) => set("category", value as PropertyCategory)}
            />
            <Field label={t.admin.form.price}>
              <NumberInput value={draft.price} step={1000} onChange={(value) => set("price", value)} />
            </Field>
          </div>

          <div className="flex flex-wrap gap-6 pt-1">
            <Checkbox
              checked={draft.published}
              onChange={(value) => set("published", value)}
              label={t.admin.form.published}
            />
            <Checkbox
              checked={draft.featured}
              onChange={(value) => set("featured", value)}
              label={t.admin.form.featured}
            />
            <Checkbox
              checked={draft.priceOnRequest}
              onChange={(value) => set("priceOnRequest", value)}
              label={t.admin.form.priceOnRequest}
            />
          </div>
        </Section>

        {/* -------------------- SPECIFICHE -------------------- */}
        <Section title={t.admin.form.sections.specs}>
          <div className="grid gap-5 sm:grid-cols-3">
            <Field label={t.admin.form.surface}>
              <NumberInput value={draft.surfaceSqm} onChange={(value) => set("surfaceSqm", value)} />
            </Field>
            <Field label={t.admin.form.lot}>
              <NumberInput value={draft.lotSqm ?? 0} onChange={(value) => set("lotSqm", value || undefined)} />
            </Field>
            <Field label={t.admin.form.rooms}>
              <NumberInput value={draft.rooms} onChange={(value) => set("rooms", value)} />
            </Field>
            <Field label={t.admin.form.bedrooms}>
              <NumberInput value={draft.bedrooms} onChange={(value) => set("bedrooms", value)} />
            </Field>
            <Field label={t.admin.form.bathrooms}>
              <NumberInput value={draft.bathrooms} onChange={(value) => set("bathrooms", value)} />
            </Field>
            <Field label={t.admin.form.floor}>
              <TextInput value={draft.floor ?? ""} onChange={(value) => set("floor", value || undefined)} />
            </Field>
            <Field label={t.admin.form.floors}>
              <NumberInput value={draft.floors ?? 0} onChange={(value) => set("floors", value || undefined)} />
            </Field>
            <Select
              label={t.admin.form.energyClass}
              value={draft.energyClass}
              options={options.energy}
              onChange={(value) => set("energyClass", value as EnergyClass)}
            />
            <Field label={t.admin.form.energyIndex}>
              <NumberInput
                value={draft.energyIndex ?? 0}
                onChange={(value) => set("energyIndex", value || undefined)}
              />
            </Field>
            <Select
              label={t.admin.form.emissionsClass}
              value={draft.emissionsClass ?? ""}
              options={options.emissions}
              onChange={(value) => set("emissionsClass", (value || undefined) as EnergyClass | undefined)}
            />
            <Field label={t.admin.form.emissionsIndex}>
              <NumberInput
                value={draft.emissionsIndex ?? 0}
                onChange={(value) => set("emissionsIndex", value || undefined)}
              />
            </Field>
            <Select
              label={t.admin.form.heating}
              value={draft.heating}
              options={options.heating}
              onChange={(value) => set("heating", value as Property["heating"])}
            />
            <Field label={t.admin.form.year}>
              <NumberInput value={draft.constructionYear} onChange={(value) => set("constructionYear", value)} />
            </Field>
            <Field label={t.admin.form.renovation}>
              <NumberInput
                value={draft.renovationYear ?? 0}
                onChange={(value) => set("renovationYear", value || undefined)}
              />
            </Field>
          </div>

          <div>
            <p className="mb-3 text-[0.62rem] uppercase tracking-[0.14em] text-ink/60">{t.admin.form.amenities}</p>
            <div className="flex flex-wrap gap-2">
              {AMENITIES.map((amenity) => (
                <Chip
                  key={amenity}
                  active={draft.amenities.includes(amenity)}
                  onClick={() =>
                    set(
                      "amenities",
                      draft.amenities.includes(amenity)
                        ? draft.amenities.filter((item) => item !== amenity)
                        : [...draft.amenities, amenity],
                    )
                  }
                >
                  {t.enums.amenity[amenity]}
                </Chip>
              ))}
            </div>
          </div>
        </Section>
      </div>

      {/* -------------------- INFORMAZIONI LEGALI -------------------- */}
      <Section title={t.admin.form.sections.legal} description={t.admin.form.legalHint}>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <Select
            label={t.admin.form.feesPayableBy}
            value={draft.feesPayableBy}
            options={options.fees}
            onChange={(value) => set("feesPayableBy", value as FeesPayableBy)}
          />
        </div>

        <div className="flex flex-wrap gap-6 pt-1">
          <Checkbox
            checked={draft.coOwnership}
            // Fuori dal condominio non può esserci una procedura condominiale:
            // il database lo vieta, quindi la spunta si azzera qui.
            onChange={(value) =>
              setDraft((current) => ({
                ...current,
                coOwnership: value,
                coOwnershipProceedings: value ? current.coOwnershipProceedings : false,
              }))
            }
            label={t.property.legal.coOwnership}
          />
          <Checkbox
            checked={draft.coOwnershipProceedings}
            onChange={(value) => set("coOwnershipProceedings", value)}
            disabled={!draft.coOwnership}
            label={t.property.legal.proceedings}
          />
        </div>
      </Section>

      {/* -------------------- CONTENUTI MULTILINGUA -------------------- */}
      <Section title={t.admin.form.sections.content} description={t.admin.form.metaHint}>
        <div className="flex gap-1 border border-line p-1">
          {LOCALES.map((code) => (
            <button
              key={code}
              type="button"
              onClick={() => setContentLocale(code)}
              className={cn(
                "flex-1 px-4 py-2.5 text-[0.62rem] uppercase tracking-[0.14em] transition-colors",
                contentLocale === code ? "bg-champagne-deep text-surface" : "text-ink/60 hover:text-ink",
              )}
            >
              {LOCALE_LABELS[code].long}
            </button>
          ))}
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          <Field label={t.admin.form.title}>
            <TextInput value={content.title} onChange={(value) => setContent("title", value)} />
          </Field>
          <Field label={t.admin.form.subtitle}>
            <TextInput value={content.subtitle} onChange={(value) => setContent("subtitle", value)} />
          </Field>
        </div>

        <Field label={t.admin.form.description}>
          <TextArea value={content.description} rows={9} onChange={(value) => setContent("description", value)} />
        </Field>

        <Field label={t.admin.form.metaDescription} hint={`${content.metaDescription.length} / 160`}>
          <TextArea
            value={content.metaDescription}
            rows={3}
            onChange={(value) => setContent("metaDescription", value)}
          />
        </Field>

        <Field label={t.admin.form.highlights}>
          <TextArea
            value={content.highlights.join("\n")}
            rows={5}
            onChange={(value) => setContent("highlights", value.split("\n").filter((line) => line.trim()))}
          />
        </Field>
      </Section>

      {/* -------------------- LOCALIZZAZIONE -------------------- */}
      <Section title={t.admin.form.sections.location}>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <Field label={t.admin.form.address} className="lg:col-span-2">
            <TextInput value={draft.location.address} onChange={(value) => setLocation("address", value)} />
          </Field>
          <Field label={t.admin.form.city}>
            <TextInput value={draft.location.city} onChange={(value) => setLocation("city", value)} />
          </Field>
          <Field label={t.admin.form.province}>
            <TextInput value={draft.location.province} onChange={(value) => setLocation("province", value)} />
          </Field>
          <Field label={t.admin.form.postalCode}>
            <TextInput value={draft.location.postalCode} onChange={(value) => setLocation("postalCode", value)} />
          </Field>
          <Field label={t.admin.form.zone}>
            <TextInput value={draft.location.zone ?? ""} onChange={(value) => setLocation("zone", value)} />
          </Field>
          <Field label={t.admin.form.lat}>
            <NumberInput
              value={draft.location.lat}
              step={0.0001}
              onChange={(value) => setLocation("lat", value)}
            />
          </Field>
          <Field label={t.admin.form.lng}>
            <NumberInput
              value={draft.location.lng}
              step={0.0001}
              onChange={(value) => setLocation("lng", value)}
            />
          </Field>
        </div>
      </Section>

      {/* -------------------- MEDIA -------------------- */}
      <Section title={t.admin.form.sections.media}>
        <MediaUploader images={draft.images} onChange={(images) => set("images", images)} />

        {/* Planimetrie */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-[0.62rem] uppercase tracking-[0.14em] text-ink/60">{t.admin.form.floorPlans}</p>
            <button
              type="button"
              onClick={() =>
                set("floorPlans", [
                  ...draft.floorPlans,
                  {
                    level: draft.floorPlans.length,
                    name: { it: "Nuovo livello", de: "Neue Ebene", en: "New level" },
                    areaSqm: 0,
                    rooms: [],
                  },
                ])
              }
              className="flex items-center gap-2 border border-line px-3 py-2 text-[0.6rem] uppercase tracking-[0.14em] text-ink/60 hover:border-champagne hover:text-champagne"
            >
              <Plus size={12} strokeWidth={1.5} />
              {t.admin.form.addBlock}
            </button>
          </div>

          {draft.floorPlans.map((plan, index) => (
            <div key={index} className="space-y-3 border border-line p-4">
              <div className="grid gap-3 sm:grid-cols-[80px_1fr_1fr_1fr_100px_auto]">
                <NumberInput value={plan.level} onChange={(value) => updatePlan(index, { level: value })} />
                {LOCALES.map((code) => (
                  <TextInput
                    key={code}
                    value={plan.name[code]}
                    onChange={(value) => updatePlan(index, { name: { ...plan.name, [code]: value } })}
                    placeholder={code.toUpperCase()}
                  />
                ))}
                <NumberInput value={plan.areaSqm} onChange={(value) => updatePlan(index, { areaSqm: value })} />
                <button
                  type="button"
                  onClick={() => set("floorPlans", draft.floorPlans.filter((_, i) => i !== index))}
                  aria-label={t.admin.form.remove}
                  className="px-3 text-ink/60 hover:text-red-600"
                >
                  <Trash2 size={14} strokeWidth={1.4} />
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {ROOM_KEYS.map((room) => (
                  <Chip
                    key={room}
                    active={plan.rooms.includes(room)}
                    onClick={() =>
                      updatePlan(index, {
                        rooms: plan.rooms.includes(room)
                          ? (plan.rooms.filter((item) => item !== room) as RoomKey[])
                          : ([...plan.rooms, room] as RoomKey[]),
                      })
                    }
                    className="px-2.5 py-1.5 text-[0.65rem]"
                  >
                    {t.enums.rooms[room]}
                  </Chip>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* -------------------- BROCHURE PDF -------------------- */}
      <Section title={t.admin.pdf.title} description={t.admin.pdf.text}>
        <div className="flex flex-wrap items-end gap-4">
          <Select
            label={t.admin.pdf.language}
            value={pdfLocale}
            options={options.locale}
            onChange={(value) => setPdfLocale(value as Locale)}
            className="min-w-52"
          />
          <button
            type="button"
            onClick={downloadPdf}
            disabled={busy}
            className="flex items-center gap-3 bg-champagne-deep px-7 py-3.5 text-[0.65rem] uppercase tracking-[0.14em] text-surface transition-colors hover:bg-ink disabled:opacity-60"
          >
            <FileDown size={14} strokeWidth={1.5} />
            {busy ? t.admin.pdf.generating : t.admin.pdf.generate}
          </button>
        </div>
      </Section>
    </div>
  );
}
