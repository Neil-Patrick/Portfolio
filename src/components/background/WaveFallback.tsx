import { SEGMENTS, WAVES, waveY } from "./waves";

/**
 * The wave lines frozen in place, drawn as SVG. Shown before the animated
 * scene loads, when WebGL is unavailable, and on its own with reduced motion.
 */

const W = 1440;
const H = 900;

const paths = WAVES.map((wave) => {
  let d = "";
  for (let s = 0; s <= SEGMENTS; s++) {
    const x = (s / SEGMENTS) * W;
    d += `${s === 0 ? "M" : "L"}${x.toFixed(1)} ${waveY(wave, x, 0, H).toFixed(1)}`;
  }
  return { d, opacity: wave.opacity };
});

export function WaveFallback() {
  return (
    <svg
      aria-hidden
      data-bg-fallback="waves"
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      className="absolute inset-0 size-full"
    >
      {paths.map((path, i) => (
        <path
          key={i}
          d={path.d}
          fill="none"
          className="stroke-accent"
          strokeWidth={1}
          vectorEffect="non-scaling-stroke"
          opacity={path.opacity}
        />
      ))}
    </svg>
  );
}
