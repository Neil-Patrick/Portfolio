import { cacheLife } from "next/cache";

/**
 * GitHub stats for the home page. Server-only by usage: imported only from
 * Server Components, and the token is a non-public env var (never bundled).
 *
 * With GITHUB_TOKEN: two GraphQL queries. The first gets the profile, the
 * past-year calendar, counts, this month's activity, and languages; the second
 * gets one calendar per contribution year, which also drives the streaks and
 * the all-time total. Without a token, or if GitHub errors: public REST data
 * (repos, followers, primary languages). Cached for hours, so the page stays
 * static and GitHub is called a few times a day at most.
 */

export type ContributionDay = { date: string; count: number; level: 0 | 1 | 2 | 3 | 4 };

export type ContributionCalendar = {
  /** "past" for the rolling last 12 months, otherwise the year ("2025"). */
  key: string;
  label: string;
  total: number;
  weeks: ContributionDay[][];
};

export type Streak = { length: number; start: string | null; end: string | null };

export type GitHubActivity = {
  /** Contributions in the last 12 months (same number as the GitHub profile). */
  total: number;
  commits: number;
  pullRequests: number;
  issues: number;
  stars: number;
  reposContributedTo: number;
  /** Past year first, then each contribution year, newest first. */
  calendars: ContributionCalendar[];
  allTime: { total: number; since: string };
  streaks: { current: Streak; longest: Streak };
  month: {
    label: string;
    commits: number;
    commitsByRepo: { name: string; url: string; count: number }[];
    reposCreated: { name: string; url: string; date: string; isFork: boolean; language: { name: string; color: string } | null }[];
  };
};

export type GitHubStats = {
  login: string;
  url: string;
  followers: number;
  publicRepos: number;
  /** Null when no token is configured (public data only). */
  activity: GitHubActivity | null;
  /** Top languages with their share (0..1). */
  languages: { name: string; share: number }[];
  /** What the language shares are based on, for an honest label. */
  languagesBasis: "bytes" | "repos";
};

const LEVELS = {
  NONE: 0,
  FIRST_QUARTILE: 1,
  SECOND_QUARTILE: 2,
  THIRD_QUARTILE: 3,
  FOURTH_QUARTILE: 4,
} as const;

const CALENDAR_FIELDS = `contributionCalendar {
  totalContributions
  weeks { contributionDays { date contributionCount contributionLevel } }
}`;

const MAIN_QUERY = `
query ($login: String!, $monthStart: DateTime!) {
  user(login: $login) {
    url
    createdAt
    followers { totalCount }
    repositories(first: 100, ownerAffiliations: OWNER, privacy: PUBLIC, isFork: false) {
      totalCount
      nodes { stargazerCount }
    }
    repositoriesContributedTo(first: 50, includeUserRepositories: true, contributionTypes: [COMMIT, PULL_REQUEST, REPOSITORY]) {
      totalCount
      nodes { languages(first: 8, orderBy: { field: SIZE, direction: DESC }) { edges { size node { name } } } }
    }
    contributionsCollection {
      contributionYears
      totalCommitContributions
      totalPullRequestContributions
      totalIssueContributions
      ${CALENDAR_FIELDS}
    }
    month: contributionsCollection(from: $monthStart) {
      totalCommitContributions
      commitContributionsByRepository(maxRepositories: 10) {
        repository { nameWithOwner url }
        contributions { totalCount }
      }
      repositoryContributions(first: 10) {
        nodes {
          occurredAt
          repository { nameWithOwner url isFork primaryLanguage { name color } }
        }
      }
    }
  }
}`;

/** One aliased calendar per year: y2025: contributionsCollection(from, to) { ... } */
function yearsQuery(years: number[]) {
  const fields = years
    .map(
      (year) =>
        `y${year}: contributionsCollection(from: "${year}-01-01T00:00:00Z", to: "${year}-12-31T23:59:59Z") { ${CALENDAR_FIELDS} }`,
    )
    .join("\n");
  return `query ($login: String!) { user(login: $login) { ${fields} } }`;
}

type RawCalendar = {
  contributionCalendar: {
    totalContributions: number;
    weeks: { contributionDays: { date: string; contributionCount: number; contributionLevel: keyof typeof LEVELS }[] }[];
  };
};

type MainUser = {
  url: string;
  createdAt: string;
  followers: { totalCount: number };
  repositories: { totalCount: number; nodes: { stargazerCount: number }[] };
  repositoriesContributedTo: {
    totalCount: number;
    /** Null for repositories the token can't read. */
    nodes: ({ languages: { edges: { size: number; node: { name: string } }[] } } | null)[];
  };
  contributionsCollection: RawCalendar & {
    contributionYears: number[];
    totalCommitContributions: number;
    totalPullRequestContributions: number;
    totalIssueContributions: number;
  };
  month: {
    totalCommitContributions: number;
    commitContributionsByRepository: { repository: { nameWithOwner: string; url: string }; contributions: { totalCount: number } }[];
    repositoryContributions: {
      nodes: {
        occurredAt: string;
        repository: { nameWithOwner: string; url: string; isFork: boolean; primaryLanguage: { name: string; color: string } | null };
      }[];
    };
  };
};

const HEADERS = { "User-Agent": "portfolio-site", Accept: "application/vnd.github+json" };

async function graphql<T>(token: string, query: string, variables: Record<string, unknown>): Promise<T> {
  const res = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: { ...HEADERS, Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) throw new Error(`GitHub GraphQL ${res.status}`);
  const json = (await res.json()) as { data?: { user: T | null }; errors?: { message: string }[] };
  const user = json.data?.user;
  if (!user) throw new Error(json.errors?.[0]?.message ?? "GitHub user not found");
  return user;
}

function topShares(totals: Map<string, number>, limit = 6) {
  const sum = [...totals.values()].reduce((a, b) => a + b, 0) || 1;
  return [...totals.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([name, value]) => ({ name, share: value / sum }));
}

function toCalendar(key: string, label: string, raw: RawCalendar): ContributionCalendar {
  return {
    key,
    label,
    total: raw.contributionCalendar.totalContributions,
    weeks: raw.contributionCalendar.weeks.map((week) =>
      week.contributionDays.map((day) => ({
        date: day.date,
        count: day.contributionCount,
        level: LEVELS[day.contributionLevel] ?? 0,
      })),
    ),
  };
}

const DAY_MS = 24 * 60 * 60 * 1000;
const nextDay = (date: string) => new Date(Date.parse(`${date}T00:00:00Z`) + DAY_MS).toISOString().slice(0, 10);

/**
 * Streaks over every day from the first calendar to `today`.
 * The current streak stays alive through today: a day without contributions
 * yet doesn't break it (the same rule GitHub streak cards use).
 */
export function computeStreaks(days: ContributionDay[], today: string) {
  const byDate = new Map(days.map((day) => [day.date, day.count]));
  const sorted = [...byDate.keys()].filter((date) => date <= today).sort();
  const none: Streak = { length: 0, start: null, end: null };
  if (sorted.length === 0) return { current: none, longest: none };

  let longest = none;
  let run: Streak = none;
  for (let date = sorted[0]; date <= today; date = nextDay(date)) {
    if ((byDate.get(date) ?? 0) > 0) {
      run = { length: run.length + 1, start: run.start ?? date, end: date };
      if (run.length >= longest.length) longest = run; // ties: the most recent wins
    } else {
      run = none;
    }
  }

  // Walk back from today (or yesterday, if today has nothing yet).
  let cursor = (byDate.get(today) ?? 0) > 0 ? today : new Date(Date.parse(`${today}T00:00:00Z`) - DAY_MS).toISOString().slice(0, 10);
  let current = none;
  while ((byDate.get(cursor) ?? 0) > 0) {
    current = { length: current.length + 1, start: cursor, end: current.end ?? cursor };
    cursor = new Date(Date.parse(`${cursor}T00:00:00Z`) - DAY_MS).toISOString().slice(0, 10);
  }
  return { current, longest };
}

async function viaGraphQL(login: string, token: string): Promise<GitHubStats> {
  const now = new Date();
  const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const user = await graphql<MainUser>(token, MAIN_QUERY, { login, monthStart: monthStart.toISOString() });
  const collection = user.contributionsCollection;

  const years = [...collection.contributionYears].sort((a, b) => b - a);
  const yearData = years.length
    ? await graphql<Record<string, RawCalendar>>(token, yearsQuery(years), { login })
    : {};

  const past = toCalendar("past", "Past year", collection);
  const yearCalendars = years.map((year) => toCalendar(String(year), String(year), yearData[`y${year}`]));

  // "Today" is the last day of the rolling calendar (GitHub's view of the user's day).
  const today = past.weeks.at(-1)?.at(-1)?.date ?? now.toISOString().slice(0, 10);
  const allDays = [...past.weeks.flat(), ...yearCalendars.flatMap((calendar) => calendar.weeks.flat())];

  const bytes = new Map<string, number>();
  for (const repo of user.repositoriesContributedTo.nodes) {
    for (const edge of repo?.languages.edges ?? []) {
      bytes.set(edge.node.name, (bytes.get(edge.node.name) ?? 0) + edge.size);
    }
  }

  return {
    login,
    url: user.url,
    followers: user.followers.totalCount,
    publicRepos: user.repositories.totalCount,
    activity: {
      total: past.total,
      commits: collection.totalCommitContributions,
      pullRequests: collection.totalPullRequestContributions,
      issues: collection.totalIssueContributions,
      stars: user.repositories.nodes.reduce((sum, repo) => sum + repo.stargazerCount, 0),
      reposContributedTo: user.repositoriesContributedTo.totalCount,
      calendars: [past, ...yearCalendars],
      allTime: { total: yearCalendars.reduce((sum, calendar) => sum + calendar.total, 0), since: user.createdAt.slice(0, 10) },
      streaks: computeStreaks(allDays, today),
      month: {
        label: monthStart.toLocaleDateString("en-US", { month: "long", year: "numeric", timeZone: "UTC" }),
        commits: user.month.totalCommitContributions,
        commitsByRepo: user.month.commitContributionsByRepository.map((entry) => ({
          name: entry.repository.nameWithOwner,
          url: entry.repository.url,
          count: entry.contributions.totalCount,
        })),
        reposCreated: user.month.repositoryContributions.nodes.map((node) => ({
          name: node.repository.nameWithOwner,
          url: node.repository.url,
          date: node.occurredAt.slice(0, 10),
          isFork: node.repository.isFork,
          language: node.repository.primaryLanguage,
        })),
      },
    },
    languages: topShares(bytes),
    languagesBasis: "bytes",
  };
}

async function viaRest(login: string): Promise<GitHubStats> {
  const [userRes, reposRes] = await Promise.all([
    fetch(`https://api.github.com/users/${login}`, { headers: HEADERS }),
    fetch(`https://api.github.com/users/${login}/repos?per_page=100`, { headers: HEADERS }),
  ]);
  if (!userRes.ok || !reposRes.ok) throw new Error(`GitHub REST ${userRes.status}/${reposRes.status}`);
  const user = (await userRes.json()) as { html_url: string; followers: number; public_repos: number };
  const repos = (await reposRes.json()) as { language: string | null }[];

  const counts = new Map<string, number>();
  for (const repo of repos) {
    if (repo.language) counts.set(repo.language, (counts.get(repo.language) ?? 0) + 1);
  }
  return {
    login,
    url: user.html_url,
    followers: user.followers,
    publicRepos: user.public_repos,
    activity: null,
    languages: topShares(counts),
    languagesBasis: "repos",
  };
}

export async function getGitHubStats(login: string): Promise<GitHubStats | null> {
  "use cache";
  cacheLife("hours");

  const token = process.env.GITHUB_TOKEN;
  if (token) {
    try {
      return await viaGraphQL(login, token);
    } catch (error) {
      console.warn("[github] GraphQL failed, using public data:", (error as Error).message);
    }
  }
  try {
    return await viaRest(login);
  } catch (error) {
    console.warn("[github] public data unavailable:", (error as Error).message);
    return null;
  }
}
