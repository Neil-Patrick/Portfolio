/**
 * Compass rose in the spirit of a fantasy-game menu: four long beveled points
 * (north is the accent-colored needle), short diagonal points, and a knotted
 * center. Decorative; used large in the menu and small as its trigger icon.
 * Colors come from the text color (currentColor) and the accent token.
 */

/** One beveled point: a lit half and a shaded half, like the menu compasses in games. */
function Point({ length, width, rotate, accent = false }: { length: number; width: number; rotate: number; accent?: boolean }) {
  return (
    <g transform={`rotate(${rotate})`} className={accent ? "fill-accent" : "fill-current"}>
      <path d={`M0 ${-length} L${width} -3 L0 0 Z`} />
      <path d={`M0 ${-length} L${-width} -3 L0 0 Z`} opacity={0.55} />
    </g>
  );
}

export function CompassRose({ className = "", size }: { className?: string; size?: number }) {
  return (
    <svg
      aria-hidden
      focusable={false}
      viewBox="-50 -50 100 100"
      width={size}
      height={size}
      className={className}
    >
      {/* Diagonal points, short and faint, behind the main ones. */}
      {[45, 135, 225, 315].map((angle) => (
        <g key={angle} opacity={0.5}>
          <Point length={20} width={3} rotate={angle} />
        </g>
      ))}
      {/* Cardinal points; north is the needle. */}
      <Point length={48} width={5.5} rotate={0} accent />
      <Point length={34} width={5} rotate={90} />
      <Point length={34} width={5} rotate={180} />
      <Point length={34} width={5} rotate={270} />
      {/* Knotted center: interlaced loops inside a ring. */}
      <g fill="none" className="stroke-current" strokeWidth={1.6}>
        <circle r={9} />
        {[0, 90, 180, 270].map((angle) => (
          <circle key={angle} r={4.2} transform={`rotate(${angle}) translate(0 -4.5)`} />
        ))}
      </g>
    </svg>
  );
}
