import { join } from 'node:path';
import type { Degree } from '../config/profile.ts';
import type { Theme } from '../config/theme.ts';
import { paths } from '../core/paths.ts';
import { checkMark, cornerMarks, dataUri, n, svgDocument, text } from '../core/svg.ts';
import { measure, wrap } from '../core/text.ts';
import type { CardContext } from './context.ts';

const W = 1000;
const PAD = 28;
const GAP = 16;
const CARD_Y = 132;
const CARD_H = 208;
const H = CARD_Y + CARD_H + PAD;
const CARD_W = (W - PAD * 2 - GAP * 2) / 3;

function monthIndex(ym: string): number {
  const [y, m] = ym.split('-').map(Number) as [number, number];
  return y * 12 + (m - 1);
}

function progress(d: Degree, buildDate: string): number {
  if (!d.start || !d.end) return 1;
  const total = monthIndex(d.end) - monthIndex(d.start);
  const done = monthIndex(buildDate.slice(0, 7)) - monthIndex(d.start);
  return Math.min(1, Math.max(0, done / Math.max(1, total)));
}

function degreeCard(t: Theme, d: Degree, i: number, buildDate: string): string {
  const x = PAD + i * (CARD_W + GAP);
  const y = CARD_Y;
  const logo = dataUri(join(paths.logos, `${d.logo}.png`), 'image/png');
  const LOGO = { x: x + 22, y: y + 22, w: 96, h: 48 } as const;

  const levelW = measure(d.level, 'mono-700', 10, 1.4) + 20;
  const titleLines = wrap(d.title, 'display-700', 17, CARD_W - 44).slice(0, 2);

  let status: string;
  const sy = y + CARD_H - 30;
  if (d.status === 'progress') {
    const pct = progress(d, buildDate);
    const trackW = CARD_W - 44;
    const label = `${Math.round(pct * 100)}% · ${d.note}`;
    status = [
      text(x + 22, sy - 10, 'EN CURSO', { cls: 'm7', size: 10, fill: t.orange, spacing: 1.4 }),
      text(x + CARD_W - 22, sy - 10, label, { cls: 'm4', size: 10.5, fill: t.inkSoft, anchor: 'end' }),
      `<rect x="${n(x + 22)}" y="${sy}" width="${n(trackW)}" height="8" rx="4" fill="${t.lineSoft}"/>`,
      `<rect class="fill" x="${n(x + 22)}" y="${sy}" width="${n(trackW * pct)}" height="8" rx="4" fill="${t.accentFill}"/>`,
      `<rect class="shine" x="${n(x + 22)}" y="${sy}" width="24" height="8" rx="4" fill="#FFFFFF" opacity="0"/>`,
    ].join('');
  } else {
    status = [
      `<circle cx="${n(x + 31)}" cy="${sy + 2}" r="9" fill="${t.accentFill}"/>`,
      checkMark(x + 26.5, sy - 2.5, 9, t.onAccent, 2),
      text(x + 48, sy + 6, d.note, { cls: 'm4', size: 11, fill: t.inkSoft }),
    ].join('');
  }

  return [
    `<g class="card" style="animation-delay:${n(i * 0.15)}s">`,
    `<rect x="${n(x)}" y="${y}" width="${n(CARD_W)}" height="${CARD_H}" rx="14" fill="${t.panelAlt}" stroke="${t.line}"/>`,
    cornerMarks(x + 8, y + 8, CARD_W - 16, CARD_H - 16, 8, d.status === 'progress' ? t.orange : t.accent),
    `<rect x="${n(LOGO.x)}" y="${LOGO.y}" width="${LOGO.w}" height="${LOGO.h}" rx="10" fill="#FFFFFF" stroke="${t.line}"/>`,
    `<image href="${logo}" x="${n(LOGO.x + 8)}" y="${LOGO.y + 6}" width="${LOGO.w - 16}" height="${LOGO.h - 12}" preserveAspectRatio="xMidYMid meet"/>`,
    `<rect x="${n(x + CARD_W - 22 - levelW)}" y="${y + 22}" width="${n(levelW)}" height="22" rx="11" stroke="${t.line}"/>`,
    text(x + CARD_W - 22 - levelW / 2, y + 37, d.level, { cls: 'm7', size: 10, fill: t.accent, anchor: 'middle', spacing: 1.4 }),
    ...titleLines.map((line, li) => text(x + 22, y + 104 + li * 21, line, { cls: 'd7', size: 17, fill: t.ink })),
    text(x + 22, y + 104 + titleLines.length * 21 + 4, d.institution, { cls: 'm4', size: 11.5, fill: t.inkMute }),
    status,
    '</g>',
  ].join('');
}

export function renderEducation({ theme: t, profile: p, buildDate }: CardContext): string {
  const e = p.education;
  const colW = (W - PAD * 2) / e.stats.length;
  const stats = e.stats
    .map((s, i) => {
      const x = PAD + i * colW;
      const sep = i > 0 ? `<path d="M${n(x - 14)} 30V90" stroke="${t.lineSoft}"/>` : '';
      return `${sep}<g class="stat" style="animation-delay:${n(i * 0.1)}s">${text(x + 6, 70, s.value, {
        cls: 'd7',
        size: 38,
        fill: i === 0 ? t.accent : t.ink,
        spacing: -1,
      })}${text(x + 8, 92, s.label, { cls: 'm4', size: 11, fill: t.inkMute })}</g>`;
    })
    .join('');

  const body = [
    `<rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="18" fill="${t.panel}" stroke="${t.line}" stroke-width="1.5"/>`,
    stats,
    `<path d="M${PAD} 112H${W - PAD}" stroke="${t.lineSoft}"/>`,
    ...e.degrees.map((d, i) => degreeCard(t, d, i, buildDate)),
  ].join('');

  const css = `
.stat,.card{animation:rise .6s cubic-bezier(.2,.7,.2,1) both}
@keyframes rise{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
.fill{transform-box:fill-box;transform-origin:0 50%;animation:fill 1.6s cubic-bezier(.2,.7,.2,1) .4s both}
@keyframes fill{from{transform:scaleX(0)}to{transform:scaleX(1)}}
.shine{animation:shine 3.2s ease-in-out 2s infinite}
@keyframes shine{0%{opacity:0;transform:translateX(0)}15%{opacity:.55}60%{opacity:0;transform:translateX(${n(CARD_W - 70)}px)}100%{opacity:0}}`;

  return svgDocument({
    width: W,
    height: H,
    title: 'Educación',
    desc: `${e.stats.map((s) => `${s.value} ${s.label}`).join(', ')}. ${e.degrees
      .map((d) => `${d.title}, ${d.institution} (${d.note})`)
      .join('. ')}.`,
    theme: t,
    fonts: ['display-700', 'mono-400', 'mono-700'],
    css,
    body,
  });
}
