"use client";

import { Check, Copy, Mail } from "lucide-react";
import { useEffect, useState } from "react";
import { getSection, site } from "@/content/site";
import { NEW_TAB_NOTE, linkTarget } from "@/lib/links";
import { ContactIcon, Icon } from "../icons";
import { DecodeText } from "../motion/DecodeText";
import { ArrowLink } from "../Section";

const { heading, lead } = site.collaborate;
const emailLink = site.contactLinks.find((link) => link.label === "Email")!;
const linkedIn = site.contactLinks.find((link) => link.label === "LinkedIn")!;
const address = emailLink.href.replace(/^mailto:/, "");
const contact = getSection("contact");

const secondary =
  "inline-flex min-h-11 items-center gap-2 border border-line-strong px-4 hud-label text-sm transition-colors hover:border-accent hover:text-accent";

/**
 * Home "Let's Build" section: one line on what I'm open to, then the ways to
 * reach me: email (or copy the address), LinkedIn, and the Contact page.
 */
export function Collaborate() {
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">("idle");

  // "Copied" turns back into "Copy Email" after a moment.
  useEffect(() => {
    if (copyState !== "copied") return;
    const timer = setTimeout(() => setCopyState("idle"), 2500);
    return () => clearTimeout(timer);
  }, [copyState]);

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(address);
      setCopyState("copied");
    } catch {
      setCopyState("failed");
    }
  };

  return (
    <section id="contact" aria-labelledby="contact-heading" className="py-12 sm:py-16">
      <div className="container-page">
        <div className="hud-corners border border-line bg-surface/70 px-4 py-10 backdrop-blur-sm sm:p-10 lg:p-14">
          <h2 id="contact-heading" className="font-display text-display font-bold">
            <DecodeText text={heading} inView />
          </h2>
          <p className="mt-4 max-w-prose text-lg text-ink-muted">{lead}</p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a
              href={emailLink.href}
              className="hud-notch inline-flex min-h-11 items-center gap-2 bg-accent px-6 py-2 hud-label text-base text-on-accent focus-visible:-outline-offset-4 focus-visible:outline-on-accent"
            >
              <Icon icon={Mail} />
              Email Me
            </a>
            <button type="button" onClick={copyEmail} className={secondary}>
              <Icon icon={copyState === "copied" ? Check : Copy} />
              {copyState === "copied" ? "Copied" : "Copy Email"}
            </button>
            <a href={linkedIn.href} {...linkTarget(linkedIn.href)} className={secondary}>
              <ContactIcon label={linkedIn.label} />
              {linkedIn.label}
              <span className="sr-only">{NEW_TAB_NOTE}</span>
            </a>
            <span className="sm:ml-auto">
              <ArrowLink href={contact.href} label={contact.cta} />
            </span>
          </div>

          <p role="status" data-testid="copy-status" className="mt-3 min-h-6 text-sm text-ink-muted">
            {copyState === "copied" && "Email address copied."}
            {copyState === "failed" && `Couldn't copy. The address is ${address}.`}
          </p>
        </div>
      </div>
    </section>
  );
}
