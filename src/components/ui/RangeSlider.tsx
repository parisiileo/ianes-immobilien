"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

interface RangeSliderProps {
  min: number;
  max: number;
  step: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
  format: (value: number) => string;
  label?: string;
  className?: string;
}

/**
 * Slider a due maniglie costruito da zero: gli <input type="range">
 * sovrapposti non permettono la resa grafica richiesta (traccia oro,
 * maniglie sottili, valori formattati in valuta).
 */
export function RangeSlider({ min, max, step, value, onChange, format, label, className }: RangeSliderProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState<0 | 1 | null>(null);

  const toPercent = useCallback((v: number) => ((v - min) / (max - min)) * 100, [max, min]);

  const fromClientX = useCallback(
    (clientX: number) => {
      const rect = trackRef.current?.getBoundingClientRect();
      if (!rect) return min;
      const ratio = Math.min(Math.max((clientX - rect.left) / rect.width, 0), 1);
      const raw = min + ratio * (max - min);
      return Math.round(raw / step) * step;
    },
    [max, min, step],
  );

  useEffect(() => {
    if (dragging === null) return;

    function onMove(event: PointerEvent) {
      const next = fromClientX(event.clientX);
      if (dragging === 0) onChange([Math.min(next, value[1] - step), value[1]]);
      else onChange([value[0], Math.max(next, value[0] + step)]);
    }
    function onUp() {
      setDragging(null);
    }

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [dragging, fromClientX, onChange, step, value]);

  function onHandleKey(index: 0 | 1, event: React.KeyboardEvent) {
    const delta =
      event.key === "ArrowRight" || event.key === "ArrowUp"
        ? step
        : event.key === "ArrowLeft" || event.key === "ArrowDown"
          ? -step
          : event.key === "PageUp"
            ? step * 10
            : event.key === "PageDown"
              ? -step * 10
              : 0;
    if (!delta) return;
    event.preventDefault();
    if (index === 0) onChange([Math.min(Math.max(value[0] + delta, min), value[1] - step), value[1]]);
    else onChange([value[0], Math.max(Math.min(value[1] + delta, max), value[0] + step)]);
  }

  const left = toPercent(value[0]);
  const right = toPercent(value[1]);

  return (
    <div className={cn("select-none", className)}>
      {label && (
        <div className="mb-4 flex items-baseline justify-between">
          <span className="text-[0.6875rem] uppercase tracking-[0.16em] text-ink/60">{label}</span>
          <span className="font-display text-lg text-ink">
            {format(value[0])} – {format(value[1])}
          </span>
        </div>
      )}

      <div
        ref={trackRef}
        className="relative h-10 cursor-pointer"
        onPointerDown={(event) => {
          const next = fromClientX(event.clientX);
          const closest = Math.abs(next - value[0]) < Math.abs(next - value[1]) ? 0 : 1;
          setDragging(closest as 0 | 1);
          if (closest === 0) onChange([Math.min(next, value[1] - step), value[1]]);
          else onChange([value[0], Math.max(next, value[0] + step)]);
        }}
      >
        <div className="absolute top-1/2 h-px w-full -translate-y-1/2 bg-line" />
        <div
          className="absolute top-1/2 h-px -translate-y-1/2 bg-champagne"
          style={{ left: `${left}%`, right: `${100 - right}%` }}
        />

        {([0, 1] as const).map((index) => (
          <button
            key={index}
            type="button"
            role="slider"
            aria-label={label}
            aria-valuemin={index === 0 ? min : value[0]}
            aria-valuemax={index === 0 ? value[1] : max}
            aria-valuenow={value[index]}
            aria-valuetext={format(value[index])}
            onKeyDown={(event) => onHandleKey(index, event)}
            onPointerDown={(event) => {
              event.stopPropagation();
              setDragging(index);
            }}
            className={cn(
              "absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rotate-45 border border-champagne bg-surface transition-transform duration-200",
              dragging === index ? "scale-125 bg-champagne" : "hover:scale-110",
            )}
            style={{ left: `${index === 0 ? left : right}%` }}
          />
        ))}
      </div>
    </div>
  );
}
