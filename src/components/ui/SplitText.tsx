"use client";

import { useEffect, useRef, type ElementType, type FC, type Ref, type ReactNode } from "react";
import { gsap, ScrollTrigger, SplitText as GsapSplitText, prefersReducedMotion } from "@/lib/gsap";
import { cn } from "@/lib/cn";

interface SplitRevealProps {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  /** Granularità dell'animazione. */
  type?: "lines" | "words" | "chars";
  delay?: number;
  stagger?: number;
  /** Se true parte al mount invece che allo scroll (hero). */
  immediate?: boolean;
}

/**
 * Reveal tipografico riga per riga (o parola/lettera) con SplitText.
 * Il testo resta nel DOM in chiaro: SplitText lo riavvolge dopo il mount,
 * quindi SEO e screen reader vedono sempre la frase intera.
 */
export function SplitReveal({
  children,
  as: Tag = "div",
  className,
  type = "lines",
  delay = 0,
  stagger = 0.08,
  immediate = false,
}: SplitRevealProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    if (prefersReducedMotion()) {
      gsap.set(element, { opacity: 1 });
      return;
    }

    const ctx = gsap.context(() => {
      const split = new GsapSplitText(element, {
        type,
        linesClass: "split-line-item",
        mask: type === "lines" ? "lines" : undefined,
      });

      const targets = type === "lines" ? split.lines : type === "words" ? split.words : split.chars;

      gsap.set(element, { opacity: 1 });
      const tween = gsap.from(targets, {
        yPercent: 118,
        opacity: 0,
        duration: 1.15,
        ease: "power4.out",
        stagger,
        delay,
        ...(immediate
          ? {}
          : {
              scrollTrigger: {
                trigger: element,
                start: "top 88%",
                once: true,
              },
            }),
      });

      return () => {
        tween.kill();
        split.revert();
      };
    }, element);

    return () => ctx.revert();
  }, [delay, immediate, stagger, type]);

  // `as` è un ElementType generico: lo si tipizza sui soli prop che passiamo,
  // altrimenti TypeScript collassa l'unione dei tag su `never`.
  const Component = Tag as FC<{ ref?: Ref<HTMLElement>; className?: string; children?: ReactNode }>;

  return (
    <Component ref={ref} className={cn("opacity-0", className)}>
      {children}
    </Component>
  );
}

interface RevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  /** Ritardo progressivo tra i figli diretti. */
  stagger?: number;
  as?: ElementType;
}

/** Fade-up generico allo scroll, applicato al blocco o ai suoi figli. */
export function Reveal({ children, className, delay = 0, y = 28, stagger, as: Tag = "div" }: RevealProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    if (prefersReducedMotion()) {
      gsap.set(element, { opacity: 1 });
      return;
    }

    const ctx = gsap.context(() => {
      const targets = stagger ? Array.from(element.children) : element;
      if (stagger) gsap.set(element, { opacity: 1 });

      gsap.fromTo(
        targets,
        { opacity: 0, y },
        {
          opacity: 1,
          y: 0,
          duration: 1.1,
          delay,
          stagger,
          ease: "power3.out",
          scrollTrigger: { trigger: element, start: "top 88%", once: true },
        },
      );
    }, element);

    return () => ctx.revert();
  }, [delay, stagger, y]);

  // `as` è un ElementType generico: lo si tipizza sui soli prop che passiamo,
  // altrimenti TypeScript collassa l'unione dei tag su `never`.
  const Component = Tag as FC<{ ref?: Ref<HTMLElement>; className?: string; children?: ReactNode }>;

  return (
    <Component ref={ref} className={cn("opacity-0", className)}>
      {children}
    </Component>
  );
}

/** Aggiorna ScrollTrigger dopo cambi di layout (filtri, tab, immagini). */
export function refreshScrollTriggers() {
  requestAnimationFrame(() => ScrollTrigger.refresh());
}
