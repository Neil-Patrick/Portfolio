"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import { sections } from "@/content/site";

/**
 * Radial navigation. A button opens a native modal <dialog> (focus trap, Escape,
 * inert page for free) with one item per entry in `sections`, laid out on a ring.
 * Arrow keys move around the ring; the center shows the highlighted item's name.
 */
export function WheelMenu() {
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const linkRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const dialogId = useId();
  const pathname = usePathname();

  const currentIndex = Math.max(
    0,
    sections.findIndex((s) => s.href === pathname),
  );

  // Keep React state in sync however the dialog closes (Escape, backdrop, link, button).
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const onClose = () => {
      setOpen(false);
      setHighlighted(null);
      triggerRef.current?.focus();
    };
    dialog.addEventListener("close", onClose);
    return () => dialog.removeEventListener("close", onClose);
  }, []);

  const openWheel = () => {
    dialogRef.current?.showModal();
    setOpen(true);
    // Start on the current page's item, like a game menu remembering your place.
    linkRefs.current[currentIndex]?.focus();
  };

  const closeWheel = () => dialogRef.current?.close();

  const onRingKeyDown = (event: KeyboardEvent<HTMLUListElement>) => {
    const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[event.key];
    if (!step) return;
    event.preventDefault();
    const links = linkRefs.current;
    const from = links.findIndex((link) => link === document.activeElement);
    const next = (Math.max(from, 0) + step + links.length) % links.length;
    links[next]?.focus();
  };

  const readout = highlighted ?? sections[currentIndex].label;

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={dialogId}
        onClick={openWheel}
        className="grid size-11 place-items-center rounded-full border border-line text-ink transition-colors hover:bg-surface"
      >
        <span className="sr-only">Open navigation</span>
        <WheelIcon />
      </button>

      <dialog
        ref={dialogRef}
        id={dialogId}
        aria-label="Navigation"
        // A click on the dialog itself (not its content) is a click on the backdrop area.
        onClick={(event) => event.target === event.currentTarget && closeWheel()}
        className="wheel-dialog fixed inset-0 m-0 size-full max-h-none max-w-none place-items-center overflow-hidden bg-canvas/90 p-0 text-ink backdrop:bg-transparent open:grid"
      >
        <div className="wheel-ring relative rounded-full border border-line">
          <nav aria-label="Primary">
            <ul onKeyDown={onRingKeyDown}>
              {sections.map((section, i) => {
                const current = i === currentIndex;
                return (
                  <li key={section.id}>
                    <Link
                      ref={(el) => {
                        linkRefs.current[i] = el;
                      }}
                      href={section.href}
                      aria-current={current ? "page" : undefined}
                      onClick={closeWheel}
                      onFocus={() => setHighlighted(section.label)}
                      onMouseEnter={() => setHighlighted(section.label)}
                      onMouseLeave={() => setHighlighted(null)}
                      style={{ "--i": i, "--count": sections.length } as CSSProperties}
                      className={`wheel-item absolute top-1/2 left-1/2 grid aspect-square place-items-center rounded-full border bg-surface p-1 text-center text-xs font-medium transition-colors duration-(--duration-fast) hover:bg-accent hover:text-on-accent focus-visible:bg-accent focus-visible:text-on-accent sm:text-sm ${
                        current ? "border-2 border-accent" : "border-line"
                      }`}
                    >
                      {section.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="absolute top-1/2 left-1/2 flex -translate-1/2 flex-col items-center gap-2">
            <p aria-hidden className="font-mono text-xs tracking-widest text-ink-muted uppercase">
              {readout}
            </p>
            <button
              type="button"
              onClick={closeWheel}
              className="grid size-12 place-items-center rounded-full border border-line bg-canvas transition-colors hover:bg-surface"
            >
              <span className="sr-only">Close navigation</span>
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
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
}

/** A ring with six nodes, hinting at the radial menu. */
function WheelIcon() {
  const nodes = Array.from({ length: 6 }, (_, i) => {
    const angle = (i * Math.PI) / 3 - Math.PI / 2;
    return { cx: 12 + 8 * Math.cos(angle), cy: 12 + 8 * Math.sin(angle) };
  });
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden focusable={false}>
      <circle cx={12} cy={12} r={8} strokeOpacity={0.4} />
      {nodes.map((n, i) => (
        <circle key={i} cx={n.cx.toFixed(2)} cy={n.cy.toFixed(2)} r={2} fill="currentColor" stroke="none" />
      ))}
    </svg>
  );
}
