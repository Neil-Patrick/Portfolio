import { cacheLife } from "next/cache";
import Link from "next/link";
import { education } from "@/content/credentials";
import { sections, site } from "@/content/site";
import { NEW_TAB_NOTE, isExternal, linkTarget } from "@/lib/links";
import { ContactIcon, SectionIcon } from "./icons";

const linkClass = "inline-flex min-h-11 items-center gap-2 text-ink-muted transition-colors hover:text-accent";
const headingClass = "mb-2 hud-label text-sm text-ink";

/**
 * The current year, cached (Cache Components won't let a prerender read the
 * clock directly; node_modules/next/dist/docs/01-app/02-guides/migrating-to-cache-components.md).
 */
async function CopyrightYear() {
  "use cache";
  // The year only changes once a year; don't make every page refresh every 15 minutes for it.
  cacheLife("days");
  return new Date().getFullYear();
}

/**
 * The site's sign-off, on every page: a bracketed HUD panel with a teal tab on
 * its top edge. A transmission-end line with the live availability status,
 * then the page and contact links (every icon in one ink, teal on hover), then
 * the copyright and location.
 */
export function SiteFooter() {
  return (
    <footer className="container-page mt-12 pb-8">
      {/* Canvas-tinted glass, so the home wave lines don't run through the text. */}
      <div className="relative hud-corners border border-line bg-canvas/80 px-4 py-8 backdrop-blur-sm sm:px-8">
        {/* The teal tab: a short notched bar riding the top edge. */}
        <span aria-hidden className="absolute -top-px left-6 h-1 w-20 bg-accent hud-notch sm:left-10 sm:w-28" />

        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
          <p aria-hidden className="hud-label text-sm text-ink-muted">
            {"// End of Transmission"}
          </p>
          <p className="flex items-center gap-2 hud-label text-sm text-accent">
            <span aria-hidden className="live-pulse size-2 bg-accent" />
            {site.availability}
          </p>
        </div>

        <div className="mt-8 grid gap-8 border-t border-line pt-8 sm:grid-cols-2">
          <nav aria-labelledby="footer-pages">
            <h2 id="footer-pages" className={headingClass}>
              Pages
            </h2>
            <ul className="grid grid-cols-2 gap-x-6 sm:grid-cols-3">
              {sections.map((section) => (
                <li key={section.id}>
                  <Link href={section.href} className={linkClass}>
                    <SectionIcon id={section.id} />
                    {section.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 id="footer-contact" className={headingClass}>
              Get in Touch
            </h2>
            <ul aria-labelledby="footer-contact" className="flex flex-wrap gap-x-6">
              {site.contactLinks.map((link) => (
                <li key={link.label}>
                  <a href={link.href} {...linkTarget(link.href)} className={linkClass}>
                    <ContactIcon label={link.label} mono />
                    {link.label}
                    {isExternal(link.href) && <span className="sr-only">{NEW_TAB_NOTE}</span>}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap justify-between gap-x-6 gap-y-1 border-t border-line pt-6 text-sm text-ink-muted">
          <p>
            © <CopyrightYear /> {site.name}
          </p>
          <p>{education[0].location}</p>
        </div>
      </div>
    </footer>
  );
}
