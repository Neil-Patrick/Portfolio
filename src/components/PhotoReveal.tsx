"use client";

import { useInView } from "motion/react";
import Image from "next/image";
import { useRef, useState } from "react";
import { site } from "@/content/site";
import { HoloCard } from "./HoloCard";
import { ProfilePhoto } from "./ProfilePhoto";

type Shown = "illustration" | "photo";

/**
 * The About portrait, in the hologram card: the illustrated portrait first,
 * then, once it is in view, a scan line sweeps down and resolves it into the
 * real photo (once). The portrait itself is the control: click, tap, Enter or
 * Space flips between the two, sweeping again each time. Hover or keyboard
 * focus runs a scan shimmer over it, glows the frame and shows the hint. The
 * look is CSS (globals.css, "Photo reveal" and "About portrait"), driven by
 * data-state; "initial" means not yet seen, which shows the illustration,
 * except under reduced motion, where the real photo is shown at once and every
 * flip is instant. Until a real photo is set, the labeled placeholder
 * (ProfilePhoto) stands in, without the card.
 */
export function PhotoReveal({ sizes }: { sizes: string }) {
  const frame = useRef<HTMLButtonElement>(null);
  const seen = useInView(frame, { once: true, amount: 0.6 });
  const [chosen, setChosen] = useState<Shown | null>(null);

  if (!site.photo) return <ProfilePhoto sizes={sizes} />;

  const state = chosen ?? (seen ? "photo" : "initial");
  // "initial" counts as the photo: by the time anyone reaches the portrait the
  // photo is showing or sweeping in (and under reduced motion it shows from the start).
  const showingPhoto = state !== "illustration";

  return (
    <HoloCard>
      <div data-photo-reveal data-state={state}>
        <button
          ref={frame}
          type="button"
          aria-label={showingPhoto ? "Show illustration" : "Show photo"}
          onClick={() => setChosen(showingPhoto ? "illustration" : "photo")}
          className="portrait-button hud-notch relative block aspect-square w-full overflow-hidden border border-line-strong bg-surface focus-visible:-outline-offset-4"
        >
          {/* Shown first and above the fold on the About page (its largest image), so it loads eagerly. */}
          <Image src={site.avatar.illustrated} alt={site.avatar.alt} fill sizes={sizes} priority className="object-cover" />
          <span className="reveal-photo absolute inset-0">
            <Image src={site.photo} alt={`Photo of ${site.name}`} fill sizes={sizes} className="object-cover" />
          </span>
          <span aria-hidden className="reveal-scanline pointer-events-none absolute inset-x-0" />
          <span aria-hidden className="portrait-shimmer pointer-events-none absolute inset-x-0" />
          <span
            aria-hidden
            className="portrait-hint pointer-events-none absolute inset-x-3 bottom-3 flex justify-center"
          >
            <span className="bg-canvas/80 px-2.5 py-1 hud-label text-xs text-accent backdrop-blur-sm">
              <span className="pointer-coarse:hidden">Click to switch</span>
              <span className="hidden pointer-coarse:inline">Tap to switch</span>
            </span>
          </span>
        </button>
      </div>
    </HoloCard>
  );
}
