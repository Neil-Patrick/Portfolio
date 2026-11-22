import Image from "next/image";

type Props = {
  /** Short issuer name, shown small at the top (e.g. "IBM", "Certiport", "GitHub"). */
  issuer: string;
  /** Short code shown big in the middle. */
  code: string;
  /** Month earned, shown at the bottom of large tiles (e.g. "Nov 2026"). */
  date?: string;
  /** The real badge art, on the back. */
  image?: string;
  /** Alt text for the real badge. */
  alt: string;
  size?: "sm" | "lg";
};

/**
 * A credential or achievement as a HUD tile: issuer, a big short code, and a
 * teal notched corner. Hovering or focusing its link (the nearest `group`)
 * flips it in 3D to the real badge art on the back; with reduced motion it
 * swaps without the spin. The tile's text is decorative: the link around it
 * carries the full name.
 */
export function BadgeTile({ issuer, code, date, image, alt, size = "sm" }: Props) {
  const large = size === "lg";
  const px = large ? 112 : 80;
  return (
    <span className={`relative block shrink-0 perspective-near ${large ? "size-28" : "size-20"}`} data-badge-tile>
      <span className="relative block size-full transform-3d transition-transform duration-500 ease-out group-hover:rotate-y-180 group-focus-visible:rotate-y-180 motion-reduce:transition-none">
        {/* Front: issuer, code, and (large tiles) the month. */}
        <span
          aria-hidden
          className="hud-corners absolute inset-0 flex flex-col justify-between overflow-hidden border border-line-strong bg-canvas p-2 text-ink backface-hidden"
        >
          <span className={`absolute top-0 right-0 corner-fold bg-accent ${large ? "size-5" : "size-3.5"}`} />
          <span className="hud-label text-xs leading-none text-ink-muted">{issuer}</span>
          <span className={`font-display leading-none font-bold ${large ? "text-5xl" : "text-3xl"}`}>{code}</span>
          {large && date ? (
            <span className="hud-label text-xs leading-none text-accent tabular-nums">{date}</span>
          ) : (
            <span className="h-0.5 w-6 bg-accent" />
          )}
        </span>
        {/* Back: the real badge art. */}
        <span className="absolute inset-0 grid rotate-y-180 place-items-center border border-line-strong bg-canvas p-1.5 backface-hidden">
          {image && (
            <Image src={image} alt={alt} width={px} height={px} sizes={`${px}px`} data-badge className="size-full object-contain" />
          )}
        </span>
      </span>
    </span>
  );
}
