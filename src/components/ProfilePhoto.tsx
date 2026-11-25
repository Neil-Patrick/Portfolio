import Image from "next/image";
import { site } from "@/content/site";

/**
 * Neil's profile photo in a notched frame (the site's one object shape). Until `site.photo` is set, a clearly
 * marked placeholder (a silhouette labeled "Photo Placeholder") stands in.
 */
export function ProfilePhoto({ sizes, priority = false }: { sizes: string; priority?: boolean }) {
  return (
    <div className="hud-notch relative aspect-square w-full overflow-hidden border border-line-strong bg-surface">
      {site.photo ? (
        <Image src={site.photo} alt={`Photo of ${site.name}`} fill sizes={sizes} priority={priority} className="object-cover" />
      ) : (
        <div role="img" aria-label="Photo placeholder" data-photo-placeholder className="absolute inset-0">
          <svg aria-hidden viewBox="0 0 100 100" className="absolute inset-0 size-full">
            {/* A simple head-and-shoulders silhouette. */}
            <circle cx={50} cy={40} r={15} className="fill-none stroke-line-strong" strokeWidth={1.5} vectorEffect="non-scaling-stroke" />
            <path
              d="M20 92 C20 70 33 60 50 60 C67 60 80 70 80 92"
              className="fill-none stroke-line-strong"
              strokeWidth={1.5}
              vectorEffect="non-scaling-stroke"
            />
          </svg>
          <span className="absolute inset-x-0 bottom-3 text-center hud-label text-xs text-ink-muted">Photo Placeholder</span>
        </div>
      )}
    </div>
  );
}
