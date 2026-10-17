/**
 * Piezas de navegación: divisores de sección y botones de enlace.
 */
import type { Link } from '../config/profile.ts';
import type { Theme } from '../config/theme.ts';
import { arrowUpRight, n, svgDocument, text } from '../core/svg.ts';
import { measure } from '../core/text.ts';

export interface DividerSpec {
  readonly id: string;
  readonly index: string;
  readonly title: string;
  readonly caption: string;
}

export const SECTIONS: readonly DividerSpec[] = [
  { id: 'perfil', index: '01', title: 'PERFIL', caption: '// whoami' },
  { id: 'stack', index: '02', title: 'STACK', caption: '// módulos cargados' },
  { id: 'proyectos', index: '03', title: 'PROYECTOS', caption: '// despliegues' },
  { id: 'trayectoria', index: '04', title: 'TRAYECTORIA', caption: '// log 2022 — hoy' },
  { id: 'actividad', index: '05', title: 'ACTIVIDAD', caption: '// telemetría en vivo' },
];

export function renderDivider(t: Theme, s: DividerSpec): string {
  const W = 1000;
  const H = 60;
  const titleX = 70;
  const titleW = measure(s.title, 'display-700', 24, 1);
  const capW = measure(s.caption, 'mono-400', 12);
  const lineStart = titleX + titleW + 22;
  const lineEnd = W - capW - 22;
  const ticks = Array.from({ length: Math.floor((lineEnd - lineStart) / 24) + 1 }, (_, i) => {
    const x = lineStart + i * 24;
    return `M${n(x)} 34V${i % 4 === 0 ? 40 : 37}`;
  }).join('');

  const body = [
    `<rect x="0" y="16" width="52" height="28" rx="6" fill="${t.accentFill}"/>`,
    text(26, 35, s.index, { cls: 'm7', size: 14, fill: t.onAccent, anchor: 'middle' }),
    text(titleX, 39, s.title, { cls: 'd7', size: 24, fill: t.ink, spacing: 1 }),
    `<path d="M${n(lineStart)} 34H${n(lineEnd)}" stroke="${t.line}"/>`,
    `<path d="${ticks}" stroke="${t.line}"/>`,
    `<rect class="run" x="${n(lineStart)}" y="32.5" width="28" height="3" rx="1.5" fill="${t.accentFill}"/>`,
    text(W, 38, s.caption, { cls: 'm4', size: 12, fill: t.inkMute, anchor: 'end' }),
  ].join('');

  const travel = lineEnd - lineStart - 28;
  const css = `.run{animation:run 5s cubic-bezier(.65,0,.35,1) infinite alternate}@keyframes run{to{transform:translateX(${n(travel)}px)}}`;

  return svgDocument({
    width: W,
    height: H,
    title: `${s.index} ${s.title}`,
    desc: `Sección ${s.title.toLowerCase()}`,
    theme: t,
    fonts: ['display-700', 'mono-400', 'mono-700'],
    css,
    body,
  });
}

export function renderButton(t: Theme, link: Link, index: number): string {
  const W = 320;
  const H = 64;
  const idx = `[${String(index + 1).padStart(2, '0')}]`;
  const body = [
    `<rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="14" fill="${t.panel}" stroke="${t.line}" stroke-width="1.5"/>`,
    `<rect class="edge" x="1" y="1" width="${W - 2}" height="${H - 2}" rx="14" stroke="${t.accent}" stroke-width="1.5" pathLength="100" stroke-dasharray="10 90"/>`,
    text(20, 29, idx, { cls: 'm7', size: 11, fill: t.accent }),
    text(20 + measure(idx, 'mono-700', 11) + 8, 30, link.label, { cls: 'd7', size: 16, fill: t.ink, spacing: 1.2 }),
    text(20, 48, link.caption, { cls: 'm4', size: 11, fill: t.inkMute }),
    `<circle cx="${W - 34}" cy="32" r="15" fill="${t.panelAlt}" stroke="${t.line}"/>`,
    arrowUpRight(W - 39, 27, 10, t.accent),
  ].join('');

  const css = `.edge{animation:edge 6s linear ${index * 0.8}s infinite}@keyframes edge{from{stroke-dashoffset:100}to{stroke-dashoffset:0}}`;

  return svgDocument({
    width: W,
    height: H,
    title: link.label,
    desc: link.caption,
    theme: t,
    fonts: ['display-700', 'mono-400', 'mono-700'],
    css,
    body,
  });
}
