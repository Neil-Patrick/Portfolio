/**
 * Props for links to other sites (Credly, GitHub, live project sites): open in a
 * new tab, and don't give that page access to this one (noopener) or send it
 * a referrer. Pair with NEW_TAB_NOTE as screen-reader text, so the change of
 * context is announced.
 */
export const newTab = { target: "_blank", rel: "noopener noreferrer" } as const;

export const NEW_TAB_NOTE = " (opens in a new tab)";
