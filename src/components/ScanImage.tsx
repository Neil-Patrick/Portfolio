"use client";

import { useInView } from "motion/react";
import Image from "next/image";
import { useRef, useState } from "react";
import { cssVars } from "@/lib/css-vars";

/**
 * A project image with the "hologram scan" motion (globals.css, "Scan image").
 * The first time it scrolls into view it wipes in top-down behind a teal scan
 * line (`delay` staggers a row of them). When the nearest `.group` (a card
 * link, or the frame itself) is hovered or focused, the image zooms a touch, a
 * band sweeps across and faint scanlines show. It fills its parent, which sets
 * the size and frame. Under reduced motion it is simply shown, still.
 */
export function ScanImage({
  src,
  alt,
  sizes,
  delay = 0,
  priority = false,
}: {
  src: string;
  alt: string;
  sizes: string;
  delay?: number;
  priority?: boolean;
}) {
  const frame = useRef<HTMLSpanElement>(null);
  const inView = useInView(frame, { once: true, amount: 0.4 });
  // The wipe waits for the picture too, so the scan line never runs over an empty frame.
  const [loaded, setLoaded] = useState(false);
  const shown = inView && loaded;

  return (
    <span
      ref={frame}
      className="scan-image absolute inset-0 overflow-hidden"
      data-shown={shown || undefined}
      style={cssVars({ "--scan-delay": `${delay}ms` })}
    >
      <span className="scan-image-picture absolute inset-0">
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          // onLoad for a picture still loading; the ref for one that finished before hydration.
          onLoad={() => setLoaded(true)}
          ref={(img) => {
            if (img?.complete && img.naturalWidth > 0) setLoaded(true);
          }}
          className="object-cover"
        />
      </span>
      <span aria-hidden className="holo-scanlines scan-image-lines absolute inset-0" />
      <span aria-hidden className="scan-image-band pointer-events-none absolute inset-0" />
      <span aria-hidden className="scan-image-line reveal-scanline pointer-events-none absolute inset-x-0" />
    </span>
  );
}
