"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { Minus, Plus, Locate } from "lucide-react";
import { useLocale } from "@/i18n/LocaleProvider";
import { COMPANY } from "@/lib/company";
import { formatPriceCompact } from "@/lib/format";
import { cn } from "@/lib/cn";
import type { Property } from "@/types/property";

/**
 * Mappa vettoriale del Trentino-Alto Adige disegnata a mano.
 *
 * Scelta deliberata: niente tile server esterni. Evita richieste a terzi
 * (quindi niente cookie di profilazione da dichiarare nel banner), resta
 * coerente con la palette del sito e funziona anche offline. La proiezione
 * è equirettangolare corretta sul coseno della latitudine media: sull'area
 * di un paio di gradi la distorsione è invisibile.
 */

const BOUNDS = { minLat: 45.6, maxLat: 47.05, minLng: 10.3, maxLng: 12.5 };
const VIEW = { w: 1000, h: 900 };
const COS_LAT = Math.cos(((BOUNDS.minLat + BOUNDS.maxLat) / 2) * (Math.PI / 180));

function project(lat: number, lng: number) {
  const x = ((lng - BOUNDS.minLng) / (BOUNDS.maxLng - BOUNDS.minLng)) * VIEW.w;
  const spanLat = BOUNDS.maxLat - BOUNDS.minLat;
  const y = (1 - (lat - BOUNDS.minLat) / spanLat) * VIEW.h;
  // Correzione della proiezione: le longitudini si accorciano salendo di quota.
  return { x: VIEW.w / 2 + (x - VIEW.w / 2) * COS_LAT * 1.35, y };
}

/** Riferimenti geografici disegnati sotto ai marker. */
const LANDMARKS = [
  { name: "Bolzano", lat: 46.4983, lng: 11.3548 },
  { name: "Merano", lat: 46.6713, lng: 11.1594 },
  { name: "Trento", lat: 46.0679, lng: 11.1211 },
  { name: "Bressanone", lat: 46.7159, lng: 11.6565 },
  { name: "Riva del Garda", lat: 45.8853, lng: 10.8402 },
  { name: "Cortina", lat: 46.5405, lng: 12.1357 },
];

/** Corsi d'acqua e valli principali, tracciati per punti geografici. */
const VALLEYS: Array<{ id: string; points: Array<[number, number]> }> = [
  {
    id: "adige",
    points: [
      [46.79, 11.0],
      [46.67, 11.16],
      [46.5, 11.34],
      [46.33, 11.27],
      [46.07, 11.12],
      [45.88, 11.04],
      [45.68, 10.99],
    ],
  },
  {
    id: "isarco",
    points: [
      [46.99, 11.5],
      [46.72, 11.66],
      [46.6, 11.5],
      [46.5, 11.34],
    ],
  },
  {
    id: "garda",
    points: [
      [45.89, 10.84],
      [45.8, 10.83],
      [45.72, 10.79],
      [45.63, 10.72],
    ],
  },
  {
    id: "gardena",
    points: [
      [46.5, 11.34],
      [46.57, 11.6],
      [46.55, 11.76],
    ],
  },
];

interface MapPanelProps {
  properties: Property[];
  activeId: string | null;
  onActiveChange: (id: string | null) => void;
  className?: string;
  /** Formato ridotto (colonna filtri): niente scheda a piè di mappa né suggerimenti. */
  compact?: boolean;
}

export function MapPanel({
  properties,
  activeId,
  onActiveChange,
  className,
  compact = false,
}: MapPanelProps) {
  const { t, link, locale } = useLocale();
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const dragState = useRef<{ x: number; y: number; panX: number; panY: number } | null>(null);

  const markers = useMemo(
    () =>
      properties.map((property) => ({
        property,
        ...project(property.location.lat, property.location.lng),
      })),
    [properties],
  );

  const office = project(COMPANY.localOffice.lat, COMPANY.localOffice.lng);

  const toPath = (points: Array<[number, number]>) =>
    points
      .map(([lat, lng], index) => {
        const { x, y } = project(lat, lng);
        return `${index === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(" ");

  return (
    <div className={cn("relative overflow-hidden bg-surface-soft", className)}>
      <svg
        viewBox={`0 0 ${VIEW.w} ${VIEW.h}`}
        className="h-full w-full cursor-grab touch-none active:cursor-grabbing"
        role="img"
        aria-label={t.listing.mapTitle}
        onPointerDown={(event) => {
          dragState.current = { x: event.clientX, y: event.clientY, panX: pan.x, panY: pan.y };
          (event.target as Element).setPointerCapture?.(event.pointerId);
        }}
        onPointerMove={(event) => {
          if (!dragState.current) return;
          setPan({
            x: dragState.current.panX + (event.clientX - dragState.current.x) * (1.6 / zoom),
            y: dragState.current.panY + (event.clientY - dragState.current.y) * (1.6 / zoom),
          });
        }}
        onPointerUp={() => {
          dragState.current = null;
        }}
        onPointerLeave={() => {
          dragState.current = null;
        }}
      >
        <defs>
          <radialGradient id="map-glow" cx="50%" cy="40%" r="70%">
            <stop offset="0%" stopColor="#f7f4ee" />
            <stop offset="100%" stopColor="#e7e1d6" />
          </radialGradient>
          <pattern id="map-grid" width="50" height="50" patternUnits="userSpaceOnUse">
            <path d="M50 0H0V50" fill="none" stroke="rgba(20,19,14,0.07)" strokeWidth="1" />
          </pattern>
        </defs>

        <rect width={VIEW.w} height={VIEW.h} fill="url(#map-glow)" />
        <rect width={VIEW.w} height={VIEW.h} fill="url(#map-grid)" />

        <g transform={`translate(${VIEW.w / 2} ${VIEW.h / 2}) scale(${zoom}) translate(${-VIEW.w / 2 + pan.x} ${-VIEW.h / 2 + pan.y})`}>
          {/* Rilievi stilizzati */}
          <g opacity="0.5">
            {[
              { cx: 300, cy: 210, r: 190 },
              { cx: 640, cy: 170, r: 210 },
              { cx: 780, cy: 420, r: 170 },
              { cx: 250, cy: 520, r: 150 },
              { cx: 520, cy: 700, r: 180 },
            ].map((blob, index) => (
              <circle
                key={index}
                cx={blob.cx}
                cy={blob.cy}
                r={blob.r}
                fill="none"
                stroke="rgba(20,19,14,0.07)"
                strokeWidth="1"
              />
            ))}
          </g>

          {VALLEYS.map((valley) => (
            <path
              key={valley.id}
              d={toPath(valley.points)}
              fill="none"
              stroke="rgba(160,122,23,0.45)"
              strokeWidth="2"
              strokeLinecap="round"
            />
          ))}

          {LANDMARKS.map((landmark) => {
            const { x, y } = project(landmark.lat, landmark.lng);
            return (
              <g key={landmark.name}>
                <circle cx={x} cy={y} r="2.5" fill="rgba(20,19,14,0.4)" />
                <text
                  x={x + 9}
                  y={y + 4}
                  fill="rgba(20,19,14,0.42)"
                  fontSize="13"
                  letterSpacing="1.6"
                  className="uppercase"
                >
                  {landmark.name}
                </text>
              </g>
            );
          })}

          {/* Ufficio di Merano */}
          <g>
            <rect x={office.x - 5} y={office.y - 5} width="10" height="10" fill="none" stroke="#a07a17" strokeWidth="1.4" transform={`rotate(45 ${office.x} ${office.y})`} />
          </g>

          {/* Immobili */}
          {markers.map(({ property, x, y }) => {
            const isActive = activeId === property.id;
            return (
              <g
                key={property.id}
                onMouseEnter={() => onActiveChange(property.id)}
                onMouseLeave={() => onActiveChange(null)}
                className="cursor-pointer"
              >
                {isActive && <circle cx={x} cy={y} r="26" fill="rgba(160,122,23,0.14)" />}
                <circle
                  cx={x}
                  cy={y}
                  r={isActive ? 9 : 6}
                  fill={isActive ? "#a07a17" : "#fbfaf8"}
                  stroke="#a07a17"
                  strokeWidth="1.5"
                  className="transition-all duration-300"
                />
                {isActive && (
                  <g>
                    <rect
                      x={x + 16}
                      y={y - 34}
                      width={210}
                      height={54}
                      fill="#fbfaf8"
                      stroke="rgba(160,122,23,0.55)"
                    />
                    <text x={x + 28} y={y - 14} fill="#14130e" fontSize="15">
                      {property.content[locale].title.slice(0, 26)}
                    </text>
                    <text x={x + 28} y={y + 6} fill="#a07a17" fontSize="13">
                      {property.priceOnRequest
                        ? t.common.priceOnRequest
                        : formatPriceCompact(property.price, locale)}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </g>
      </svg>

      {/* Etichetta immobile attivo, cliccabile */}
      {activeId && !compact && (
        <div className="pointer-events-none absolute inset-x-4 bottom-4">
          {properties
            .filter((property) => property.id === activeId)
            .map((property) => (
              <Link
                key={property.id}
                href={link(`proprieta/${property.slug}`)}
                className="panel pointer-events-auto flex items-center justify-between gap-4 p-4"
              >
                <span>
                  <span className="block text-[0.6rem] uppercase tracking-[0.16em] text-champagne">
                    {property.location.city}
                  </span>
                  <span className="mt-1 block font-display text-lg text-ink">
                    {property.content[locale].title}
                  </span>
                </span>
                <span className="text-sm text-ink/60">
                  {property.priceOnRequest
                    ? t.common.priceOnRequest
                    : formatPriceCompact(property.price, locale)}
                </span>
              </Link>
            ))}
        </div>
      )}

      <div
        className={cn(
          "absolute flex flex-col gap-px border border-line",
          compact ? "right-2 top-2" : "right-4 top-4",
        )}
      >
        <button
          type="button"
          onClick={() => setZoom((z) => Math.min(3, z + 0.35))}
          aria-label="Zoom +"
          className="flex h-9 w-9 items-center justify-center bg-surface/85 text-ink/70 backdrop-blur-md transition-colors hover:text-champagne"
        >
          <Plus size={14} strokeWidth={1.4} />
        </button>
        <button
          type="button"
          onClick={() => setZoom((z) => Math.max(1, z - 0.35))}
          aria-label="Zoom −"
          className="flex h-9 w-9 items-center justify-center bg-surface/85 text-ink/70 backdrop-blur-md transition-colors hover:text-champagne"
        >
          <Minus size={14} strokeWidth={1.4} />
        </button>
        <button
          type="button"
          onClick={() => {
            setZoom(1);
            setPan({ x: 0, y: 0 });
          }}
          aria-label={t.common.reset}
          className="flex h-9 w-9 items-center justify-center bg-surface/85 text-ink/70 backdrop-blur-md transition-colors hover:text-champagne"
        >
          <Locate size={14} strokeWidth={1.4} />
        </button>
      </div>

      {!compact && (
        <p className="absolute left-4 top-4 text-[0.6rem] uppercase tracking-[0.16em] text-ink/60">
          {t.listing.mapHint}
        </p>
      )}
    </div>
  );
}
