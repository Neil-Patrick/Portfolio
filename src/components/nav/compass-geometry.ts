/**
 * Geometry for the compass menu. Angles are in degrees, 0 = north (top),
 * growing clockwise, like a compass bearing.
 */

/** Bearing of item i when `count` items are spread evenly, starting at north. */
export function bearing(i: number, count: number) {
  return (i * 360) / count;
}

/** Offset from the center, as a percentage of the dial, for a bearing and radius (%). */
export function polar(bearingDeg: number, radius: number) {
  const rad = (bearingDeg * Math.PI) / 180;
  return { x: Math.sin(rad) * radius, y: -Math.cos(rad) * radius };
}

/** Bearing (0..360) of a point relative to the center (dx right, dy down). */
export function bearingOf(dx: number, dy: number) {
  return ((Math.atan2(dx, -dy) * 180) / Math.PI + 360) % 360;
}

/** Index of the item closest to a bearing. */
export function nearestIndex(bearingDeg: number, count: number) {
  return Math.round(bearingDeg / (360 / count)) % count;
}

/**
 * Next needle angle when aiming at `target` from `current`, taking the short
 * way round: the angle accumulates (e.g. 350 -> 370, not 350 -> 10), so the
 * needle never spins the long way.
 */
export function shortestTurn(current: number, target: number) {
  const delta = ((((target - current) % 360) + 540) % 360) - 180;
  return current + delta;
}
