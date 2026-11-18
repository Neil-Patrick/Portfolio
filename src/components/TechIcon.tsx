import Image from "next/image";
import { databaseGlyph, techIcons } from "@/content/tech";

const SIZE = 18;

/**
 * Logo for a skill or tool, decorative (the name always sits next to it).
 * Color logos render as images; `mono` logos are drawn in the current text
 * color through a CSS mask so they stay visible in both themes. Names without
 * a logo get a neutral glyph so every chip lines up.
 */
export function TechIcon({ name }: { name: string }) {
  const icon = techIcons[name];

  if (!icon) {
    return (
      <svg
        width={SIZE}
        height={SIZE}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.75}
        strokeLinecap="round"
        aria-hidden
        focusable={false}
        data-tech-icon="fallback"
        className="shrink-0 text-ink-muted"
      >
        {databaseGlyph.has(name) ? (
          <>
            <ellipse cx="12" cy="6" rx="7" ry="3" />
            <path d="M5 6v12c0 1.7 3.1 3 7 3s7-1.3 7-3V6M5 12c0 1.7 3.1 3 7 3s7-1.3 7-3" />
          </>
        ) : (
          // Neutral "connected service" glyph: two linked nodes.
          <>
            <circle cx="7" cy="12" r="3" />
            <circle cx="17" cy="12" r="3" />
            <path d="M10 12h4" />
          </>
        )}
      </svg>
    );
  }

  if (icon.mono) {
    // Turbopack returns static .svg imports as a URL string; webpack returns an object.
    const url = typeof icon.src === "string" ? icon.src : icon.src.src;
    return (
      <span
        aria-hidden
        data-tech-icon="mono"
        className="block shrink-0 bg-current"
        style={{
          width: SIZE,
          height: SIZE,
          maskImage: `url(${url})`,
          maskSize: "contain",
          maskRepeat: "no-repeat",
          maskPosition: "center",
        }}
      />
    );
  }

  const image = (
    <Image
      src={icon.src}
      alt=""
      width={icon.darkBacking ? SIZE - 4 : SIZE}
      height={icon.darkBacking ? SIZE - 4 : SIZE}
      unoptimized
      data-tech-icon="color"
      className="shrink-0"
    />
  );

  // Dark logos sit on a light tile in dark mode (transparent in light mode).
  return icon.darkBacking ? (
    <span aria-hidden className="grid size-4.5 shrink-0 place-items-center rounded-xs bg-logo-backing">
      {image}
    </span>
  ) : (
    image
  );
}
