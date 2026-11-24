import { Database, Package } from "lucide-react";
import Image from "next/image";
import { databaseGlyph, techIcons } from "@/content/tech";

const SIZE = 18;

/**
 * Logo for a skill or tool, decorative (the name always sits next to it).
 * Color logos render as images; `mono` logos are drawn in the current text
 * color through a CSS mask so they stay visible in both themes. Names without
 * a logo get a neutral glyph so every chip lines up. `mono` draws any logo in
 * the text color, for places that need one ink (the footer).
 */
export function TechIcon({ name, mono = false }: { name: string; mono?: boolean }) {
  const icon = techIcons[name];

  if (!icon) {
    // No logo: a database glyph for SQL-like tools, a library glyph for anything else.
    const Glyph = databaseGlyph.has(name) ? Database : Package;
    return (
      <Glyph
        size={SIZE}
        strokeWidth={1.75}
        aria-hidden
        focusable={false}
        data-tech-icon="fallback"
        className="shrink-0 text-ink-muted"
      />
    );
  }

  if (icon.mono || mono) {
    // A color logo forced into one ink uses its cut-out variant, if it has one.
    const src = mono && icon.monoSrc ? icon.monoSrc : icon.src;
    // Turbopack returns static .svg imports as a URL string; webpack returns an object.
    const url = typeof src === "string" ? src : src.src;
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
