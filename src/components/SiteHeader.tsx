"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { sections, site } from "@/content/site";
import { ThemeSwitcher } from "./ThemeSwitcher";

const pages = sections.filter((section) => section.href !== "/");

/**
 * Top bar: name (home link), page links, theme switcher. Below `lg` the links
 * and theme switcher move into a disclosure menu. Links come from `sections`
 * in src/content/site.ts.
 */
export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();

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

  const links = (listClassName: string, linkClassName: string) => (
    <ul className={listClassName}>
      {pages.map((page) => {
        const current = pathname === page.href;
        return (
          <li key={page.id}>
            <Link
              href={page.href}
              aria-current={current ? "page" : undefined}
              onClick={() => setOpen(false)}
              className={`${linkClassName} ${current ? "text-accent" : "text-ink-muted hover:text-ink"}`}
            >
              {page.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );

  return (
    <header className="sticky top-0 z-10 border-b border-line bg-surface">
      <div className="container-page flex h-header items-center justify-between gap-4">
        <Link href="/" className="inline-flex min-h-11 min-w-0 items-center font-semibold">
          <span className="truncate">{site.name}</span>
        </Link>

        {/* Desktop */}
        <div className="hidden items-center gap-6 lg:flex">
          <nav aria-label="Primary">
            {links("flex items-center gap-1", "inline-flex min-h-11 items-center px-3")}
          </nav>
          <ThemeSwitcher />
        </div>

        {/* Mobile toggle */}
        <button
          ref={buttonRef}
          type="button"
          aria-expanded={open}
          aria-controls={menuId}
          onClick={() => setOpen((value) => !value)}
          className="inline-flex min-h-11 items-center gap-2 rounded-sm border border-line-strong px-3 lg:hidden"
        >
          <svg
            width={20}
            height={20}
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
          Menu
        </button>
      </div>

      {/* Mobile panel */}
      <div
        id={menuId}
        hidden={!open}
        className="max-h-[calc(100dvh-var(--spacing-header))] overflow-y-auto border-t border-line lg:hidden"
      >
        <div className="container-page flex flex-col gap-4 py-4">
          <nav aria-label="Primary">{links("flex flex-col", "flex min-h-11 items-center")}</nav>
          <ThemeSwitcher />
        </div>
      </div>
    </header>
  );
}
