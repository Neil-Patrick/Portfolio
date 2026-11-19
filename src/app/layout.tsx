import type { Metadata } from "next";
import { IBM_Plex_Sans } from "next/font/google";
import { InlineScript } from "@/components/InlineScript";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { MotionRoot } from "@/components/motion/MotionRoot";
import { site } from "@/content/site";
import { themeInitScript } from "@/lib/theme";
import "./globals.css";

// One family for everything: engineering character, tabular figures for dates and counts.
const plex = IBM_Plex_Sans({
  variable: "--font-plex",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  // Section pages set `title: "About"` etc. and get "About | [Your Name]".
  title: { default: site.name, template: `%s | ${site.name}` },
  description: site.description,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      // The inline theme script sets data-theme before React hydrates.
      suppressHydrationWarning
      // Smooth anchor scrolling, but instant jumps on route changes (Next.js reads this).
      data-scroll-behavior="smooth"
      className={`${plex.variable} h-full antialiased`}
    >
      <head>
        <InlineScript html={themeInitScript} />
        {/* Without JavaScript, entrance animations never run: show their content as-is. */}
        <noscript>
          <style>{
              "[data-reveal]{opacity:1!important;transform:none!important}.heat-cell{opacity:1!important;scale:1!important}.streak-ring{stroke-dashoffset:var(--offset)!important}"
            }</style>
        </noscript>
      </head>
      <body className="flex min-h-full flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-20 focus:bg-accent focus:px-4 focus:py-3 focus:text-on-accent"
        >
          Skip to Content
        </a>
        <MotionRoot>
          <SiteHeader />
          <main id="main" tabIndex={-1} className="flex-1 outline-none">
            {children}
          </main>
          <SiteFooter />
        </MotionRoot>
      </body>
    </html>
  );
}
