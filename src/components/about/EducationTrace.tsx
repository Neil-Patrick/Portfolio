import { education } from "@/content/credentials";
import { LogEntry } from "../LogEntry";

/**
 * Education as a circuit trace: each entry hangs off one vertical teal line by
 * a solder-pad node (a ring with a dot). The line draws downward each time the
 * module opens (`trace-draw`, globals.css); with reduced motion it's simply there.
 */
export function EducationTrace() {
  return (
    <ul className="relative grid gap-6">
      {/* The trace, through the centers of the nodes. */}
      <span aria-hidden className="trace-draw absolute top-4 bottom-4 left-3 w-0.5 -translate-x-1/2 bg-accent" />
      {education.map((entry) => (
        <li key={entry.school} className="relative pl-10">
          <span
            aria-hidden
            className="absolute top-3 left-0 grid size-6 place-items-center rounded-full border-2 border-accent bg-canvas"
          >
            <span className="size-2 rounded-full bg-accent" />
          </span>
          <div className="hud-row px-4 py-3">
            <LogEntry title={entry.program} date={entry.period}>
              {entry.school}, {entry.location}
              {entry.note && <span className="block text-accent">{entry.note}</span>}
            </LogEntry>
          </div>
        </li>
      ))}
    </ul>
  );
}
