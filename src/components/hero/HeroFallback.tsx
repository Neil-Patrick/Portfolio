import { buildNetwork } from "./network-layout";

const layout = buildNetwork(90);

/** Same network, flattened to 2D. Shown before the 3D scene loads and when WebGL is unavailable. */
export function HeroFallback() {
  // Scene units (x: -9..9, y: -4..4) mapped to a 1800×800 viewBox.
  const px = (x: number) => (x + 9) * 100;
  const py = (y: number) => (4 - y) * 100;
  const toneClass = ["fill-series-cert", "fill-accent", "fill-series-project"];

  return (
    <svg
      aria-hidden
      data-hero-fallback
      viewBox="0 0 1800 800"
      preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 size-full opacity-60"
    >
      <g className="stroke-line-strong" strokeWidth={1} opacity={0.5}>
        {layout.edges.map(([a, b]) => (
          <line
            key={`${a}-${b}`}
            x1={px(layout.nodes[a][0])}
            y1={py(layout.nodes[a][1])}
            x2={px(layout.nodes[b][0])}
            y2={py(layout.nodes[b][1])}
          />
        ))}
      </g>
      {layout.nodes.map(([x, y, z], i) => (
        <circle
          key={i}
          cx={px(x)}
          cy={py(y)}
          // Nearer nodes (higher z) are drawn larger, hinting at depth.
          r={3 + (z + 2.5) * 0.8}
          className={toneClass[layout.tones[i]]}
        />
      ))}
    </svg>
  );
}
