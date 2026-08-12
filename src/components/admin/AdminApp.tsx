"use client";

import Link from "next/link";
import Image from "next/image";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Copy, Download, FileDown, Inbox, LogOut, Pencil, Plus, RefreshCw, Trash2 } from "lucide-react";
import type { Session } from "@supabase/supabase-js";
import { useLocale } from "@/i18n/LocaleProvider";
import { LOCALE_LABELS, LOCALES, type Locale } from "@/i18n/config";
import { COMPANY } from "@/lib/company";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import {
  duplicatePropertyRecord,
  isCurrentUserAdmin,
  listAllProperties,
  removeProperty,
  upsertProperty,
} from "@/lib/properties/admin";
import { formatListingPrice, formatNumber } from "@/lib/format";
import { Logo } from "@/components/layout/Logo";
import { Select } from "@/components/ui/Select";
import { PropertyForm } from "./PropertyForm";
import { LeadsInbox } from "./LeadsInbox";
import { cn } from "@/lib/cn";
import type { Property } from "@/types/property";

/**
 * Area riservata.
 *
 * L'accesso usa Supabase Auth (email + password). L'autorizzazione vera non
 * sta qui ma nel database: le policy RLS accettano scritture solo dagli utenti
 * presenti in `admin_users`. Questo componente si limita a non mostrare
 * un'interfaccia inutilizzabile a chi non è abilitato.
 */

function draftProperty(): Property {
  const now = new Date().toISOString();
  const emptyContent = { title: "", subtitle: "", description: "", metaDescription: "", highlights: [] as string[] };
  return {
    id: "draft-new",
    slug: "",
    reference: "",
    listingType: "sale",
    status: "available",
    category: "villa",
    published: false,
    featured: false,
    price: 0,
    priceOnRequest: false,
    surfaceSqm: 0,
    rooms: 0,
    bedrooms: 0,
    bathrooms: 0,
    energyClass: "A2",
    heating: "heatPump",
    constructionYear: new Date().getFullYear(),
    coOwnership: false,
    coOwnershipProceedings: false,
    feesPayableBy: "buyer",
    amenities: [],
    location: {
      address: "",
      city: COMPANY.localOffice.city,
      province: COMPANY.localOffice.province,
      postalCode: COMPANY.localOffice.postalCode,
      lat: COMPANY.localOffice.lat,
      lng: COMPANY.localOffice.lng,
    },
    images: [],
    floorPlans: [],
    content: { it: { ...emptyContent }, de: { ...emptyContent }, en: { ...emptyContent } },
    createdAt: now,
    updatedAt: now,
  };
}

export function AdminApp() {
  const { t, link, locale } = useLocale();
  const supabase = getSupabaseBrowserClient();

  const [session, setSession] = useState<Session | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [loginError, setLoginError] = useState<string | null>(null);
  const [signingIn, setSigningIn] = useState(false);

  const [properties, setProperties] = useState<Property[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<Property | null>(null);
  const [pdfLocale, setPdfLocale] = useState<Locale>(locale);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [tab, setTab] = useState<"properties" | "leads">("properties");
  /** `null` finché la verifica non è arrivata: evita di far lampeggiare la schermata sbagliata. */
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  /* --------------------------- sessione --------------------------- */
  useEffect(() => {
    if (!supabase) {
      setCheckingSession(false);
      return;
    }
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setCheckingSession(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, next) => setSession(next));
    return () => listener.subscription.unsubscribe();
  }, [supabase]);

  const reload = useCallback(async () => {
    if (!session) return;
    setLoading(true);
    setLoadError(null);
    try {
      // L'abilitazione si chiede al database prima di caricare: un utente non
      // in allowlist riceve comunque un elenco vuoto, e senza questa verifica
      // sarebbe indistinguibile da un catalogo ancora da popolare.
      const allowed = await isCurrentUserAdmin();
      setIsAdmin(allowed);
      setProperties(allowed ? await listAllProperties() : []);
    } catch (cause) {
      setLoadError(cause instanceof Error ? cause.message : t.admin.list.loadError);
    } finally {
      setLoading(false);
    }
  }, [session, t.admin.list.loadError]);

  useEffect(() => {
    void reload();
  }, [reload]);

  // In sviluppo il generatore è raggiungibile dalla console per ispezionare
  // il PDF (numero di pagine, peso) senza far partire un download.
  useEffect(() => {
    if (process.env.NODE_ENV === "production") return;
    void import("@/lib/brochure").then(({ buildBrochure }) => {
      const debug = window as unknown as {
        __buildBrochure?: typeof buildBrochure;
        __properties?: Property[];
      };
      debug.__buildBrochure = buildBrochure;
      debug.__properties = properties;
    });
  }, [properties]);

  async function signIn(event: FormEvent) {
    event.preventDefault();
    if (!supabase) return;
    setSigningIn(true);
    setLoginError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email: credentials.email.trim(),
      password: credentials.password,
    });
    setSigningIn(false);
    if (error) setLoginError(t.admin.login.error);
  }

  async function signOut() {
    await supabase?.auth.signOut();
    setProperties([]);
    setEditing(null);
    setIsAdmin(null);
  }

  /* --------------------------- schermate --------------------------- */
  if (!isSupabaseConfigured) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6 py-32">
        <div className="panel w-full max-w-lg p-10">
          <Logo />
          <h1 className="mt-8 font-display text-3xl text-ink">{t.admin.login.title}</h1>
          <p className="mt-4 text-sm leading-relaxed text-ink/60">{t.admin.login.notConfigured}</p>
          <code className="mt-6 block border border-line bg-black/[0.02] p-4 text-xs leading-relaxed text-ink/60">
            NEXT_PUBLIC_SUPABASE_URL=…
            <br />
            NEXT_PUBLIC_SUPABASE_ANON_KEY=…
          </code>
        </div>
      </div>
    );
  }

  if (checkingSession) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-ink/60">{t.common.loading}</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6 py-32">
        <form onSubmit={signIn} className="panel w-full max-w-md p-10">
          <Logo />
          <h1 className="mt-8 font-display text-3xl text-ink">{t.admin.login.title}</h1>
          <p className="mt-3 text-sm text-ink/60">{t.admin.login.subtitle}</p>

          <label className="mt-8 block">
            <span className="mb-2 block text-[0.62rem] uppercase tracking-[0.14em] text-ink/60">
              {t.admin.login.email}
            </span>
            <input
              type="email"
              required
              value={credentials.email}
              onChange={(event) => setCredentials((c) => ({ ...c, email: event.target.value }))}
              autoComplete="username"
              className="w-full border border-line-strong bg-surface px-4 py-3.5 text-sm text-ink outline-none focus:border-champagne/70"
            />
          </label>

          <label className="mt-4 block">
            <span className="mb-2 block text-[0.62rem] uppercase tracking-[0.14em] text-ink/60">
              {t.admin.login.password}
            </span>
            <input
              type="password"
              required
              value={credentials.password}
              onChange={(event) => setCredentials((c) => ({ ...c, password: event.target.value }))}
              autoComplete="current-password"
              className="w-full border border-line-strong bg-surface px-4 py-3.5 text-sm text-ink outline-none focus:border-champagne/70"
            />
          </label>

          {loginError && <p className="mt-3 text-xs text-red-700">{loginError}</p>}

          <button
            type="submit"
            disabled={signingIn}
            className="mt-6 w-full bg-champagne-deep px-8 py-4 text-[0.68rem] uppercase tracking-[0.14em] text-surface transition-colors hover:bg-ink disabled:opacity-60"
          >
            {signingIn ? t.admin.login.signingIn : t.admin.login.submit}
          </button>

          <p className="mt-6 border-t border-line pt-5 text-[0.68rem] leading-relaxed text-ink/60">
            {t.admin.login.forgot}
          </p>
        </form>
      </div>
    );
  }

  // Autenticato, ma l'abilitazione non è ancora arrivata dal database.
  if (isAdmin === null) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6 py-32">
        {loadError ? (
          <p className="max-w-md border border-red-500/40 bg-red-500/5 px-5 py-3 text-center text-sm text-red-700">
            {loadError}
          </p>
        ) : (
          <p className="text-sm text-ink/60">{t.common.loading}</p>
        )}
      </div>
    );
  }

  /*
    Autenticato ma fuori da `admin_users`. Prima questo caso finiva nello
    stesso empty state di un catalogo vuoto, con il risultato che un admin
    legittimo senza immobili leggeva «il tuo account non è abilitato».
  */
  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6 py-32">
        <div className="panel w-full max-w-lg p-10">
          <Logo />
          <h1 className="mt-8 font-display text-3xl text-ink">{t.admin.login.title}</h1>
          <p className="mt-4 text-sm leading-relaxed text-ink/60">{t.admin.login.notAdmin}</p>
          <p className="mt-4 text-xs text-ink/60">{session.user.email}</p>
          <button
            type="button"
            onClick={() => void signOut()}
            className="mt-8 flex items-center gap-2 border border-line px-5 py-3 text-[0.62rem] uppercase tracking-[0.14em] text-ink/65 transition-colors hover:border-champagne hover:text-champagne"
          >
            <LogOut size={13} strokeWidth={1.4} />
            {t.admin.nav.logout}
          </button>
        </div>
      </div>
    );
  }

  if (editing) {
    return (
      <div className="px-5 py-28 md:px-10">
        <PropertyForm
          initial={editing}
          onSave={async (property) => {
            const saved = await upsertProperty(property);
            await reload();
            setEditing(null);
            return saved;
          }}
          onCancel={() => setEditing(null)}
        />
      </div>
    );
  }

  async function downloadPdf(property: Property) {
    setBusyId(property.id);
    try {
      const { generateBrochure } = await import("@/lib/brochure");
      await generateBrochure(property, pdfLocale);
    } finally {
      setBusyId(null);
    }
  }

  function exportJson() {
    const blob = new Blob([JSON.stringify(properties, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `ianes-immobili-${new Date().toISOString().slice(0, 10)}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="px-5 py-28 md:px-10">
      <header className="flex flex-wrap items-end justify-between gap-6 pb-6">
        <div>
          <h1 className="font-display text-[clamp(2.2rem,4vw,3.4rem)] text-ink">{t.admin.list.title}</h1>
          <p className="mt-2 text-xs text-ink/60">{session.user.email}</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {tab === "properties" && (
            <>
              <Select
                value={pdfLocale}
                options={LOCALES.map((code) => ({ value: code, label: `PDF · ${LOCALE_LABELS[code].short}` }))}
                onChange={(value) => setPdfLocale(value as Locale)}
                align="right"
                className="min-w-36"
                buttonClassName="py-2.5"
              />
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
                onClick={exportJson}
                className="flex items-center gap-2 border border-line px-4 py-3 text-[0.62rem] uppercase tracking-[0.14em] text-ink/65 transition-colors hover:border-champagne hover:text-champagne"
              >
                <Download size={13} strokeWidth={1.4} />
                {t.admin.list.exportJson}
              </button>
              <button
                type="button"
                onClick={() => setEditing(draftProperty())}
                className="flex items-center gap-2 bg-champagne-deep px-5 py-3 text-[0.62rem] uppercase tracking-[0.14em] text-surface transition-colors hover:bg-ink"
              >
                <Plus size={13} strokeWidth={1.6} />
                {t.admin.list.newProperty}
              </button>
            </>
          )}
          <button
            type="button"
            onClick={() => void signOut()}
            aria-label={t.admin.nav.logout}
            className="flex h-11 w-11 items-center justify-center border border-line text-ink/60 transition-colors hover:border-champagne hover:text-champagne"
          >
            <LogOut size={14} strokeWidth={1.4} />
          </button>
        </div>
      </header>

      {/*
        Due schede e non due rotte: l'area riservata è un'unica pagina client
        già montata, e separare gli immobili dalle richieste con un cambio di
        URL costringerebbe a rifare login-check e fetch a ogni passaggio.
      */}
      <div role="tablist" aria-label={t.nav.admin} className="flex gap-1 border-b border-line">
        {([
          { key: "properties", label: t.admin.nav.properties, icon: Pencil },
          { key: "leads", label: t.admin.nav.leads, icon: Inbox },
        ] as const).map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={tab === key}
            onClick={() => setTab(key)}
            className={cn(
              "-mb-px flex items-center gap-2 border-b-2 px-5 py-3 text-[0.66rem] uppercase tracking-[0.14em] transition-colors",
              tab === key
                ? "border-champagne text-champagne"
                : "border-transparent text-ink/60 hover:text-ink",
            )}
          >
            <Icon size={13} strokeWidth={1.5} aria-hidden />
            {label}
          </button>
        ))}
      </div>

      {tab === "leads" ? (
        <div className="mt-8">
          <LeadsInbox />
        </div>
      ) : (
        <>
          <p className="mt-8 text-sm text-ink/60">{t.admin.list.subtitle}</p>

          {loadError && (
            <p className="mt-6 border border-red-500/40 bg-red-500/5 px-5 py-3 text-sm text-red-700">{loadError}</p>
          )}

          {properties.length === 0 && !loading ? (
            <div className="mt-16 border border-line p-14 text-center">
              <p className="text-sm text-ink/60">{t.admin.list.empty}</p>
              <button
                type="button"
                onClick={() => setEditing(draftProperty())}
                className="mt-8 inline-flex items-center gap-2 bg-champagne-deep px-6 py-3 text-[0.62rem] uppercase tracking-[0.14em] text-surface transition-colors hover:bg-ink"
              >
                <Plus size={13} strokeWidth={1.6} />
                {t.admin.list.newProperty}
              </button>
            </div>
          ) : (
            <ul className="mt-8 divide-y divide-[color:var(--color-line)] border border-line">
              {properties.map((property) => (
                <li key={property.id} className="flex flex-wrap items-center gap-5 p-4">
                  <div className="relative h-20 w-28 shrink-0 overflow-hidden bg-surface-soft">
                    {property.images[0] ? (
                      <Image src={property.images[0].src} alt="" fill sizes="112px" className="object-cover" />
                    ) : (
                      <span className="flex h-full items-center justify-center text-[0.6rem] text-ink/60">—</span>
                    )}
                  </div>

                  <div className="min-w-52 flex-1">
                    <p className="text-[0.6rem] uppercase tracking-[0.14em] text-ink/60">
                      {property.reference} · {property.location.city}
                    </p>
                    <p className="mt-1 font-display text-xl text-ink">
                      {property.content[locale].title || property.slug}
                    </p>
                    <p className="mt-1 text-xs text-ink/60">
                      {formatNumber(property.surfaceSqm, locale)} m² · {t.enums.category[property.category]} ·{" "}
                      {property.priceOnRequest
                        ? t.common.priceOnRequest
                        : formatListingPrice(property.price, locale, property.listingType, t.common.perMonth)}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <span
                      className={cn(
                        "border px-3 py-1.5 text-[0.6rem] uppercase tracking-[0.14em]",
                        property.published ? "border-champagne/50 text-champagne" : "border-ink/20 text-ink/60",
                      )}
                    >
                      {property.published ? t.admin.list.published : t.admin.list.draft}
                    </span>
                    <span className="border border-line px-3 py-1.5 text-[0.6rem] uppercase tracking-[0.14em] text-ink/60">
                      {t.enums.status[property.status]}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setEditing(property)}
                      className="flex items-center gap-2 border border-line px-3 py-2 text-[0.6rem] uppercase tracking-[0.16em] text-ink/65 hover:border-champagne hover:text-champagne"
                    >
                      <Pencil size={12} strokeWidth={1.4} />
                      {t.admin.list.edit}
                    </button>
                    <button
                      type="button"
                      onClick={() => void downloadPdf(property)}
                      disabled={busyId === property.id}
                      className="flex items-center gap-2 border border-line px-3 py-2 text-[0.6rem] uppercase tracking-[0.16em] text-ink/65 hover:border-champagne hover:text-champagne disabled:opacity-50"
                    >
                      <FileDown size={12} strokeWidth={1.4} />
                      {busyId === property.id ? t.admin.pdf.generating : t.admin.list.pdf}
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        await duplicatePropertyRecord(property);
                        await reload();
                      }}
                      aria-label={t.admin.list.duplicate}
                      className="border border-line px-3 py-2 text-ink/60 hover:border-champagne hover:text-champagne"
                    >
                      <Copy size={12} strokeWidth={1.4} />
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        if (!window.confirm(t.admin.list.confirmDelete)) return;
                        await removeProperty(property.id);
                        await reload();
                      }}
                      aria-label={t.admin.list.delete}
                      className="border border-line px-3 py-2 text-ink/60 hover:border-red-500/60 hover:text-red-600"
                    >
                      <Trash2 size={12} strokeWidth={1.4} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      <p className="mt-10 border border-line/60 p-5 text-xs leading-relaxed text-ink/60">
        {locale === "de"
          ? "Objekte und Medien liegen im Supabase-Projekt. Schreibrechte haben nur Benutzer in der Tabelle admin_users (Row Level Security)."
          : locale === "en"
            ? "Listings and media live in the Supabase project. Only users listed in the admin_users table can write (row level security)."
            : "Immobili e media risiedono nel progetto Supabase. Possono scrivere solo gli utenti presenti nella tabella admin_users (row level security)."}{" "}
        <Link href={link()} className="text-champagne underline-offset-4 hover:underline">
          {t.errors.backHome}
        </Link>
      </p>
    </div>
  );
}
