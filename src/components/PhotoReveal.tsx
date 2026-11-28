"use client";

import { ScanLine } from "lucide-react";
import { useInView } from "motion/react";
import Image from "next/image";
import { useRef, useState } from "react";
import { site } from "@/content/site";
import { Icon } from "./icons";
import { ProfilePhoto } from "./ProfilePhoto";

type Shown = "illustration" | "photo";

/**
 * The About photo: the illustrated portrait first, then, once it is in view, a
 * scan line sweeps down and resolves it into the real photo (once). A button
 * under it flips between the two, sweeping again each time. The look is CSS
 * (globals.css, "Photo reveal"), driven by data-state; "initial" means not yet
 * seen, which shows the illustration, except under reduced motion, where the
 * real photo is shown at once and every flip is instant. Until a real photo is
 * set, the labeled placeholder (ProfilePhoto) stands in.
 */
export function PhotoReveal({ sizes }: { sizes: string }) {
  const frame = useRef<HTMLDivElement>(null);
  const seen = useInView(frame, { once: true, amount: 0.6 });
  const [chosen, setChosen] = useState<Shown | null>(null);

  if (!site.photo) return <ProfilePhoto sizes={sizes} />;

  const state = chosen ?? (seen ? "photo" : "initial");
  // "initial" counts as the photo for the button: by the time anyone reaches the button the
  // photo is showing or sweeping in (and under reduced motion it shows from the start).
  const showingPhoto = state !== "illustration";

  return (
    <div data-photo-reveal data-state={state}>
      <div ref={frame} className="hud-notch relative aspect-square w-full overflow-hidden border border-line-strong bg-surface">
        {/* Shown first and above the fold on the About page (its largest image), so it loads eagerly. */}
        <Image src={site.avatar.illustrated} alt={site.avatar.alt} fill sizes={sizes} priority className="object-cover" />
        <div className="reveal-photo absolute inset-0">
          <Image src={site.photo} alt={`Photo of ${site.name}`} fill sizes={sizes} className="object-cover" />
        </div>
        <div aria-hidden className="reveal-scanline pointer-events-none absolute inset-x-0" />
      </div>
      <button
        type="button"
        onClick={() => setChosen(showingPhoto ? "illustration" : "photo")}
        className="mt-2 inline-flex min-h-11 items-center gap-2 text-accent"
      >
        <Icon icon={ScanLine} />
        {showingPhoto ? "Show Illustration" : "Show Photo"}
      </button>
    </div>
  );
}
