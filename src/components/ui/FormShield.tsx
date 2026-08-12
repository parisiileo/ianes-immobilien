"use client";

import { useCallback, useRef, useState } from "react";

/**
 * Primo filtro anti-bot sui moduli pubblici.
 *
 * Non è la protezione principale — quella è il rate limit nel database
 * (`20260812120000_lead_anti_abuse.sql`), l'unico punto che vede anche le
 * chiamate diritte all'API REST. Questi due controlli servono a fermare i bot
 * ingenui, che il modulo lo compilano davvero, prima che tocchino il database.
 *
 * 1. Campo esca, invisibile ma presente nel DOM: un umano non lo vede, molti
 *    bot riempiono ogni input che trovano.
 * 2. Tempo minimo di compilazione: una submit istantanea non è umana.
 */

/**
 * Soglia bassa di proposito. Con il riempimento automatico del browser un
 * utente vero può inviare in poco più di un secondo, e bloccarlo sarebbe un
 * danno peggiore dello spam che si evita.
 */
const MIN_FILL_MS = 1500;

export interface FormShield {
  /** Da applicare al campo esca: `<input {...shield.honeypotProps} />` */
  honeypotProps: {
    name: string;
    value: string;
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    tabIndex: number;
    autoComplete: string;
    "aria-hidden": true;
    className: string;
    style: React.CSSProperties;
  };
  /** `false` quando l'invio ha l'aria di essere automatico. */
  looksHuman: () => boolean;
}

export function useFormShield(): FormShield {
  const mountedAt = useRef(Date.now());
  const [bait, setBait] = useState("");

  const looksHuman = useCallback(
    () => bait.trim() === "" && Date.now() - mountedAt.current >= MIN_FILL_MS,
    [bait],
  );

  return {
    honeypotProps: {
      // Nome plausibile: un campo chiamato "honeypot" verrebbe riconosciuto.
      name: "company_website",
      value: bait,
      onChange: (event) => setBait(event.target.value),
      tabIndex: -1,
      autoComplete: "off",
      "aria-hidden": true,
      /*
        Fuori schermo invece di `display:none`: i bot più accorti ignorano i
        campi nascosti in modo evidente, mentre questo resta a tutti gli
        effetti compilabile. `aria-hidden` e `tabIndex -1` lo tengono fuori
        sia dalla navigazione da tastiera sia dagli screen reader.
      */
      className: "sr-only",
      style: { position: "absolute", left: "-9999px", top: 0, height: 0, width: 0 },
    },
    looksHuman,
  };
}
