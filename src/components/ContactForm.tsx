"use client";

import { useId, useState, type FormEvent, type ReactNode } from "react";
import { ConsoleModule } from "./about/ConsoleModule";

const ENDPOINT = "https://api.web3forms.com/submit";

/** Limits shared by the inputs (maxLength) and the validation messages. */
const LIMITS = { name: 100, email: 254, messageMin: 10, messageMax: 5000 };

type Field = "name" | "email" | "message";
type Errors = Partial<Record<Field, string>>;
type Status = { kind: "idle" | "sending" | "sent" } | { kind: "error"; message: string };

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(values: Record<Field, string>): Errors {
  const errors: Errors = {};
  if (!values.name) errors.name = "Enter your name.";
  if (!values.email) errors.email = "Enter your email so I can reply.";
  else if (!EMAIL_PATTERN.test(values.email)) errors.email = "Enter an email like name@example.com.";
  if (!values.message) errors.message = "Write a message.";
  else if (values.message.length < LIMITS.messageMin)
    errors.message = `Write at least ${LIMITS.messageMin} characters.`;
  return errors;
}

const inputClass =
  "block min-h-11 w-full border border-line-strong bg-canvas px-3 py-2 text-ink transition-colors placeholder:text-ink-muted hover:border-accent focus-visible:border-accent aria-invalid:border-l-4 aria-invalid:border-l-ink";

/**
 * The Contact page's message form. It posts to Web3Forms, which emails the
 * message to Neil with the visitor's address as reply-to. With JavaScript it
 * validates and sends in place; without it, the form still posts natively and
 * Web3Forms shows its own confirmation page. `accessKey` is Web3Forms' public
 * key (it can only deliver to Neil's inbox), read from NEXT_PUBLIC_WEB3FORMS_KEY.
 */
export function ContactForm({ accessKey, fallbackEmail }: { accessKey: string; fallbackEmail: string }) {
  const id = useId();
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const values = {
      name: String(data.get("name") ?? "").trim(),
      email: String(data.get("email") ?? "").trim(),
      message: String(data.get("message") ?? "").trim(),
    };

    const found = validate(values);
    setErrors(found);
    const first = (Object.keys(found) as Field[])[0];
    if (first) {
      form.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      return;
    }

    setStatus({ kind: "sending" });
    try {
      const response = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          access_key: accessKey,
          ...values,
          subject: `Portfolio message from ${values.name}`,
          from_name: "Portfolio Contact Form",
          botcheck: data.get("botcheck") === "on",
        }),
      });
      const result = (await response.json().catch(() => null)) as { success?: boolean } | null;
      if (!response.ok || !result?.success) throw new Error("rejected");
      form.reset();
      setStatus({ kind: "sent" });
    } catch {
      setStatus({
        kind: "error",
        message: "The message didn't go through. Try again in a moment, or email me directly at",
      });
    }
  }

  const describedBy = (field: Field) => (errors[field] ? `${id}-${field}-error` : undefined);
  const sending = status.kind === "sending";

  return (
    <ConsoleModule title="Send a Message" status="Direct to Inbox">
      <form
        action={ENDPOINT}
        method="POST"
        noValidate
        onSubmit={onSubmit}
        aria-label="Send a message"
        className="grid gap-5 md:grid-cols-2"
      >
        <input type="hidden" name="access_key" value={accessKey} />
        <input type="hidden" name="subject" value="Portfolio message" />
        <input type="hidden" name="from_name" value="Portfolio Contact Form" />
        {/* Honeypot: people never see or reach it; bots that tick it are rejected by Web3Forms. */}
        <input
          type="checkbox"
          name="botcheck"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden
          className="absolute -left-[9999px] size-px opacity-0"
        />

        <FieldBox id={`${id}-name`} label="Name" error={errors.name}>
          <input
            id={`${id}-name`}
            name="name"
            type="text"
            required
            maxLength={LIMITS.name}
            autoComplete="name"
            aria-invalid={errors.name ? true : undefined}
            aria-describedby={describedBy("name")}
            className={inputClass}
          />
        </FieldBox>

        <FieldBox id={`${id}-email`} label="Email" error={errors.email}>
          <input
            id={`${id}-email`}
            name="email"
            type="email"
            required
            maxLength={LIMITS.email}
            autoComplete="email"
            inputMode="email"
            aria-invalid={errors.email ? true : undefined}
            aria-describedby={describedBy("email")}
            className={inputClass}
          />
        </FieldBox>

        <FieldBox id={`${id}-message`} label="Message" error={errors.message} wide>
          <textarea
            id={`${id}-message`}
            name="message"
            required
            rows={6}
            minLength={LIMITS.messageMin}
            maxLength={LIMITS.messageMax}
            aria-invalid={errors.message ? true : undefined}
            aria-describedby={describedBy("message")}
            className={`${inputClass} resize-y`}
          />
        </FieldBox>

        <div className="flex flex-col gap-4 md:col-span-2 sm:flex-row sm:items-center">
          <button
            type="submit"
            disabled={sending}
            className="hud-notch inline-flex min-h-11 items-center justify-center bg-accent px-6 py-2 pr-8 hud-label text-lg text-on-accent transition-opacity focus-visible:-outline-offset-4 focus-visible:outline-on-accent disabled:opacity-70"
          >
            {sending ? "Transmitting…" : "Send Message"}
          </button>

          <p role="status" aria-live="polite" data-testid="contact-status" className="min-w-0 text-sm">
            {status.kind === "sent" && (
              <span className="text-accent">Message sent. I&apos;ll reply to the email you gave.</span>
            )}
            {status.kind === "error" && (
              <span className="block border-l-4 border-ink pl-3 text-ink">
                {status.message}{" "}
                <a href={`mailto:${fallbackEmail}`} className="break-all text-accent underline underline-offset-4 hover:no-underline">
                  {fallbackEmail}
                </a>
                .
              </span>
            )}
          </p>
        </div>
      </form>
    </ConsoleModule>
  );
}

function FieldBox({
  id,
  label,
  error,
  wide = false,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  wide?: boolean;
  children: ReactNode;
}) {
  return (
    <div className={wide ? "md:col-span-2" : undefined}>
      <label htmlFor={id} className="mb-2 block hud-label text-sm text-ink">
        {label}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} className="mt-2 text-sm text-ink">
          <span aria-hidden className="mr-1 text-accent">!</span>
          {error}
        </p>
      )}
    </div>
  );
}
