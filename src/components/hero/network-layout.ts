/**
 * Deterministic neural-network layout shared by the 3D scene and the static
 * fallback, so both show the same network. Seeded random, no Math.random(), so
 * server and client renders match.
 */

export type NetworkLayout = {
  /** x, y, z per node, in scene units. */
  nodes: [number, number, number][];
  /** Index pairs of connected nodes. */
  edges: [number, number][];
  /** 0 = certification color, 1 = accent, 2 = project color. */
  tones: number[];
};

function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function buildNetwork(count: number, seed = 7): NetworkLayout {
  const rand = mulberry32(seed);
  const nodes: [number, number, number][] = [];
  // A wide, shallow cloud: fills a landscape hero without crowding the middle.
  for (let i = 0; i < count; i++) {
    nodes.push([(rand() - 0.5) * 18, (rand() - 0.5) * 8, (rand() - 0.5) * 5]);
  }

  const edges: [number, number][] = [];
  const degree = new Array(count).fill(0);
  const MAX_DIST = 2.6;
  const MAX_DEGREE = 4;
  for (let i = 0; i < count; i++) {
    for (let j = i + 1; j < count; j++) {
      if (degree[i] >= MAX_DEGREE || degree[j] >= MAX_DEGREE) continue;
      const [ax, ay, az] = nodes[i];
      const [bx, by, bz] = nodes[j];
      if (Math.hypot(ax - bx, ay - by, az - bz) < MAX_DIST) {
        edges.push([i, j]);
        degree[i]++;
        degree[j]++;
      }
    }
  }

  const tones = nodes.map(() => {
    const r = rand();
    return r < 0.72 ? 1 : r < 0.9 ? 0 : 2;
  });

  return { nodes, edges, tones };
}
