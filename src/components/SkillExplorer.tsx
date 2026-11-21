"use client";

import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { TechIcon } from "./TechIcon";

export type ExplorerSkill = {
  name: string;
  /** Chip id; the URL hash `#<anchor>` selects this skill. */
  anchor: string;
  /** One sentence: what the technology is. */
  description: string;
  projects: { id: string; name: string; summary: string }[];
};

type Props = { groups: { name: string; skills: ExplorerSkill[] }[] };

const chipBase =
  "inline-flex min-h-11 items-center gap-2 rounded-sm border px-3 py-1.5";

/**
 * Skill groups with logos. Every skill is a toggle button; selecting one shows
 * what it is and which projects use it (the badge counts those projects). On large screens the panel is a
 * sticky side column; below that it opens under the selected skill's group.
 * The selection lives in the URL hash so the Projects page can link straight to it.
 */
export function SkillExplorer({ groups }: Props) {
  const allSkills = groups.flatMap((group) => group.skills);
  const [selected, setSelected] = useState<string | null>(null);

  // Pre-select from the hash on arrival (e.g. /technologies#tech-python from a project chip).
  useEffect(() => {
    const fromHash = () => {
      const anchor = decodeURIComponent(window.location.hash.slice(1));
      const match = allSkills.find((skill) => skill.anchor === anchor);
      if (match) setSelected(match.name);
    };
    fromHash();
    window.addEventListener("hashchange", fromHash);
    return () => window.removeEventListener("hashchange", fromHash);
    // allSkills is derived from static props; run once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const select = (skill: ExplorerSkill) => {
    const next = selected === skill.name ? null : skill.name;
    setSelected(next);
    const url = next ? `#${skill.anchor}` : window.location.pathname;
    window.history.replaceState(window.history.state, "", url);
  };

  const current = allSkills.find((skill) => skill.name === selected) ?? null;

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_20rem] xl:grid-cols-[minmax(0,1fr)_22rem]">
      <div className="grid gap-10 md:grid-cols-2">
        {groups.map((group, i) => {
          const groupHasSelection = group.skills.some(
            (skill) => skill.name === selected,
          );
          return (
            <section key={group.name} aria-labelledby={`skill-group-${i}`}>
              <h2 id={`skill-group-${i}`} className="mb-4 text-xl">
                {group.name}
              </h2>
              <ul className="flex flex-wrap gap-3">
                {group.skills.map((skill) => (
                  <li
                    key={skill.name}
                    id={skill.anchor}
                    className="scroll-mt-28"
                  >
                    <button
                      type="button"
                      aria-pressed={selected === skill.name}
                      onClick={() => select(skill)}
                      className={`${chipBase} ${
                        selected === skill.name
                          ? "border-accent bg-accent text-on-accent"
                          : skill.projects.length > 0
                            ? "border-line-strong bg-surface hover:border-accent"
                            : "border-line text-ink hover:border-accent"
                      }`}
                    >
                      <TechIcon name={skill.name} />
                      {skill.name}
                      {skill.projects.length > 0 && (
                        <>
                          <span
                            aria-hidden
                            className={`rounded-xs px-1.5 text-xs font-semibold tabular-nums ${
                              selected === skill.name
                                ? "bg-on-accent text-accent"
                                : "bg-canvas text-ink-muted"
                            }`}
                          >
                            {skill.projects.length}
                          </span>
                          <span className="sr-only">
                            , used in {skill.projects.length}{" "}
                            {skill.projects.length === 1 ? "Project" : "Projects"}
                          </span>
                        </>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
              {groupHasSelection && current && (
                <div className="mt-4 lg:hidden">
                  <UsagePanel skill={current} />
                </div>
              )}
            </section>
          );
        })}
      </div>

      <aside
        aria-label="Projects using the selected technology"
        className="hidden lg:block"
      >
        <div className="sticky top-[calc(var(--spacing-header)+1.5rem)]">
          <UsagePanel skill={current} />
        </div>
      </aside>
    </div>
  );
}

function UsagePanel({ skill }: { skill: ExplorerSkill | null }) {
  return (
    <div
      aria-live="polite"
      data-testid="skill-usage"
      className="rounded-md border border-line-strong bg-surface p-5"
    >
      {/* Cross-fade between selections; instant with reduced motion. */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={skill?.name ?? "none"}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.18 }}
        >
          {skill ? (
            <>
              <p className="flex items-center gap-2 text-lg font-semibold">
                <TechIcon name={skill.name} />
                {skill.name}
              </p>
              <p className="mt-2">{skill.description}</p>
              <p className="mt-4 text-sm text-ink-muted">
                {skill.projects.length > 0
                  ? `Used in ${skill.projects.length} ${skill.projects.length === 1 ? "Project" : "Projects"}`
                  : "Not in a listed project yet."}
              </p>
              <ul className="mt-2 grid gap-3">
                {skill.projects.map((project) => (
                  <li key={project.id}>
                    <Link
                      href={`/projects#${project.id}`}
                      className="font-semibold text-accent underline underline-offset-4 hover:no-underline"
                    >
                      {project.name}
                    </Link>
                    <p className="text-sm text-ink-muted">{project.summary}</p>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className="text-ink-muted">
              Pick a technology to see what it is and which projects use it. The
              number on a technology is how many projects it appears in.
            </p>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
