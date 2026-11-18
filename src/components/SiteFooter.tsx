import Link from "next/link";
import { sections, site } from "@/content/site";

const linkClass = "inline-flex min-h-11 items-center hover:text-accent hover:underline";

/**
 * Plain-text fallback navigation and contact links, so nobody depends on
 * discovering the wheel menu to get around.
 */
export function SiteFooter() {
  return (
    <footer className="mt-12 border-t-3 border-frame bg-panel">
      <div className="container-page grid gap-8 py-10 sm:grid-cols-2">
        <nav aria-labelledby="footer-pages">
          <h2 id="footer-pages" className="mb-2 text-lg">
            Pages
          </h2>
          <ul className="grid grid-cols-2 gap-x-6 sm:grid-cols-3">
            {sections.map((section) => (
              <li key={section.id}>
                <Link href={section.href} className={linkClass}>
                  {section.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 id="footer-contact" className="mb-2 text-lg">
            Get in touch
          </h2>
          <ul aria-labelledby="footer-contact" className="flex flex-wrap gap-x-6">
            {site.contactLinks.map((link) => (
              <li key={link.label}>
                <a href={link.href} className={linkClass}>
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <p className="container-page pb-8 text-sm text-ink-muted">© {site.name}</p>
    </footer>
  );
}
