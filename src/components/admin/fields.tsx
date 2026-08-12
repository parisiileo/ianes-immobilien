"use client";

import { cn } from "@/lib/cn";

const BASE =
  "w-full border border-line-strong bg-surface px-4 py-3 text-sm text-ink outline-none transition-colors placeholder:text-ink/60 focus:border-champagne/70";

export function Field({
  label,
  hint,
  children,
  className,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-2 block text-[0.62rem] uppercase tracking-[0.14em] text-ink/60">{label}</span>
      {children}
      {hint && <span className="mt-1.5 block text-[0.68rem] text-ink/60">{hint}</span>}
    </label>
  );
}

export function TextInput({
  value,
  onChange,
  placeholder,
  type = "text",
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  className?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      className={cn(BASE, className)}
    />
  );
}

export function NumberInput({
  value,
  onChange,
  step = 1,
  placeholder,
}: {
  value: number;
  onChange: (value: number) => void;
  step?: number;
  placeholder?: string;
}) {
  return (
    <input
      type="number"
      step={step}
      value={Number.isFinite(value) ? value : ""}
      onChange={(event) => onChange(event.target.value === "" ? 0 : Number(event.target.value))}
      placeholder={placeholder}
      className={BASE}
    />
  );
}

export function TextArea({
  value,
  onChange,
  rows = 5,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  placeholder?: string;
}) {
  return (
    <textarea
      value={value}
      onChange={(event) => onChange(event.target.value)}
      rows={rows}
      placeholder={placeholder}
      className={cn(BASE, "resize-y leading-relaxed")}
    />
  );
}

export function Section({
  title,
  children,
  description,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border border-line">
      <header className="border-b border-line px-6 py-4">
        <h3 className="font-display text-xl text-ink">{title}</h3>
        {description && <p className="mt-1 text-xs text-ink/60">{description}</p>}
      </header>
      <div className="space-y-5 p-6">{children}</div>
    </section>
  );
}
