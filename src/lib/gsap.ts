"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Flip } from "gsap/Flip";
import { SplitText } from "gsap/SplitText";

/**
 * Registrazione unica dei plugin. I moduli GSAP toccano il DOM, quindi
 * l'import va fatto solo da componenti client.
 */
let registered = false;

export function registerGsap() {
  if (registered || typeof window === "undefined") return;
  gsap.registerPlugin(ScrollTrigger, Flip, SplitText);
  gsap.defaults({ ease: "power3.out", duration: 1 });
  registered = true;
}

registerGsap();

export { gsap, ScrollTrigger, Flip, SplitText };

/** Rispetta prefers-reduced-motion: le animazioni decorative vengono saltate. */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
