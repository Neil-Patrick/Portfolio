/**
 * The site background's "signal lines": shared math for the animated scene
 * (WaveLines) and the static version (WaveFallback), so both draw the same
 * curves.
 *
 * Kept deliberately quiet: a few hairlines, low opacity, very slow drift.
 * Units are CSS pixels; y grows downward from the top of the screen.
 */

/** Full on Home; calm (fewer, dimmer lines and pulses) behind the reading pages. */
export type Intensity = "full" | "calm";

/** Which waves draw, and how bright, at each intensity. */
export const INTENSITY: Record<Intensity, { lines: number; opacity: number; pulses: number[] }> = {
  full: { lines: 6, opacity: 1, pulses: [0, 2, 4] },
  calm: { lines: 4, opacity: 0.6, pulses: [1] },
};

export type Wave = {
  /** Resting height, as a share of the screen height (0 = top, 1 = bottom). */
  base: number;
  /** Two summed sine waves per line: amplitude (px), wavelength (px), speed (radians per second). */
  a1: number;
  l1: number;
  s1: number;
  a2: number;
  l2: number;
  s2: number;
  /** Line opacity: nearer the bottom, fainter. */
  opacity: number;
};

export const WAVES: Wave[] = Array.from({ length: 6 }, (_, i) => ({
  base: 0.52 + i * 0.07,
  a1: 16 + i * 5,
  l1: 900 + i * 140,
  s1: 0.13 + i * 0.02, // one cycle every ~25-50 s
  a2: 6 + i * 2,
  l2: 380 + i * 70,
  s2: -(0.07 + i * 0.015),
  opacity: 0.5 - i * 0.05,
}));

/** Points per line: smooth at any width, still cheap to update every frame. */
export const SEGMENTS = 160;

/**
 * Height of one wave at horizontal position x (px) and time t (s).
 * `shift` (radians) lets scrolling nudge the phase a little.
 */
export function waveY(wave: Wave, x: number, t: number, height: number, shift = 0) {
  const tau = Math.PI * 2;
  return (
    wave.base * height +
    wave.a1 * Math.sin((x / wave.l1) * tau + t * wave.s1 + shift) +
    wave.a2 * Math.sin((x / wave.l2) * tau + t * wave.s2 - shift * 0.6)
  );
}
