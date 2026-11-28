import { cssVars } from "@/lib/css-vars";

/**
 * The NP mark's letter shapes (public/brand/np-mark-white.svg, viewBox 80 120 352 272),
 * as paths so each can trace and ignite on its own, in reading order.
 */
const LETTERS = [
  { id: "n-left", d: "M96,164 L124,136 L152,136 L152,376 L96,376 Z" },
  { id: "n-diagonal", d: "M106.5,153.5 L124,136 L152,136 L296,376 L240,376 Z" },
  { id: "n-right", d: "M240,136 H296 V376 H240 Z" },
  { id: "p", d: "M296,136 H384 L416,168 V248 L384,280 H296 Z M296,192 H360 V224 H296 Z" },
];
/** When each letter starts tracing, in ms from page load: act 2 of the loader's CSS timeline, after the data has gone. */
const TRACE_DELAYS = [3150, 3280, 3410, 3540];
const VIEW_BOX = "80 120 352 272";
const SPARKLE = "M0,-1 Q0,0 1,0 Q0,0 0,1 Q0,0 -1,0 Q0,0 0,-1 Z";

/** The four letters, filled in the current colour. */
const solid = (
  <g fillRule="evenodd">
    {LETTERS.map((letter) => (
      <path key={letter.id} d={letter.d} />
    ))}
  </g>
);

/**
 * The loading screen's NP logo (globals.css, "Loading screen"): each letter's
 * outline traces in teal, one after another, then the letter ignites solid
 * with a flicker and its outline dims to a glow; two sliced copies glitch over
 * it as it settles; faint scanlines run over
 * the shape; last, the sparkle spins in with a flash ring and keeps pulsing.
 * Centred and enlarged on its own in the loader's second act, then it blinks
 * out before the screen powers off. Decorative, like the rest of the overlay.
 */
export function IntroLogo() {
  return (
    <div className="intro-logo intro-logo-stage relative h-intro-logo w-fit" data-intro-logo>
      <svg viewBox={VIEW_BOX} className="relative h-full w-auto overflow-visible">
        {/* Solid letters, igniting after their trace. */}
        <g className="intro-logo-fill fill-ink" fillRule="evenodd">
          {LETTERS.map((letter, i) => (
            <path key={letter.id} d={letter.d} style={cssVars({ "--trace-delay": `${TRACE_DELAYS[i]}ms` })} />
          ))}
        </g>
        {/* Outlines, tracing in one after another. pathLength 1 (and no non-scaling-stroke) so the dash is a true share. */}
        <g className="intro-logo-outline fill-none stroke-accent" strokeWidth={3} strokeLinejoin="miter">
          {LETTERS.map((letter, i) => (
            <path
              key={letter.id}
              d={letter.d}
              pathLength={1}
              data-letter={letter.id}
              style={cssVars({ "--trace-delay": `${TRACE_DELAYS[i]}ms` })}
            />
          ))}
        </g>
        {/* The sparkle, last: a flash ring, then the star spinning in and pulsing. */}
        <g transform="translate(376,336)" data-sparkle>
          <circle r={30} className="intro-spark-ring fill-none stroke-accent" strokeWidth={2} />
          <g className="intro-sparkle-star">
            <path d={SPARKLE} transform="scale(34)" className="fill-accent" />
          </g>
        </g>
      </svg>

      {/* Faint scanlines clipped to the logo's shape. */}
      <div aria-hidden className="intro-logo-scan pointer-events-none absolute inset-0" />

      {/* Two sliced, offset copies that glitch over it. */}
      <svg aria-hidden viewBox={VIEW_BOX} className="intro-logo-glitch intro-logo-glitch-a absolute inset-0 size-full overflow-visible">
        <g className="fill-current">{solid}</g>
      </svg>
      <svg aria-hidden viewBox={VIEW_BOX} className="intro-logo-glitch intro-logo-glitch-b absolute inset-0 size-full overflow-visible">
        <g className="fill-current">{solid}</g>
      </svg>
    </div>
  );
}
