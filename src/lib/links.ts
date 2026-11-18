/**
 * Props for links to other sites (Credly, GitHub, live project sites): open in a
 * new tab, and don't give that page access to this one (noopener) or send it
 * a referrer. Pair with NEW_TAB_NOTE as screen-reader text, so the change of
 * context is announced.
 */
export const newTab = { target: "_blank", rel: "noopener noreferrer" } as const;

export const NEW_TAB_NOTE = " (opens in a new tab)";

/** True for links to other sites (http/https). mailto: and on-site links stay in this tab. */
export const isExternal = (href: string) => /^https?:\/\//.test(href);

/** newTab props for outside links, nothing for the rest (for lists that mix both). */
export const linkTarget = (href: string) => (isExternal(href) ? newTab : {});
