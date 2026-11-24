"use client";

import { useEffect, useState } from "react";
import {
  certifications,
  credentialCategories,
  featuredCertification,
  type Certification,
  type CredentialCategoryId,
} from "@/content/credentials";
import { CredentialChip } from "./CredentialChip";
import { Reveal, RevealItem } from "./motion/Reveal";

type Filter = CredentialCategoryId | "all";

/** Every credential, newest first. The featured one is listed like any other here. */
const all: Certification[] = [featuredCertification, ...certifications].sort((a, b) => b.date.localeCompare(a.date));
const total = all.length;
const countOf = (id: CredentialCategoryId) => all.filter((cert) => cert.category === id).length;
const isCategory = (value: string): value is CredentialCategoryId =>
  credentialCategories.some((category) => category.id === value);

const chipBase = "inline-flex min-h-11 items-center gap-2 rounded-sm border px-3 py-1.5 transition-colors";

/**
 * Credentials page body: a filter bar (All, or one category, each with its
 * count) over the certifications split into category groups, each a grid of
 * identical microchip cards, newest first. The choice lives in the URL hash
 * (/credentials#web-development), so it can be linked and the back button
 * works; no hash means All. Mirrors the Technologies page's SkillExplorer.
 */
export function CredentialExplorer() {
  const [filter, setFilter] = useState<Filter>("all");

  // Follow the hash on arrival and on back/forward.
  useEffect(() => {
    const fromHash = () => {
      const hash = decodeURIComponent(window.location.hash.slice(1));
      setFilter(isCategory(hash) ? hash : "all");
    };
    fromHash();
    window.addEventListener("popstate", fromHash);
    window.addEventListener("hashchange", fromHash);
    return () => {
      window.removeEventListener("popstate", fromHash);
      window.removeEventListener("hashchange", fromHash);
    };
  }, []);

  const choose = (next: Filter) => {
    setFilter(next);
    // pushState: a history entry for the back button, without the browser jumping to an anchor.
    const url = next === "all" ? window.location.pathname : `#${next}`;
    window.history.pushState(null, "", url);
  };

  const groups = credentialCategories.filter((category) => filter === "all" || category.id === filter);
  const shown = filter === "all" ? total : countOf(filter);

  const chip = (id: Filter, label: string, count: number) => {
    const pressed = filter === id;
    return (
      <li key={id}>
        <button
          type="button"
          aria-pressed={pressed}
          onClick={() => choose(id)}
          className={`${chipBase} ${pressed ? "border-accent bg-accent text-on-accent" : "border-line-strong hover:border-accent hover:text-accent"}`}
        >
          <span className="hud-label text-sm">{label}</span>
          <span
            aria-hidden
            className={`rounded-xs px-1.5 text-xs font-semibold tabular-nums ${pressed ? "bg-on-accent text-accent" : "bg-surface text-ink-muted"}`}
          >
            {count}
          </span>
          <span className="sr-only">({count})</span>
        </button>
      </li>
    );
  };

  return (
    <div>
      <nav aria-label="Filter credentials">
        <ul className="flex flex-wrap gap-2">
          {chip("all", "All", total)}
          {credentialCategories.map((category) => chip(category.id, category.label, countOf(category.id)))}
        </ul>
      </nav>
      <p aria-live="polite" className="mt-4 text-sm text-ink-muted">
        Showing {shown} of {total} credentials
      </p>

      <div className="mt-8 grid gap-12">
        {groups.map((category) => {
          const certs = all.filter((cert) => cert.category === category.id);
          return (
            <section key={category.id} aria-labelledby={`group-${category.id}`} data-category={category.id}>
              <h2 id={`group-${category.id}`} className="mb-5 flex items-baseline gap-3 hud-label text-xl text-ink">
                {category.label}
                <span className="text-sm text-ink-muted tabular-nums">{countOf(category.id)}</span>
              </h2>
              {/* key: a new filter re-runs the print-in. */}
              <Reveal
                key={filter}
                as="ul"
                className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4 xl:grid-cols-5"
              >
                {certs.map((cert) => (
                  <RevealItem as="li" key={cert.name}>
                    <CredentialChip cert={cert} />
                  </RevealItem>
                ))}
              </Reveal>
            </section>
          );
        })}
      </div>
    </div>
  );
}
