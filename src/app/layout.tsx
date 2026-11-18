import type { Metadata } from "next";
import { Atkinson_Hyperlegible_Next, Pixelify_Sans } from "next/font/google";
import { SiteHeader } from "@/components/SiteHeader";
import { site } from "@/content/site";
import { themeInitScript } from "@/lib/theme";
import "./globals.css";

// Pixel face for headings, nav, and labels (never body text). Body face built for readability.
const pixel = Pixelify_Sans({
  variable: "--font-pixel",
  subsets: ["latin"],
});

const body = Atkinson_Hyperlegible_Next({
  variable: "--font-body",
  subsets: ["latin"],
  // Next has no metric overrides for this font yet, so fall back to system fonts plainly.
  adjustFontFallback: false,
  fallback: ["ui-sans-serif", "system-ui", "sans-serif"],
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
      className={`${pixel.variable} ${body.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="flex min-h-full flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-20 focus:bg-accent focus:px-4 focus:py-3 focus:text-on-accent"
        >
          Skip to content
        </a>
        <SiteHeader />
        <main id="main" tabIndex={-1} className="flex-1 outline-none">
          {children}
        </main>
      </body>
    </html>
  );
}
