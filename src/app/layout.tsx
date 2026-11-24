import type { Metadata } from "next";
import { IBM_Plex_Sans, Saira_Condensed } from "next/font/google";
import { InlineScript } from "@/components/InlineScript";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { IntroLoader } from "@/components/intro/IntroLoader";
import { MotionRoot } from "@/components/motion/MotionRoot";
import { BackToTop } from "@/components/nav/BackToTop";
import { site } from "@/content/site";
import { introInitScript } from "@/lib/intro";
import { themeInitScript } from "@/lib/theme";
import "./globals.css";

// One family for everything: engineering character, tabular figures for dates and counts.
const plex = IBM_Plex_Sans({
  variable: "--font-plex",
  subsets: ["latin"],
});

// HUD display face (section pages): condensed, for titles, tabs, and short caps labels.
const saira = Saira_Condensed({
  variable: "--font-saira",
  weight: ["600", "700"],
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
      className={`${plex.variable} ${saira.variable} h-full antialiased`}
    >
      <head>
        <InlineScript html={themeInitScript} />
        {/* Decides whether the home loading screen plays, before first paint (src/lib/intro.ts). */}
        <InlineScript html={introInitScript} />
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
          {/* The home loading screen. Here, not in the home page: it must come before the header and stay
              outside the page transition's fade (template.tsx), or the page shows before it. Hidden unless
              the <head> script turns it on (every full load of Home). */}
          <IntroLoader />
          <SiteHeader />
          <main id="main" tabIndex={-1} className="flex-1 outline-none">
            {children}
          </main>
          <SiteFooter />
          <BackToTop />
        </MotionRoot>
      </body>
    </html>
  );
}
