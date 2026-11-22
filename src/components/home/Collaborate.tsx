"use client";

import { Check, Copy, Mail } from "lucide-react";
import { useEffect, useState, type ChangeEvent } from "react";
import { getSection, site } from "@/content/site";
import { NEW_TAB_NOTE, linkTarget } from "@/lib/links";
import { ContactIcon, Icon } from "../icons";
import { DecodeText } from "../motion/DecodeText";
import { ArrowLink } from "../Section";

const { heading, lead, reasons, focuses, defaultSubject, defaultOutline } = site.collaborate;
const emailLink = site.contactLinks.find((link) => link.label === "Email")!;
const linkedIn = site.contactLinks.find((link) => link.label === "LinkedIn")!;
const address = emailLink.href.replace(/^mailto:/, "");
const contact = getSection("contact");

/**
 * Subject, body, and mailto link for the brief, from the visitor's picks.
 * Focus areas keep their listed order. Lines use CRLF, as mailto bodies expect.
 */
function composeBrief(reasonId: string | null, picked: string[]) {
  const reason = reasons.find((r) => r.id === reasonId);
  const focus = focuses.filter((f) => picked.includes(f));
  const subject = `${reason?.subject ?? defaultSubject}${focus.length ? `: ${focus.join(", ")}` : ""}`;
  const body = [
    "Hi Neil,",
    "",
    ...(reason ? [`I'm reaching out about: ${reason.label}`] : []),
    ...(focus.length ? [`Focus: ${focus.join(", ")}`] : []),
    ...(reason || focus.length ? [""] : []),
    ...(reason?.outline ?? defaultOutline),
    "",
  ].join("\r\n");
  const href = `mailto:${address}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  return { subject, body, href };
}

/** A HUD chip that is really a native radio or checkbox (keyboard and screen-reader friendly). */
function Chip({
  type,
  name,
  label,
  checked,
  onChange,
}: {
  type: "radio" | "checkbox";
  name: string;
  label: string;
  checked: boolean;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <label
      className={`relative inline-flex min-h-11 cursor-pointer items-center overflow-hidden border px-4 hud-label text-sm transition-colors has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-focus ${
        checked ? "border-accent text-on-accent" : "border-line-strong text-ink hover:border-accent hover:text-accent"
      }`}
    >
      <input type={type} name={name} checked={checked} onChange={onChange} className="sr-only" />
      {/* A picked chip fills teal from the left, like the compass tags. */}
      {checked && <span aria-hidden className="hud-wipe absolute inset-0 bg-accent" />}
      <span className="relative">{label}</span>
    </label>
  );
}

/**
 * Home "Let's Build" section: a short pitch and a project brief builder.
 * Visitors pick why they're reaching out and what it's about; "Email the
 * Brief" opens their email app with a ready subject and outline. Nothing is
 * sent from the site, so there is no backend. Without JavaScript the button
 * is still a plain email link.
 */
export function Collaborate() {
  const [reason, setReason] = useState<string | null>(null);
  const [picked, setPicked] = useState<string[]>([]);
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">("idle");
  const brief = composeBrief(reason, picked);

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

  const toggleFocus = (focus: string) =>
    setPicked((current) => (current.includes(focus) ? current.filter((f) => f !== focus) : [...current, focus]));

  return (
    <section id="contact" aria-labelledby="contact-heading" className="py-12 sm:py-16">
      <div className="container-page">
        <div className="hud-corners grid gap-10 border border-line bg-surface/70 px-4 py-10 backdrop-blur-sm sm:p-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16 lg:p-14">
          <div>
            <h2 id="contact-heading" className="font-display text-display font-bold">
              <DecodeText text={heading} inView />
            </h2>
            <p className="mt-4 max-w-prose text-lg text-ink-muted">{lead}</p>
          </div>

          <div className="grid gap-6">
            <fieldset>
              <legend className="mb-3 hud-label text-sm text-ink-muted">I&apos;m Reaching Out About</legend>
              <div className="flex flex-wrap gap-2">
                {reasons.map((r) => (
                  <Chip
                    key={r.id}
                    type="radio"
                    name="brief-reason"
                    label={r.label}
                    checked={reason === r.id}
                    onChange={() => setReason(r.id)}
                  />
                ))}
              </div>
            </fieldset>

            <fieldset>
              <legend className="mb-3 hud-label text-sm text-ink-muted">Focus</legend>
              <div className="flex flex-wrap gap-2">
                {focuses.map((focus) => (
                  <Chip
                    key={focus}
                    type="checkbox"
                    name="brief-focus"
                    label={focus}
                    checked={picked.includes(focus)}
                    onChange={() => toggleFocus(focus)}
                  />
                ))}
              </div>
            </fieldset>

            {/* Shows exactly what the email will be titled. */}
            <p className="text-ink-muted">
              <span className="hud-label text-sm">Subject: </span>
              <span data-testid="brief-subject" className="text-ink">
                {brief.subject}
              </span>
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <a
                href={brief.href}
                className="hud-notch inline-flex min-h-11 items-center gap-2 bg-accent px-6 py-2 hud-label text-base text-on-accent focus-visible:-outline-offset-4 focus-visible:outline-on-accent"
              >
                <Icon icon={Mail} />
                Email the Brief
              </a>
              <button
                type="button"
                onClick={copyEmail}
                className="inline-flex min-h-11 items-center gap-2 border border-line-strong px-4 hud-label text-sm transition-colors hover:border-accent hover:text-accent"
              >
                <Icon icon={copyState === "copied" ? Check : Copy} />
                {copyState === "copied" ? "Copied" : "Copy Email"}
              </button>
              <a
                href={linkedIn.href}
                {...linkTarget(linkedIn.href)}
                className="inline-flex min-h-11 items-center gap-2 border border-line-strong px-4 hud-label text-sm transition-colors hover:border-accent hover:text-accent"
              >
                <ContactIcon label={linkedIn.label} />
                {linkedIn.label}
                <span className="sr-only">{NEW_TAB_NOTE}</span>
              </a>
              <span className="sm:ml-auto">
                <ArrowLink href={contact.href} label={contact.cta} />
              </span>
            </div>

            <p className="text-sm text-ink-muted">
              &ldquo;Email the Brief&rdquo; opens your email app.{" "}
              <span role="status" data-testid="copy-status">
                {copyState === "copied" && "Email address copied."}
                {copyState === "failed" && `Couldn't copy. The address is ${address}.`}
              </span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
