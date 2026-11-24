"use client";

import Image from "next/image";
import { useState } from "react";
import type { Project } from "@/content/projects";

const SIZES = "(min-width: 64rem) 40vw, 90vw";

/**
 * A project's screenshots on the Projects page: the first one large in a
 * bracketed 16:9 frame, any others as thumbnails beneath that swap into the
 * frame. Until Neil adds images (`images` in projects.ts, files in
 * public/projects/<id>/), a clearly labeled placeholder stands in: a hairline
 * browser window, so it reads as "a screenshot goes here", never as content.
 */
export function ProjectMedia({ project }: { project: Project }) {
  const images = project.images ?? [];
  const [shown, setShown] = useState(0);
  const main = images[shown];

  return (
    <div>
      <div className="hud-corners relative aspect-video w-full overflow-hidden border border-line bg-canvas">
        {main ? (
          <Image src={main.src} alt={main.alt} fill sizes={SIZES} className="object-cover" />
        ) : (
          <div
            role="img"
            aria-label={`Screenshot placeholder for ${project.name}`}
            data-project-placeholder
            className="absolute inset-0 grid place-items-center p-6"
          >
            {/* A hairline browser window: title bar with three dots, then empty content lines. */}
            <span aria-hidden className="absolute inset-4">
            <svg viewBox="0 0 160 90" preserveAspectRatio="none" className="size-full">
              <g className="fill-none stroke-line-strong" strokeWidth={1} vectorEffect="non-scaling-stroke">
                <rect x={0.5} y={0.5} width={159} height={89} vectorEffect="non-scaling-stroke" />
                <line x1={0} y1={12} x2={160} y2={12} vectorEffect="non-scaling-stroke" />
                <line x1={14} y1={30} x2={90} y2={30} vectorEffect="non-scaling-stroke" />
                <line x1={14} y1={40} x2={120} y2={40} vectorEffect="non-scaling-stroke" />
                <line x1={14} y1={50} x2={70} y2={50} vectorEffect="non-scaling-stroke" />
              </g>
              <g className="fill-line-strong">
                <circle cx={7} cy={6} r={1.6} />
                <circle cx={13} cy={6} r={1.6} />
                <circle cx={19} cy={6} r={1.6} />
              </g>
            </svg>
            </span>
            {/* Below the drawn lines, so the label never crosses them. */}
            <span className="absolute inset-x-6 bottom-6 text-center hud-label text-xs text-ink-muted">Screenshot Placeholder</span>
          </div>
        )}
      </div>

      {images.length > 1 && (
        <ul className="mt-3 flex flex-wrap gap-2" aria-label={`${project.name} screenshots`}>
          {images.map((image, i) => (
            <li key={image.src}>
              <button
                type="button"
                aria-pressed={i === shown}
                aria-label={`Show screenshot ${i + 1}: ${image.alt}`}
                onClick={() => setShown(i)}
                className={`relative block aspect-video w-20 overflow-hidden border transition-colors ${
                  i === shown ? "border-accent" : "border-line-strong hover:border-accent"
                }`}
              >
                <Image src={image.src} alt="" fill sizes="5rem" className="object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
