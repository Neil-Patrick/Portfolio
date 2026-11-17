"use client";

import { useEffect, useId, useRef, useState } from "react";
import { sections, site } from "@/content/site";
import { ThemeSwitcher } from "./ThemeSwitcher";

/**
 * Traditional top navbar. Links come from `sections` in src/content/site.ts,
 * so replacing this component with a different nav style touches nothing else.
 */
export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      buttonRef.current?.focus();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const navLinks = (listClassName: string, linkClassName: string) => (
    <ul className={listClassName}>
      {sections.map((section) => (
        <li key={section.id}>
          <a href={`#${section.id}`} className={linkClassName} onClick={() => setOpen(false)}>
            {section.label}
          </a>
        </li>
      ))}
    </ul>
  );

  return (
    <header className="sticky top-0 z-10 border-b border-line bg-canvas">
      <div className="container-page flex h-header items-center justify-between gap-4">
        <a href="#home" className="inline-flex min-h-11 items-center font-semibold">
          {site.name}
        </a>

        {/* Desktop */}
        <nav aria-label="Primary" className="hidden md:block">
          {navLinks(
            "flex items-center gap-1",
            "inline-flex min-h-11 items-center rounded-md px-3 text-ink-muted transition-colors hover:text-ink",
          )}
        </nav>
        <div className="hidden md:block">
          <ThemeSwitcher />
        </div>

        {/* Mobile toggle */}
        <button
          ref={buttonRef}
          type="button"
          aria-expanded={open}
          aria-controls={menuId}
          onClick={() => setOpen((value) => !value)}
          className="grid size-11 place-items-center rounded-md md:hidden"
        >
          <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
          <svg
            width={24}
            height={24}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            aria-hidden
            focusable={false}
          >
            {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>
      </div>

      {/* Mobile panel */}
      <div
        id={menuId}
        hidden={!open}
        className="max-h-[calc(100dvh-var(--spacing-header))] overflow-y-auto border-t border-line md:hidden"
      >
        <div className="container-page flex flex-col gap-4 py-4">
          <nav aria-label="Primary">
            {navLinks("flex flex-col", "flex min-h-11 items-center rounded-md px-3 hover:bg-surface")}
          </nav>
          <ThemeSwitcher />
        </div>
      </div>
    </header>
  );
}
