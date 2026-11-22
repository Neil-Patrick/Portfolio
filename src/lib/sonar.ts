import type { Project } from "@/content/projects";

/**
 * Sonar scope geometry for the home landing (src/components/hero/SonarScope.tsx).
 * All positions are percentages of the square scope, center at 50/50.
 */

/** Radius of the outer range ring. The bezel (ticks and N/E/S/W) sits outside it. */
export const RING = 42;

/**
 * Bearings (degrees clockwise from north), handed out oldest project first.
 * Bearing carries no data: these were picked so each label can face outward
 * (left of center: label on the left; right of center: on the right) and still
 * fit, even on a phone. A test checks the labels never overlap or overflow.
 */
const BEARINGS = [340, 30, 120, 210, 285, 75, 165, 250];

/** Distance of the newest and the oldest contact, as a share of the ring radius. */
const NEAREST = 0.3;
const FARTHEST = 0.85;

export type SonarContact = {
  id: string;
  name: string;
  /** Month work started, YYYY-MM. */
  started: string;
  bearing: number;
  /** 0 to 1 of the ring radius: the real data (closer = started more recently). */
  distance: number;
  x: number;
  y: number;
  /** Which side of the blip its label sits on (always away from the center). */
  side: "left" | "right";
};

const monthIndex = (yyyyMm: string) => {
  const [year, month] = yyyyMm.split("-").map(Number);
  return year * 12 + month - 1;
};

const round = (value: number) => Math.round(value * 100) / 100;

/** Projects as sonar contacts: distance from the center encodes how recently each started. */
export function sonarContacts(projects: Project[]): SonarContact[] {
  const byAge = [...projects].sort(
    (a, b) => monthIndex(a.started) - monthIndex(b.started) || a.name.localeCompare(b.name),
  );
  if (byAge.length === 0) return [];
  const oldest = monthIndex(byAge[0].started);
  const newest = monthIndex(byAge[byAge.length - 1].started);
  const span = newest - oldest;

  return byAge.map((project, i) => {
    const bearing = BEARINGS[i % BEARINGS.length];
    const monthsBeforeNewest = newest - monthIndex(project.started);
    const distance =
      span === 0 ? (NEAREST + FARTHEST) / 2 : NEAREST + (monthsBeforeNewest / span) * (FARTHEST - NEAREST);
    const radians = (bearing * Math.PI) / 180;
    const x = 50 + Math.sin(radians) * distance * RING;
    const y = 50 - Math.cos(radians) * distance * RING;
    return {
      id: project.id,
      name: project.name,
      started: project.started,
      bearing,
      distance: round(distance),
      x: round(x),
      y: round(y),
      side: x < 50 ? "left" : "right",
    };
  });
}
