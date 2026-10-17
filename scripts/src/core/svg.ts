import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import * as simpleIcons from 'simple-icons';
import type { Theme } from '../config/theme.ts';
import { paths } from './paths.ts';
import type { FontKey } from './text.ts';

const FONT_FACES: Record<FontKey, { family: string; weight: number }> = {
  'display-500': { family: 'OHR Display', weight: 500 },
  'display-700': { family: 'OHR Display', weight: 700 },
  'mono-400': { family: 'OHR Mono', weight: 400 },
  'mono-700': { family: 'OHR Mono', weight: 700 },
};

const DISPLAY_STACK = `'OHR Display','Segoe UI','Helvetica Neue',Arial,sans-serif`;
const MONO_STACK = `'OHR Mono',ui-monospace,SFMono-Regular,Menlo,Consolas,monospace`;

const fontCache = new Map<FontKey, string>();

function fontBase64(key: FontKey): string {
  const cached = fontCache.get(key);
  if (cached) return cached;
  const data = readFileSync(join(paths.fonts, `${key}.woff2`)).toString('base64');
  fontCache.set(key, data);
  return data;
}

const ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

export function esc(value: string): string {
  return value.replace(/[&<>"']/g, (c) => ESCAPES[c] ?? c);
}

export const n = (value: number): string => String(Math.round(value * 100) / 100);

export interface DocumentOptions {
  readonly width: number;
  readonly height: number;
  readonly title: string;
  readonly desc: string;
  readonly theme: Theme;
  readonly fonts: readonly FontKey[];
  readonly css?: string;
  readonly defs?: string;
  readonly body: string;
}

/** Documento SVG autocontenido: fuentes embebidas, sin peticiones externas. */
export function svgDocument(o: DocumentOptions): string {
  const faces = o.fonts
    .map((key) => {
      const f = FONT_FACES[key];
      return `@font-face{font-family:'${f.family}';font-weight:${f.weight};font-style:normal;src:url(data:font/woff2;base64,${fontBase64(key)}) format('woff2');}`;
    })
    .join('');

  const css = [
    faces,
    `.d5{font-family:${DISPLAY_STACK};font-weight:500}`,
    `.d7{font-family:${DISPLAY_STACK};font-weight:700}`,
    `.m4{font-family:${MONO_STACK};font-weight:400}`,
    `.m7{font-family:${MONO_STACK};font-weight:700}`,
    o.css ?? '',
    '@media (prefers-reduced-motion:reduce){*{animation:none!important}}',
  ].join('\n');

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${o.width}" height="${o.height}" viewBox="0 0 ${o.width} ${o.height}" fill="none" role="img" aria-labelledby="title desc">`,
    `<title id="title">${esc(o.title)}</title>`,
    `<desc id="desc">${esc(o.desc)}</desc>`,
    `<style>${css}</style>`,
    o.defs ? `<defs>${o.defs}</defs>` : '',
    o.body,
    '</svg>',
  ].join('\n');
}

export interface TextOptions {
  readonly cls: 'd5' | 'd7' | 'm4' | 'm7';
  readonly size: number;
  readonly fill: string;
  readonly anchor?: 'start' | 'middle' | 'end';
  readonly spacing?: number;
  readonly opacity?: number;
  readonly extra?: string;
}

export function text(x: number, y: number, content: string, o: TextOptions): string {
  const attrs = [
    `x="${n(x)}"`,
    `y="${n(y)}"`,
    `class="${o.cls}"`,
    `font-size="${o.size}"`,
    `fill="${o.fill}"`,
    o.anchor && o.anchor !== 'start' ? `text-anchor="${o.anchor}"` : '',
    o.spacing ? `letter-spacing="${o.spacing}"` : '',
    o.opacity !== undefined ? `opacity="${o.opacity}"` : '',
    o.extra ?? '',
  ].filter(Boolean);
  return `<text ${attrs.join(' ')}>${esc(content)}</text>`;
}

interface SimpleIcon {
  readonly path: string;
  readonly hex: string;
  readonly title: string;
}

const ICONS = simpleIcons as unknown as Record<string, SimpleIcon | undefined>;

export function hasIcon(slug: string): boolean {
  return Boolean(ICONS[`si${slug.charAt(0).toUpperCase()}${slug.slice(1)}`]);
}

/** Icono de simple-icons (viewBox 24) reescalado y monocromo. */
export function icon(slug: string, x: number, y: number, size: number, fill: string): string {
  const si = ICONS[`si${slug.charAt(0).toUpperCase()}${slug.slice(1)}`];
  if (!si) return '';
  return `<path transform="translate(${n(x)} ${n(y)}) scale(${n(size / 24)})" d="${si.path}" fill="${fill}"/>`;
}

/** Marcas de recorte en esquinas, estilo HUD. */
export function cornerMarks(x: number, y: number, w: number, h: number, len: number, stroke: string): string {
  const d = [
    `M${x} ${y + len}V${y}H${x + len}`,
    `M${x + w - len} ${y}H${x + w}V${y + len}`,
    `M${x + w} ${y + h - len}V${y + h}H${x + w - len}`,
    `M${x + len} ${y + h}H${x}V${y + h - len}`,
  ].join('');
  return `<path d="${d}" stroke="${stroke}" stroke-width="1.5" stroke-linecap="square"/>`;
}

/** Flecha diagonal ↗ dibujada (no depende de la fuente). */
export function arrowUpRight(x: number, y: number, size: number, stroke: string): string {
  return `<path d="M${n(x)} ${n(y + size)}L${n(x + size)} ${n(y)}M${n(x + size * 0.3)} ${n(y)}H${n(x + size)}V${n(y + size * 0.7)}" stroke="${stroke}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>`;
}

/** Patrón de rejilla fina para fondos de panel. */
export function gridPattern(id: string, size: number, stroke: string, opacity: number): string {
  return `<pattern id="${id}" width="${size}" height="${size}" patternUnits="userSpaceOnUse"><path d="M${size} 0H0V${size}" stroke="${stroke}" stroke-width="1" opacity="${opacity}"/></pattern>`;
}
