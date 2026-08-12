"use client";

import { useSyncExternalStore } from "react";

export interface ConsentState {
  necessary: true;
  preferences: boolean;
  analytics: boolean;
  marketing: boolean;
  /** ISO della scelta: serve a dimostrare il consenso ai sensi del GDPR. */
  decidedAt: string;
  version: number;
}

export const CONSENT_VERSION = 1;
const STORAGE_KEY = "ianes.consent.v1";
const EVENT = "ianes:consent-changed";
export const OPEN_PREFERENCES_EVENT = "ianes:open-cookie-preferences";

let cache: ConsentState | null | undefined;

function read(): ConsentState | null {
  if (typeof window === "undefined") return null;
  if (cache !== undefined) return cache;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as ConsentState) : null;
    cache = parsed && parsed.version === CONSENT_VERSION ? parsed : null;
  } catch {
    cache = null;
  }
  return cache;
}

export function setConsent(partial: Omit<ConsentState, "necessary" | "decidedAt" | "version">): void {
  const next: ConsentState = {
    necessary: true,
    ...partial,
    decidedAt: new Date().toISOString(),
    version: CONSENT_VERSION,
  };
  cache = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* storage non disponibile */
  }
  window.dispatchEvent(new Event(EVENT));
}

export function acceptAll(): void {
  setConsent({ preferences: true, analytics: true, marketing: true });
}

export function rejectAll(): void {
  setConsent({ preferences: false, analytics: false, marketing: false });
}

export function openPreferences(): void {
  window.dispatchEvent(new Event(OPEN_PREFERENCES_EVENT));
}

function subscribe(callback: () => void): () => void {
  window.addEventListener(EVENT, callback);
  return () => window.removeEventListener(EVENT, callback);
}

/** null = nessuna scelta ancora espressa → il banner deve comparire. */
export function useConsent(): ConsentState | null {
  return useSyncExternalStore(
    subscribe,
    read,
    () => null,
  );
}
