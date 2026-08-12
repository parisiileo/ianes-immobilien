/**
 * Inietta uno schema JSON-LD. Il contenuto è generato dal server e non
 * proviene mai da input utente, quindi l'uso di dangerouslySetInnerHTML è
 * sicuro; i caratteri `<` vengono comunque neutralizzati per prudenza.
 */
export function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
