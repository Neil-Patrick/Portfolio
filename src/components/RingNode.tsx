import Image from "next/image";

type Props = {
  /** Badge art (a GitHub achievement). */
  image?: string;
  /** Alt text for the art; empty when the surrounding control already names it. */
  alt: string;
  /** Short code shown when there's no image. */
  code?: string;
  className?: string;
};

/**
 * A badge in a circle, the site's node shape (credential emblems, GitHub
 * achievements, the scroll rail, back to top, the education trace). A ring
 * holds the art; it turns teal and glows when its link (the nearest `group`)
 * is hovered or focused.
 */
export function RingNode({ image, alt, code, className = "size-16" }: Props) {
  return (
    <span className={`relative grid shrink-0 place-items-center rounded-full border border-line-strong bg-surface transition-[border-color,box-shadow] duration-300 group-hover:border-accent group-hover:shadow-[0_0_12px_color-mix(in_oklab,var(--color-accent)_35%,transparent)] group-focus-visible:border-accent ${className}`} data-badge-tile>
      {image ? (
        <Image src={image} alt={alt} width={64} height={64} sizes="64px" data-badge className="size-[70%] object-contain" />
      ) : (
        <span aria-hidden className="font-display text-xl font-bold">
          {code}
        </span>
      )}
    </span>
  );
}

/**
 * A small circle marker (scroll rail, depth gauge, education trace): a teal
 * ring on the canvas, optionally with a filled core. Decorative.
 */
export function RingMark({ className = "size-3", core = false, filled = false }: { className?: string; core?: boolean; filled?: boolean }) {
  return (
    <svg aria-hidden viewBox="0 0 100 100" className={`block overflow-visible ${className}`}>
      <circle cx="50" cy="50" r="45" vectorEffect="non-scaling-stroke" strokeWidth={1.5} className={`stroke-accent transition-colors ${filled ? "fill-accent" : "fill-canvas"}`} />
      {core && <circle cx="50" cy="50" r="18" className="fill-accent" />}
    </svg>
  );
}
