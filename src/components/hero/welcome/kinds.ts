/** The 3D welcome visuals to compare. Once one is chosen, the others are deleted. */
export const WELCOME_KINDS = ["compass", "gyroscope", "monolith"] as const;
export type WelcomeKind = (typeof WELCOME_KINDS)[number];

export const isWelcomeKind = (value: string | null): value is WelcomeKind =>
  value !== null && (WELCOME_KINDS as readonly string[]).includes(value);
