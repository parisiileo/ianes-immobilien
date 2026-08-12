/** Concatenazione condizionale di classi, senza dipendenze esterne. */
export function cn(...values: Array<string | false | null | undefined>): string {
  return values.filter(Boolean).join(" ");
}
