"use client";

import { useLocale } from "@/i18n/LocaleProvider";
import { formatNumber } from "@/lib/format";
import { ENERGY_CLASSES, type EnergyClass } from "@/types/property";
import { cn } from "@/lib/cn";

/**
 * Le due scale dell'attestato di prestazione energetica.
 *
 * Consumo e emissioni sono indicatori distinti e vanno letti insieme: un
 * immobile può consumare poco e continuare a emettere molto, per esempio se è
 * riscaldato a gasolio. Per questo la seconda barra non è una copia della
 * prima con altri colori, ma porta la sua unità di misura e il suo valore.
 *
 * I due gradienti sono quelli convenzionali degli attestati: verde→rosso per
 * il fabbisogno, azzurro→viola scuro per la CO₂. Il colore non è mai l'unica
 * informazione — la lettera è scritta dentro la casella attiva e ripetuta nel
 * testo alternativo, quindi la scala resta leggibile anche senza distinguerli.
 */

/** Verde (A4) → rosso (G): la rampa del fabbisogno energetico. */
const CONSUMPTION_RAMP = [
  "#0a7c3f",
  "#1a9247",
  "#4faa42",
  "#8cbf3f",
  "#c4d43a",
  "#f2e12c",
  "#f7c518",
  "#f39c12",
  "#e8701a",
  "#dd4b20",
  "#d32020",
];

/** Azzurro (A4) → viola scuro (G): la rampa delle emissioni. */
const EMISSIONS_RAMP = [
  "#c9e9f6",
  "#a9d8ee",
  "#88c4e2",
  "#67aed4",
  "#4f95c4",
  "#417cb0",
  "#3a6398",
  "#374d80",
  "#333a66",
  "#2c2b4d",
  "#231f37",
];

/** Bianco sotto, nero sopra: le caselle chiare vogliono testo scuro. */
const LIGHT_SWATCHES = new Set(["#c9e9f6", "#a9d8ee", "#88c4e2", "#c4d43a", "#f2e12c", "#f7c518"]);

function Scale({
  label,
  unit,
  ramp,
  value,
  index,
}: {
  label: string;
  unit: string;
  ramp: string[];
  value?: EnergyClass;
  index?: number;
}) {
  const { t, locale, fill } = useLocale();
  const activeIndex = value ? ENERGY_CLASSES.indexOf(value) : -1;

  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <p className="text-sm text-ink/80">{label}</p>
        <p className="text-xs text-ink/60">
          {index === undefined ? t.property.diagnosis.notProvided : `${formatNumber(index, locale)} ${unit}`}
        </p>
      </div>

      {/*
        Una casella per classe. Quella attiva si allarga per ospitare la
        lettera; le altre restano strisce di colore, come sull'attestato.
      */}
      <div
        className="mt-3 flex h-6 w-full max-w-md overflow-hidden"
        role="img"
        aria-label={
          value
            ? `${label}: ${fill(t.property.diagnosis.scaleLabel, { value })}`
            : `${label}: ${t.property.diagnosis.notProvided}`
        }
      >
        {ENERGY_CLASSES.map((energyClass, position) => {
          const active = position === activeIndex;
          const swatch = ramp[position];
          return (
            <span
              key={energyClass}
              aria-hidden
              style={{ backgroundColor: swatch }}
              className={cn(
                "flex items-center justify-center text-[0.62rem] font-semibold tracking-wide transition-[flex-grow] duration-500",
                // Colori pieni su tutta la rampa, come sull'attestato: a
                // spegnere le classi non attive la scala perdeva il suo
                // riferimento e restava una striscia slavata.
                active ? "grow-[2.6] shadow-[inset_0_0_0_1.5px_rgba(20,19,14,0.55)]" : "grow",
                LIGHT_SWATCHES.has(swatch) ? "text-ink/85" : "text-white",
              )}
            >
              {active ? energyClass : ""}
            </span>
          );
        })}
      </div>
    </div>
  );
}

export function EnergyDiagnosis({
  energyClass,
  energyIndex,
  emissionsClass,
  emissionsIndex,
}: {
  energyClass: EnergyClass;
  energyIndex?: number;
  emissionsClass?: EnergyClass;
  emissionsIndex?: number;
}) {
  const { t } = useLocale();

  return (
    <div className="grid gap-10 sm:grid-cols-2 sm:gap-14">
      <Scale
        label={t.property.diagnosis.consumption}
        unit={t.property.diagnosis.consumptionUnit}
        ramp={CONSUMPTION_RAMP}
        value={energyClass}
        index={energyIndex}
      />
      <Scale
        label={t.property.diagnosis.emissions}
        unit={t.property.diagnosis.emissionsUnit}
        ramp={EMISSIONS_RAMP}
        value={emissionsClass}
        index={emissionsIndex}
      />
    </div>
  );
}
