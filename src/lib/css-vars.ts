import type { CSSProperties } from "react";

/** CSS custom properties for an inline style (React's types only know standard properties). */
export const cssVars = (values: Record<string, string | number>) => values as CSSProperties;
