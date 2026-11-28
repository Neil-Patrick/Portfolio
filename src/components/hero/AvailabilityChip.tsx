import { site } from "@/content/site";

/**
 * The landing's Open to Work status as a projected HUD chip (globals.css, "Open
 * to Work chip"): a translucent plate with scanlines and a dashed ring round a
 * pulsing dot. It links to the "Let's Build" call to action. Hover, keyboard
 * focus or a press brightens it, sweeps a band across, spins the ring faster,
 * jitters the label and slides out the detail line; the detail is always part
 * of the link's text, so nothing depends on hovering.
 */
export function AvailabilityChip() {
  return (
    <a
      href="#contact"
      className="holo-chip hud-notch hud-notch-edge relative inline-flex min-h-11 items-center gap-3 overflow-hidden py-2 pr-5 pl-3 focus-visible:-outline-offset-4"
      data-availability
    >
      <span aria-hidden className="holo-scanlines absolute inset-0" />
      <span aria-hidden className="holo-chip-sweep pointer-events-none absolute inset-0" />
      <span aria-hidden className="relative grid size-6 shrink-0 place-items-center">
        <svg viewBox="0 0 24 24" className="absolute inset-0 size-full overflow-visible">
          <circle cx={12} cy={12} r={10} className="holo-chip-ring fill-none stroke-accent" strokeWidth={1.5} strokeDasharray="4 3 10 3" />
          <circle cx={12} cy={12} r={6.5} className="fill-none stroke-accent/35" strokeWidth={1} />
        </svg>
        <span className="live-pulse size-2 rounded-full bg-accent" />
      </span>
      {/* Phones: the detail drops onto a second line instead of widening the chip past the screen. */}
      <span className="relative flex flex-col items-start sm:flex-row sm:items-center">
        <span className="holo-chip-label hud-label text-sm whitespace-nowrap text-accent">{site.availability}</span>
        <span className="holo-chip-detail text-sm text-ink">
          <span aria-hidden className="mx-2.5 hidden h-3.5 w-px translate-y-0.5 bg-accent/50 sm:inline-block" />
          {site.availabilityDetail}
        </span>
      </span>
    </a>
  );
}
