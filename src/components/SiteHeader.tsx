"use client";

import { Menu, X } from "lucide-react";
import { useMotionValueEvent, useScroll } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { sections, site } from "@/content/site";
import { Icon, SectionIcon } from "./icons";
import { ThemeSwitcher } from "./ThemeSwitcher";

const pages = sections.filter((section) => section.href !== "/");

/**
 * Top bar: name (home link), page links, theme switcher. Below `lg` the links
 * and theme switcher move into a disclosure menu. Links come from `sections`
 * in src/content/site.ts. Transparent with no line at the top of the page, so the
 * home hero runs edge to edge; once scrolled it becomes a blurred surface.
 */
export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, "change", (y) => setScrolled(y > 8));

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

  // iconClassName: the desktop bar hides icons below xl so the name never truncates.
  const links = (listClassName: string, linkClassName: string, iconClassName = "") => (
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
              <SectionIcon id={page.id} className={iconClassName} />
              {page.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );

  return (
    <header
      className={`sticky top-0 z-20 transition-colors duration-300 ${
        scrolled || open ? "bg-surface/85 backdrop-blur-md" : "bg-transparent"
      }`}
    >
      <div className="container-page flex h-header items-center justify-between gap-4">
        <Link href="/" className="inline-flex min-h-11 min-w-0 items-center font-semibold">
          <span className="truncate">{site.name}</span>
        </Link>

        {/* Desktop */}
        <div className="hidden items-center gap-6 lg:flex">
          <nav aria-label="Primary">
            {links("flex items-center gap-1", "inline-flex min-h-11 items-center gap-2 px-3", "hidden xl:block")}
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
          <Icon icon={open ? X : Menu} size={20} />
          Menu
        </button>
      </div>

      {/* Mobile panel */}
      <div
        id={menuId}
        hidden={!open}
        className="max-h-[calc(100dvh-var(--spacing-header))] overflow-y-auto bg-surface lg:hidden"
      >
        <div className="container-page flex flex-col gap-4 py-4">
          <nav aria-label="Primary">{links("flex flex-col", "flex min-h-11 items-center gap-3")}</nav>
          <ThemeSwitcher />
        </div>
      </div>
    </header>
  );
}
