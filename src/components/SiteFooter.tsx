import Link from "next/link";
import { sections, site } from "@/content/site";
import { NEW_TAB_NOTE, isExternal, linkTarget } from "@/lib/links";
import { ContactIcon, SectionIcon } from "./icons";

const linkClass = "inline-flex min-h-11 items-center gap-2 text-ink-muted hover:text-ink hover:underline";

/** Plain page links and contact links on every page. */
export function SiteFooter() {
  return (
    <footer className="mt-12 border-t border-line">
      <div className="container-page grid gap-8 py-10 sm:grid-cols-2">
        <nav aria-labelledby="footer-pages">
          <h2 id="footer-pages" className="mb-2 text-base">
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
          <h2 id="footer-contact" className="mb-2 text-base">
            Get in Touch
          </h2>
          <ul aria-labelledby="footer-contact" className="flex flex-wrap gap-x-6">
            {site.contactLinks.map((link) => (
              <li key={link.label}>
                <a href={link.href} {...linkTarget(link.href)} className={linkClass}>
                  <ContactIcon label={link.label} />
                  {link.label}
                  {isExternal(link.href) && <span className="sr-only">{NEW_TAB_NOTE}</span>}
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
