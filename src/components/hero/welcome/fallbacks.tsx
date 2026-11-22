import { CompassRose } from "@/components/nav/CompassRose";
import type { WelcomeKind } from "./kinds";

/**
 * Still versions of the 3D welcome scenes, drawn roughly in each scene's rest
 * pose (world units map to about 16 SVG units, the scene's camera framing).
 * Shown before the 3D loads, without WebGL, and on their own with reduced motion.
 */

const ring = "fill-none stroke-accent";

function CompassStill() {
  return (
    <div className="absolute inset-0 grid place-items-center text-ink-muted">
      <svg
        aria-hidden
        viewBox="0 0 100 100"
        className="absolute inset-0 size-full overflow-visible"
      >
        <ellipse
          cx={50}
          cy={50}
          rx={43.7}
          ry={16.6}
          className={ring}
          strokeOpacity={0.45}
          vectorEffect="non-scaling-stroke"
        />
        <ellipse
          cx={50}
          cy={50}
          rx={45}
          ry={16.5}
          transform="rotate(-8 50 50)"
          className={ring}
          strokeOpacity={0.35}
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <CompassRose className="relative w-7/10" />
    </div>
  );
}

function GyroscopeStill() {
  const hexagon = Array.from({ length: 6 }, (_, i) => {
    const a = (Math.PI / 3) * i + Math.PI / 6;
    return `${50 + Math.cos(a) * 11.5},${50 + Math.sin(a) * 11.5}`;
  }).join(" ");
  return (
    <svg
      aria-hidden
      viewBox="0 0 100 100"
      className="absolute inset-0 size-full overflow-visible"
    >
      <line
        x1={50}
        y1={1.5}
        x2={50}
        y2={98.5}
        className="stroke-accent"
        strokeOpacity={0.45}
        vectorEffect="non-scaling-stroke"
      />
      <ellipse
        cx={50}
        cy={50}
        rx={42}
        ry={9}
        transform="rotate(12 50 50)"
        className={ring}
        strokeOpacity={0.6}
        vectorEffect="non-scaling-stroke"
      />
      <ellipse
        cx={50}
        cy={50}
        rx={36}
        ry={30}
        transform="rotate(-35 50 50)"
        className={ring}
        strokeOpacity={0.5}
        vectorEffect="non-scaling-stroke"
      />
      <ellipse
        cx={50}
        cy={50}
        rx={30}
        ry={14}
        transform="rotate(55 50 50)"
        className={ring}
        strokeOpacity={0.5}
        vectorEffect="non-scaling-stroke"
      />
      <ellipse
        cx={50}
        cy={50}
        rx={23}
        ry={17}
        transform="rotate(-70 50 50)"
        className={ring}
        strokeOpacity={0.45}
        vectorEffect="non-scaling-stroke"
      />
      <polygon
        points={hexagon}
        className={ring}
        strokeOpacity={0.85}
        vectorEffect="non-scaling-stroke"
      />
      <circle
        cx={50}
        cy={50}
        r={6.5}
        className="fill-accent"
        fillOpacity={0.25}
      />
    </svg>
  );
}

function MonolithStill() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 100 100"
      className="absolute inset-0 size-full overflow-visible"
    >
      {/* Same 1.15 scale as the 3D monolith. */}
      <g transform="translate(50 50) scale(1.15) translate(-50 -50)">
        <ellipse
          cx={50}
          cy={78.5}
          rx={21}
          ry={4.2}
          className={ring}
          strokeOpacity={0.35}
          vectorEffect="non-scaling-stroke"
        />
        <ellipse
          cx={50}
          cy={78.5}
          rx={15}
          ry={3}
          className={ring}
          strokeOpacity={0.55}
          vectorEffect="non-scaling-stroke"
        />
        {/* Front face and a sliver of the right side. */}
        <polygon
          points="39.5,26 60.5,26 60.5,74 39.5,74"
          className="fill-surface stroke-accent"
          strokeOpacity={0.8}
          vectorEffect="non-scaling-stroke"
        />
        <polygon
          points="60.5,26 64,24.5 64,72.5 60.5,74"
          className="fill-surface stroke-accent"
          strokeOpacity={0.6}
          vectorEffect="non-scaling-stroke"
        />
        <g className="fill-none stroke-accent" strokeOpacity={0.55}>
          <polyline
            points="43,74 43,64 45,64 45,52 43,52 43,40"
            vectorEffect="non-scaling-stroke"
          />
          <polyline
            points="48,74 48,58 51,58 51,46 53,46 53,31"
            vectorEffect="non-scaling-stroke"
          />
          <polyline
            points="56,74 56,66 58,66 58,49 56,49 56,37"
            vectorEffect="non-scaling-stroke"
          />
          <polyline
            points="51,74 51,69 47,69 47,60"
            vectorEffect="non-scaling-stroke"
          />
        </g>
      </g>
    </svg>
  );
}

export function WelcomeStill({ kind }: { kind: WelcomeKind }) {
  if (kind === "gyroscope") return <GyroscopeStill />;
  if (kind === "monolith") return <MonolithStill />;
  return <CompassStill />;
}
