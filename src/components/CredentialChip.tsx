import Image from "next/image";
import { badgeImage, formatMonth, type Certification } from "@/content/credentials";
import { NEW_TAB_NOTE, newTab } from "@/lib/links";

/**
 * A certification as a microchip, the same for every credential: a square die
 * framed by pins (`chip-pins`, globals.css) with the issuer, a big etched code,
 * the month, a pin-1 dot and a status LED; the name and issuer print under it.
 * Hovering or focusing the card lights the pins and LED teal and flips the die
 * in 3D to the real Credly badge (with reduced motion it swaps without the
 * spin). The whole card is the link to the Credly verification page.
 */
export function CredentialChip({ cert }: { cert: Certification }) {
  const image = badgeImage(cert);
  return (
    <a
      href={cert.url}
      {...newTab}
      data-chip
      className="group flex h-full flex-col gap-3 p-1 text-ink transition-colors focus-visible:outline-offset-4"
    >
      {/* Package: pins all round, the die inside. */}
      <span className="chip-pins block transition-colors group-hover:[--pin:var(--color-accent)] group-focus-visible:[--pin:var(--color-accent)]">
        <span className="relative block aspect-square perspective-near" data-badge-tile>
          <span className="relative block size-full transform-3d transition-transform duration-500 ease-out group-hover:rotate-y-180 group-focus-visible:rotate-y-180 motion-reduce:transition-none">
            {/* Front: the die. */}
            <span
              aria-hidden
              className="hud-corners absolute inset-0 flex flex-col justify-between border border-line-strong bg-surface p-2 backface-hidden sm:p-3"
            >
              <span className="flex items-start justify-between gap-2">
                <span className="hud-label min-w-0 truncate text-xs leading-none text-ink-muted">
                  {cert.issuer.split(/[ ,]/)[0]}
                </span>
                {/* Pin-1 marker. */}
                <span className="size-1.5 shrink-0 rounded-full bg-line-strong" />
              </span>
              <span className="font-display text-4xl leading-none font-bold tracking-wide sm:text-5xl">{cert.code}</span>
              <span className="flex items-center justify-between gap-2">
                <span className="hud-label text-xs leading-none text-accent tabular-nums">{formatMonth(cert.date)}</span>
                {/* Status LED: lights when the chip is aimed at. */}
                <span className="size-2 shrink-0 bg-line-strong transition-colors group-hover:bg-accent group-focus-visible:bg-accent" />
              </span>
            </span>
            {/* Back: the real badge. */}
            <span className="absolute inset-0 grid rotate-y-180 place-items-center border border-accent bg-surface p-3 backface-hidden">
              {image && (
                <Image
                  src={image}
                  alt={`${cert.name} badge`}
                  width={160}
                  height={160}
                  sizes="(min-width: 80rem) 12rem, (min-width: 40rem) 30vw, 45vw"
                  data-badge
                  className="size-full object-contain"
                />
              )}
            </span>
          </span>
        </span>
      </span>

      {/* Printed under the package. */}
      <span className="block px-1">
        <span className="block font-display text-lg leading-tight font-semibold transition-colors group-hover:text-accent">
          {cert.name}
        </span>
        <span className="mt-1 block text-sm text-ink-muted">{cert.issuer}</span>
      </span>
      <span className="sr-only">{NEW_TAB_NOTE}</span>
    </a>
  );
}
