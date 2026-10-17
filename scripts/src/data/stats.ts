import type { ContributionDay, Telemetry } from './github.ts';

export interface DerivedStats {
  readonly total: number;
  readonly activeDays: number;
  readonly currentStreak: number;
  readonly longestStreak: number;
  readonly bestDay: ContributionDay;
  readonly weekly: readonly number[];
  readonly weekStarts: readonly string[];
  readonly languages: readonly { name: string; count: number }[];
  readonly lastDate: string;
  readonly publicRepos: number;
}

export function deriveStats(t: Telemetry, maxLanguages = 5): DerivedStats {
  const days = [...t.days].sort((a, b) => a.date.localeCompare(b.date));
  const total = days.reduce((s, d) => s + d.count, 0);
  const activeDays = days.filter((d) => d.count > 0).length;

  let longest = 0;
  let run = 0;
  for (const d of days) {
    run = d.count > 0 ? run + 1 : 0;
    longest = Math.max(longest, run);
  }

  // Racha actual: si hoy aún no tiene contribuciones, se cuenta desde ayer.
  let i = days.length - 1;
  if (i >= 0 && days[i]!.count === 0) i -= 1;
  let current = 0;
  for (; i >= 0 && days[i]!.count > 0; i -= 1) current += 1;

  const bestDay = days.reduce<ContributionDay>(
    (best, d) => (d.count > best.count ? d : best),
    days[0] ?? { date: '', count: 0 },
  );

  const weekly: number[] = [];
  const weekStarts: string[] = [];
  days.forEach((d, idx) => {
    if (idx % 7 === 0) {
      weekly.push(0);
      weekStarts.push(d.date);
    }
    weekly[weekly.length - 1]! += d.count;
  });

  const sorted = Object.entries(t.languages)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
  const top = sorted.slice(0, maxLanguages);
  const rest = sorted.slice(maxLanguages).reduce((s, l) => s + l.count, 0);
  if (rest > 0) top.push({ name: 'Otros', count: rest });

  return {
    total,
    activeDays,
    currentStreak: current,
    longestStreak: longest,
    bestDay,
    weekly,
    weekStarts,
    languages: top,
    lastDate: days.at(-1)?.date ?? '',
    publicRepos: t.publicRepos,
  };
}

const MONTHS = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];

export function monthShort(iso: string): string {
  return MONTHS[Number(iso.slice(5, 7)) - 1] ?? '';
}

export function formatDateEs(iso: string): string {
  const [y, m, d] = iso.split('-');
  return `${Number(d)} ${MONTHS[Number(m) - 1]?.toLowerCase()} ${y}`;
}

export const fmt = (value: number): string => value.toLocaleString('es-CO');
