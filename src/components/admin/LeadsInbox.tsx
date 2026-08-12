"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Check,
  Download,
  Mail,
  Phone,
  RefreshCw,
  RotateCcw,
  Trash2,
} from "lucide-react";
import { useLocale } from "@/i18n/LocaleProvider";
import { LOCALE_TAGS } from "@/i18n/config";
import { listLeads, leadsToCsv, removeLead, setLeadHandled } from "@/lib/leads/admin";
import { LEAD_KINDS, type Lead, type LeadKindFilter, type LeadStatusFilter } from "@/types/lead";
import { Select, type SelectOption } from "@/components/ui/Select";
import { cn } from "@/lib/cn";

/** Etichette leggibili per le chiavi di `payload`, che arrivano dal modulo di valutazione. */
const PAYLOAD_LABELS: Record<string, string> = {
  category: "Categoria",
  city: "Comune",
  address: "Indirizzo",
  surfaceSqm: "Superficie (m²)",
  rooms: "Locali",
  bedrooms: "Camere",
  bathrooms: "Bagni",
  year: "Anno",
  energyClass: "Classe energetica",
};

function formatPayloadValue(value: unknown): string {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "boolean") return value ? "sì" : "no";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

/**
 * Elenco delle richieste arrivate dai moduli pubblici.
 *
 * È volutamente una lista e non una tabella: i messaggi hanno lunghezza molto
 * variabile e in una griglia a colonne fisse verrebbero troncati proprio dove
 * sta l'informazione utile. Ogni riga è già completa, senza dover aprire un
 * dettaglio: chi legge le richieste vuole rispondere, non navigare.
 */
export function LeadsInbox() {
  const { t, fill, locale } = useLocale();

  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const [kind, setKind] = useState<LeadKindFilter>("all");
  const [status, setStatus] = useState<LeadStatusFilter>("all");
  const [query, setQuery] = useState("");

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setLeads(await listLeads());
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : t.admin.inbox.loadError);
    } finally {
      setLoading(false);
    }
  }, [t.admin.inbox.loadError]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const dateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(LOCALE_TAGS[locale], {
        dateStyle: "medium",
        timeStyle: "short",
      }),
    [locale],
  );

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return leads.filter((lead) => {
      if (kind !== "all" && lead.kind !== kind) return false;
      if (status === "pending" && lead.handled) return false;
      if (status === "handled" && !lead.handled) return false;
      if (!needle) return true;
      return [lead.name, lead.email, lead.phone, lead.propertyReference, lead.message]
        .filter(Boolean)
        .some((field) => (field as string).toLowerCase().includes(needle));
    });
  }, [kind, leads, query, status]);

  const pendingCount = useMemo(() => leads.filter((lead) => !lead.handled).length, [leads]);

  /**
   * Aggiornamento ottimistico: la riga cambia stato subito e si rimette com'era
   * se il database rifiuta. Segnare «gestita» è il gesto che si ripete di più,
   * e aspettare il round-trip a ogni clic renderebbe l'elenco lento da smaltire.
   */
  async function toggleHandled(lead: Lead) {
    const next = !lead.handled;
    setBusyId(lead.id);
    setLeads((current) => current.map((row) => (row.id === lead.id ? { ...row, handled: next } : row)));
    try {
      await setLeadHandled(lead.id, next);
      setError(null);
    } catch (cause) {
      setLeads((current) =>
        current.map((row) => (row.id === lead.id ? { ...row, handled: lead.handled } : row)),
      );
      setError(cause instanceof Error ? cause.message : t.admin.inbox.updateError);
    } finally {
      setBusyId(null);
    }
  }

  async function destroy(lead: Lead) {
    if (!window.confirm(t.admin.inbox.confirmDelete)) return;
    setBusyId(lead.id);
    try {
      await removeLead(lead.id);
      setLeads((current) => current.filter((row) => row.id !== lead.id));
      setError(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : t.admin.inbox.updateError);
    } finally {
      setBusyId(null);
    }
  }

  function exportCsv() {
    const blob = new Blob([leadsToCsv(visible)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `ianes-richieste-${new Date().toISOString().slice(0, 10)}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  const kindOptions: SelectOption<LeadKindFilter>[] = [
    { value: "all", label: t.admin.inbox.allKinds },
    ...LEAD_KINDS.map((value) => ({ value, label: t.admin.inbox.kinds[value] })),
  ];
  const statusOptions: SelectOption<LeadStatusFilter>[] = [
    { value: "all", label: t.admin.inbox.allStatuses },
    { value: "pending", label: t.admin.inbox.pending },
    { value: "handled", label: t.admin.inbox.handled },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-6 border-b border-line pb-6">
        <div>
          <h2 className="font-display text-3xl text-ink">{t.admin.inbox.title}</h2>
          <p className="mt-2 text-sm text-ink/60">{t.admin.inbox.subtitle}</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => void reload()}
            className="flex items-center gap-2 border border-line px-4 py-3 text-[0.62rem] uppercase tracking-[0.14em] text-ink/65 transition-colors hover:border-champagne hover:text-champagne"
          >
            <RefreshCw size={13} strokeWidth={1.4} className={cn(loading && "animate-spin")} />
            {t.common.reset}
          </button>
          <button
            type="button"
            onClick={exportCsv}
            disabled={visible.length === 0}
            className="flex items-center gap-2 border border-line px-4 py-3 text-[0.62rem] uppercase tracking-[0.14em] text-ink/65 transition-colors hover:border-champagne hover:text-champagne disabled:opacity-50"
          >
            <Download size={13} strokeWidth={1.4} />
            {t.admin.inbox.exportCsv}
          </button>
        </div>
      </div>

      {/* ----------------------------- filtri ----------------------------- */}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <label className="min-w-56 flex-1">
          <span className="sr-only">{t.admin.inbox.search}</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t.admin.inbox.search}
            className="w-full border border-line-strong bg-surface px-4 py-3 text-sm text-ink outline-none transition-colors placeholder:text-ink/60 focus:border-champagne/70"
          />
        </label>
        <Select
          value={kind}
          options={kindOptions}
          onChange={setKind}
          className="min-w-44"
          buttonClassName="py-2.5"
        />
        <Select
          value={status}
          options={statusOptions}
          onChange={setStatus}
          className="min-w-44"
          buttonClassName="py-2.5"
        />
        {pendingCount > 0 && (
          <span className="border border-champagne/50 px-3 py-2 text-[0.62rem] uppercase tracking-[0.14em] text-champagne">
            {fill(t.admin.inbox.pendingBadge, { count: pendingCount })}
          </span>
        )}
      </div>

      {error && (
        <p className="mt-6 border border-red-500/40 bg-red-500/5 px-5 py-3 text-sm text-red-700">{error}</p>
      )}

      {/* ----------------------------- elenco ----------------------------- */}
      {visible.length === 0 && !loading ? (
        <div className="mt-10 border border-line p-14 text-center">
          <p className="text-sm text-ink/60">
            {leads.length === 0 ? t.admin.inbox.empty : t.admin.inbox.emptyFiltered}
          </p>
        </div>
      ) : (
        <ul className="mt-8 space-y-4">
          {visible.map((lead) => {
            const payloadEntries = Object.entries(lead.payload).filter(
              ([, value]) => value !== null && value !== undefined && value !== "",
            );

            return (
              <li
                key={lead.id}
                className={cn(
                  "border p-5 transition-colors sm:p-6",
                  lead.handled ? "border-line bg-surface-soft/60" : "border-line-strong bg-surface",
                )}
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-56 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="border border-champagne/50 px-2.5 py-1 text-[0.58rem] uppercase tracking-[0.14em] text-champagne">
                        {t.admin.inbox.kinds[lead.kind]}
                      </span>
                      <span
                        className={cn(
                          "border px-2.5 py-1 text-[0.58rem] uppercase tracking-[0.14em]",
                          lead.handled
                            ? "border-line text-ink/60"
                            : "border-ink/25 text-ink/75",
                        )}
                      >
                        {lead.handled ? t.admin.inbox.handled : t.admin.inbox.pending}
                      </span>
                      <span className="text-[0.62rem] uppercase tracking-[0.14em] text-ink/60">
                        {lead.locale.toUpperCase()}
                      </span>
                      <time dateTime={lead.createdAt} className="text-xs text-ink/60">
                        {dateFormatter.format(new Date(lead.createdAt))}
                      </time>
                    </div>

                    <p className="mt-3 font-display text-2xl text-ink">
                      {lead.name || lead.email}
                    </p>

                    <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm">
                      <a
                        href={`mailto:${lead.email}`}
                        className="flex items-center gap-2 text-ink/70 underline-offset-4 hover:text-champagne hover:underline"
                      >
                        <Mail size={13} strokeWidth={1.4} aria-hidden />
                        {lead.email}
                      </a>
                      {lead.phone && (
                        <a
                          href={`tel:${lead.phone.replace(/\s+/g, "")}`}
                          className="flex items-center gap-2 text-ink/70 underline-offset-4 hover:text-champagne hover:underline"
                        >
                          <Phone size={13} strokeWidth={1.4} aria-hidden />
                          {lead.phone}
                        </a>
                      )}
                      {lead.propertyReference && (
                        <span className="text-ink/60">
                          {t.admin.inbox.property}: {lead.propertyReference}
                        </span>
                      )}
                      {lead.subject && (
                        <span className="text-ink/60">{lead.subject}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => void toggleHandled(lead)}
                      disabled={busyId === lead.id}
                      className="flex items-center gap-2 border border-line px-3 py-2 text-[0.6rem] uppercase tracking-[0.16em] text-ink/65 transition-colors hover:border-champagne hover:text-champagne disabled:opacity-50"
                    >
                      {lead.handled ? (
                        <RotateCcw size={12} strokeWidth={1.4} aria-hidden />
                      ) : (
                        <Check size={12} strokeWidth={1.6} aria-hidden />
                      )}
                      {lead.handled ? t.admin.inbox.markPending : t.admin.inbox.markHandled}
                    </button>
                    <a
                      href={`mailto:${lead.email}`}
                      className="flex items-center gap-2 border border-line px-3 py-2 text-[0.6rem] uppercase tracking-[0.16em] text-ink/65 transition-colors hover:border-champagne hover:text-champagne"
                    >
                      <Mail size={12} strokeWidth={1.4} aria-hidden />
                      {t.admin.inbox.reply}
                    </a>
                    <button
                      type="button"
                      onClick={() => void destroy(lead)}
                      disabled={busyId === lead.id}
                      aria-label={t.admin.inbox.delete}
                      className="border border-line px-3 py-2 text-ink/60 transition-colors hover:border-red-500/60 hover:text-red-600 disabled:opacity-50"
                    >
                      <Trash2 size={12} strokeWidth={1.4} aria-hidden />
                    </button>
                  </div>
                </div>

                <p className="mt-4 whitespace-pre-wrap border-t border-line pt-4 text-sm leading-relaxed text-ink/75">
                  {lead.message || <span className="text-ink/60">{t.admin.inbox.noMessage}</span>}
                </p>

                {payloadEntries.length > 0 && (
                  <div className="mt-4">
                    <p className="text-[0.6rem] uppercase tracking-[0.14em] text-ink/60">
                      {t.admin.inbox.details}
                    </p>
                    <dl className="mt-2 grid gap-x-8 gap-y-1 text-xs sm:grid-cols-2 lg:grid-cols-3">
                      {payloadEntries.map(([key, value]) => (
                        <div key={key} className="flex justify-between gap-4 border-b border-line/60 py-1">
                          <dt className="text-ink/60">{PAYLOAD_LABELS[key] ?? key}</dt>
                          <dd className="text-right text-ink/85">{formatPayloadValue(value)}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      <p className="mt-10 border border-line/60 p-5 text-xs leading-relaxed text-ink/60">
        {t.admin.inbox.consentAt}
      </p>
    </div>
  );
}
