import Link from "next/link";
import { getDictionary } from "@/i18n";
import { DEFAULT_LOCALE } from "@/i18n/config";

/**
 * Not found di sezione. Il segmento [locale] non è leggibile da qui
 * (Next renderizza questa pagina fuori dal contesto dei params), quindi
 * si usa la lingua predefinita: è la scelta che il middleware farebbe.
 */
export default function LocaleNotFound() {
  const t = getDictionary(DEFAULT_LOCALE);

  return (
    <div className="flex min-h-[80vh] items-center">
      <div className="shell">
        <h1 className="font-display text-[clamp(2.6rem,6vw,5rem)] text-ink">{t.errors.notFoundTitle}</h1>
        <p className="mt-5 max-w-md text-sm text-ink/60">{t.errors.notFoundText}</p>
        <Link
          href={`/${DEFAULT_LOCALE}`}
          className="mt-10 inline-block bg-champagne-deep px-8 py-4 text-[0.7rem] uppercase tracking-[0.14em] text-surface transition-colors hover:bg-ink"
        >
          {t.errors.backHome}
        </Link>
      </div>
    </div>
  );
}
