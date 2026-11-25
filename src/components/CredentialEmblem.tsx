import type { Certification } from "@/content/credentials";

/**
 * Ring colors per issuer: distinct from each other and from the teal accent
 * (teal stays for interactive and live things). All read on the charcoal canvas.
 */
const ISSUERS: { match: RegExp; label: string; color: string }[] = [
  { match: /^IBM/, label: "IBM", color: "#78a9ff" },
  { match: /^Cisco/, label: "CISCO", color: "#f5b85c" },
  { match: /^Certiport/, label: "CERTIPORT", color: "#c792ea" },
];
const FALLBACK = { label: "", color: "#9a9fa6" };

export const issuerOf = (cert: Certification) => ISSUERS.find((i) => i.match.test(cert.issuer)) ?? FALLBACK;

/**
 * A certification's emblem in the site's own style (the real Credly badge is
 * shown, untouched, in the details panel): a circle with a ring in the
 * issuer's color, a ticked inner ring that turns while selected, the short
 * code in the display face, the issuer above it and the year below.
 * Decorative: the control around it names the certification.
 */
export function CredentialEmblem({ cert, active = false, className = "size-16" }: { cert: Certification; active?: boolean; className?: string }) {
  const { label, color } = issuerOf(cert);
  const code = cert.code;
  const codeSize = code.length >= 4 ? 21 : code.length === 3 ? 25 : 30;
  return (
    <svg aria-hidden viewBox="0 0 100 100" className={`block overflow-visible ${className}`} data-emblem>
      <circle cx="50" cy="50" r="47" className="fill-surface" />
      <circle cx="50" cy="50" r="47" fill="none" stroke={color} strokeWidth="2.5" />
      {/* The ticked inner ring: turns slowly while this emblem is selected. */}
      <g className={active ? "emblem-spin" : undefined} style={{ transformBox: "fill-box", transformOrigin: "center" }}>
        <circle cx="50" cy="50" r="39" fill="none" stroke={color} strokeOpacity="0.45" strokeWidth="1.5" strokeDasharray="1.5 5.2" />
      </g>
      <text x="50" y="35" textAnchor="middle" className="fill-ink-muted font-display" style={{ fontSize: 8.5, letterSpacing: "0.14em" }}>
        {label}
      </text>
      <text x="50" y={50 + codeSize * 0.36} textAnchor="middle" className="fill-ink font-display font-bold" style={{ fontSize: codeSize }}>
        {code}
      </text>
      <text x="50" y="76" textAnchor="middle" className="font-display" fill={color} style={{ fontSize: 9, letterSpacing: "0.12em" }}>
        {cert.date.slice(0, 4)}
      </text>
    </svg>
  );
}
