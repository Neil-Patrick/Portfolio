import type { Metadata } from "next";
import { ContactForm } from "@/components/ContactForm";
import { ContactIcon } from "@/components/icons";
import { Reveal, RevealItem } from "@/components/motion/Reveal";
import { SectionPage } from "@/components/SectionPage";
import { getSection, site } from "@/content/site";
import { NEW_TAB_NOTE, isExternal, linkTarget } from "@/lib/links";

const section = getSection("contact");

export const metadata: Metadata = { title: section.label };

/** Email is the main way to reach me, so it's the lead row (teal rail, large type); the rest are log rows. */
const [primary, ...others] = site.contactLinks;

/** Web3Forms' public access key (see README). Without it the form is left out and the links remain. */
const web3formsKey = process.env.NEXT_PUBLIC_WEB3FORMS_KEY;

export default function ContactPage() {
  return (
    <SectionPage section={section}>
      {web3formsKey && (
        <div className="mb-10">
          <ContactForm accessKey={web3formsKey} fallbackEmail={primary.text} />
        </div>
      )}

      <a
        href={primary.href}
        {...linkTarget(primary.href)}
        className="group hud-row hud-row-link mb-6 flex min-h-11 flex-col gap-1 !border-l-accent px-4 py-5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6 sm:px-6"
      >
        <span className="inline-flex items-center gap-3 hud-label text-xl">
          <ContactIcon label={primary.label} />
          {primary.label}
        </span>
        <span className="break-all font-display text-2xl font-bold sm:text-3xl">{primary.text}</span>
        {isExternal(primary.href) && <span className="sr-only">{NEW_TAB_NOTE}</span>}
      </a>

      <Reveal as="ul" className="grid gap-3 md:grid-cols-2">
        {others.map((link) => (
          <RevealItem as="li" from="left" key={link.label}>
            <a
              href={link.href}
              {...linkTarget(link.href)}
              className="hud-row hud-row-link flex min-h-11 flex-col gap-1 px-4 py-3 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4"
            >
              <span className="inline-flex items-center gap-2 hud-label text-lg">
                <ContactIcon label={link.label} />
                {link.label}
              </span>
              <span className="break-all text-ink-muted">{link.text}</span>
              {isExternal(link.href) && <span className="sr-only">{NEW_TAB_NOTE}</span>}
            </a>
          </RevealItem>
        ))}
      </Reveal>
    </SectionPage>
  );
}
