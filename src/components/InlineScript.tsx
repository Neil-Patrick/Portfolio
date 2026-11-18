"use client";

/**
 * An inline script that runs once, while the browser parses the server HTML
 * (e.g. the theme script, before first paint). On the client it renders as
 * inert text/plain, so React never renders an executable <script> and doesn't
 * warn; suppressHydrationWarning covers the type difference.
 * Pattern from node_modules/next/dist/docs/01-app/02-guides/preventing-flash-before-hydration.md
 */
export function InlineScript({ html }: { html: string }) {
  return (
    <script
      type={typeof window === "undefined" ? "text/javascript" : "text/plain"}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
