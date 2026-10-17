import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { paths } from './paths.ts';

export type FontKey = 'display-500' | 'display-700' | 'mono-400' | 'mono-700';

interface FontMetrics {
  readonly unitsPerEm: number;
  readonly fallback: number;
  readonly widths: Readonly<Record<string, number>>;
}

const METRICS = JSON.parse(
  readFileSync(join(paths.fonts, 'metrics.json'), 'utf8'),
) as Record<FontKey, FontMetrics>;

/** Ancho aproximado (sin kerning) del texto en px. */
export function measure(text: string, font: FontKey, size: number, letterSpacing = 0): number {
  const m = METRICS[font];
  let units = 0;
  for (const ch of text) units += m.widths[ch] ?? m.fallback;
  const chars = [...text].length;
  return (units / m.unitsPerEm) * size + letterSpacing * Math.max(0, chars - 1);
}

/** Parte el texto en líneas que caben en `maxWidth`. */
export function wrap(text: string, font: FontKey, size: number, maxWidth: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = '';
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (measure(candidate, font, size) <= maxWidth || !current) {
      current = candidate;
    } else {
      lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines;
}

/** Recorta con elipsis para no desbordar `maxWidth`. */
export function fit(text: string, font: FontKey, size: number, maxWidth: number): string {
  if (measure(text, font, size) <= maxWidth) return text;
  let out = text;
  while (out.length > 1 && measure(`${out}…`, font, size) > maxWidth) out = out.slice(0, -1);
  return `${out.trimEnd()}…`;
}
