import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';
import { paths } from '../core/paths.ts';

export interface ContributionDay {
  readonly date: string;
  readonly count: number;
}

export interface Telemetry {
  readonly login: string;
  readonly fetchedAt: string;
  readonly days: readonly ContributionDay[];
  readonly publicRepos: number;
  /** Repos propios (no forks) por lenguaje principal. */
  readonly languages: Readonly<Record<string, number>>;
}

const QUERY = /* GraphQL */ `
  query ($login: String!) {
    user(login: $login) {
      contributionsCollection {
        contributionCalendar {
          weeks { contributionDays { date contributionCount } }
        }
      }
      repositories(ownerAffiliations: OWNER, isFork: false, privacy: PUBLIC, first: 100) {
        totalCount
        nodes { primaryLanguage { name } }
      }
    }
  }
`;

interface GraphQLResponse {
  data?: {
    user: {
      contributionsCollection: {
        contributionCalendar: {
          weeks: { contributionDays: { date: string; contributionCount: number }[] }[];
        };
      };
      repositories: {
        totalCount: number;
        nodes: { primaryLanguage: { name: string } | null }[];
      };
    } | null;
  };
  errors?: { message: string }[];
}

async function fetchFromApi(login: string, token: string): Promise<Telemetry> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20_000);
  try {
    const res = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers: {
        Authorization: `bearer ${token}`,
        'Content-Type': 'application/json',
        'User-Agent': `${login}-profile-generator`,
      },
      body: JSON.stringify({ query: QUERY, variables: { login } }),
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`GitHub GraphQL HTTP ${res.status}`);
    const json = (await res.json()) as GraphQLResponse;
    if (json.errors?.length) throw new Error(json.errors.map((e) => e.message).join('; '));
    const user = json.data?.user;
    if (!user) throw new Error(`Usuario ${login} no encontrado`);

    const days = user.contributionsCollection.contributionCalendar.weeks
      .flatMap((w) => w.contributionDays)
      .map((d) => ({ date: d.date, count: d.contributionCount }));

    const languages: Record<string, number> = {};
    for (const repo of user.repositories.nodes) {
      const lang = repo.primaryLanguage?.name;
      if (lang) languages[lang] = (languages[lang] ?? 0) + 1;
    }

    return {
      login,
      fetchedAt: new Date().toISOString(),
      days,
      publicRepos: user.repositories.totalCount,
      languages,
    };
  } finally {
    clearTimeout(timer);
  }
}

interface CacheFile {
  login: string;
  fetchedAt: string;
  start: string;
  counts: number[];
  publicRepos: number;
  languages: Record<string, number>;
}

function addDays(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

async function readCache(): Promise<Telemetry> {
  const raw = JSON.parse(await readFile(paths.cache, 'utf8')) as CacheFile;
  return {
    login: raw.login,
    fetchedAt: raw.fetchedAt,
    days: raw.counts.map((count, i) => ({ date: addDays(raw.start, i), count })),
    publicRepos: raw.publicRepos,
    languages: raw.languages,
  };
}

async function writeCache(t: Telemetry): Promise<void> {
  const file: CacheFile = {
    login: t.login,
    fetchedAt: t.fetchedAt,
    start: t.days[0]?.date ?? new Date().toISOString().slice(0, 10),
    counts: t.days.map((d) => d.count),
    publicRepos: t.publicRepos,
    languages: t.languages,
  };
  await mkdir(dirname(paths.cache), { recursive: true });
  await writeFile(paths.cache, `${JSON.stringify(file)}\n`, 'utf8');
}

/**
 * Datos de actividad: API de GitHub si hay token; si falla o no hay token,
 * usa la última caché versionada para que el build nunca rompa el README.
 */
export async function loadTelemetry(login: string, token: string | undefined): Promise<Telemetry> {
  if (token) {
    try {
      const fresh = await fetchFromApi(login, token);
      await writeCache(fresh);
      console.log(`[telemetría] API OK · ${fresh.days.length} días`);
      return fresh;
    } catch (error) {
      console.warn(`[telemetría] API falló, usando caché: ${(error as Error).message}`);
    }
  } else {
    console.log('[telemetría] Sin token, usando caché');
  }
  return readCache();
}
