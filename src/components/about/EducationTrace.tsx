import { RingMark } from "../RingNode";
import { education } from "@/content/credentials";
import { LogEntry } from "../LogEntry";

/**
 * Education as a circuit trace: each entry hangs off one vertical teal line by
 * a circle node (the site's shape for points in a sequence). The line draws downward each time the
 * module opens (`trace-draw`, globals.css); with reduced motion it's simply there.
 */
export function EducationTrace() {
  return (
    <ul className="relative grid gap-6">
      {/* The trace, through the centers of the nodes. */}
      <span aria-hidden className="trace-draw absolute top-4 bottom-4 left-3 w-0.5 -translate-x-1/2 bg-accent" />
      {education.map((entry) => (
        <li key={`${entry.program} ${entry.school}`} className="relative pl-10">
          {/* Circle node on the trace (the site's shape for points in a sequence). */}
          <span aria-hidden className="absolute top-3 left-0">
            <RingMark className="size-6" core />
          </span>
          <div className="hud-row px-4 py-3">
            <LogEntry title={entry.program} date={entry.period}>
              <span className="block text-ink">{entry.school}</span>
              <span className="block">{entry.location}</span>
            </LogEntry>
          </div>
        </li>
      ))}
    </ul>
  );
}
