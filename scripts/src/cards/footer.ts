import { gridPattern, n, svgDocument, text } from '../core/svg.ts';
import { measure } from '../core/text.ts';
import type { CardContext } from './context.ts';

const W = 1000;
const H = 250;

export function renderFooter({ theme: t, profile: p, buildDate }: CardContext): string {
  const sx = 850;
  const sy = 118;
  const waves = [0, 1, 2, 3]
    .map(
      (i) =>
        `<circle class="wave" style="animation-delay:${n(i * 0.75)}s" cx="${sx}" cy="${sy}" r="70" stroke="${t.accent}" stroke-width="1.5"/>`,
    )
    .join('');

  const signal = [
    waves,
    `<circle cx="${sx}" cy="${sy}" r="70" stroke="${t.lineSoft}"/>`,
    `<circle cx="${sx}" cy="${sy}" r="40" stroke="${t.lineSoft}"/>`,
    `<circle cx="${sx}" cy="${sy}" r="9" fill="${t.accentFill}"/>`,
    `<circle cx="${sx}" cy="${sy}" r="16" stroke="${t.accent}" stroke-width="1.5"/>`,
  ].join('');

  const year = buildDate.slice(0, 4);
  const body = [
    `<rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="20" fill="${t.panel}"/>`,
    `<rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="20" fill="url(#grid)"/>`,
    `<rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="20" stroke="${t.line}" stroke-width="1.5"/>`,
    `<circle class="blink" cx="48" cy="44" r="4" fill="${t.orange}"/>`,
    text(60, 48, 'CANAL ABIERTO', { cls: 'm7', size: 11, fill: t.orange, spacing: 1.6 }),
    text(44, 108, '¿Construimos algo juntos?', { cls: 'd7', size: 42, fill: t.ink, spacing: -1 }),
    text(44, 142, p.availability, { cls: 'd5', size: 16, fill: t.inkSoft }),
    `<rect x="44" y="160" width="${n(measure(p.email, 'mono-700', 14) + 32)}" height="34" rx="9" fill="${t.panelAlt}" stroke="${t.accent}"/>`,
    text(60, 182, p.email, { cls: 'm7', size: 14, fill: t.accent }),
    signal,
    `<path d="M24 214H${W - 24}" stroke="${t.lineSoft}"/>`,
    text(44, 236, `© ${year} Omar Hernández Rey`, { cls: 'm4', size: 10.5, fill: t.inkMute }),
    text(W - 44, 236, 'SVG generados con TypeScript · sin servicios externos · actualización diaria', {
      cls: 'm4',
      size: 10.5,
      fill: t.inkMute,
      anchor: 'end',
    }),
  ].join('');

  const css = `
.blink{animation:blink 1.6s steps(2,start) infinite}
@keyframes blink{to{visibility:hidden}}
.wave{transform-box:fill-box;transform-origin:center;animation:wave 3s ease-out infinite;opacity:0}
@keyframes wave{from{transform:scale(.15);opacity:.9}to{transform:scale(1.25);opacity:0}}`;

  return svgDocument({
    width: W,
    height: H,
    title: '¿Construimos algo juntos?',
    desc: `${p.availability}. Contacto: ${p.email}`,
    theme: t,
    fonts: ['display-500', 'display-700', 'mono-400', 'mono-700'],
    css,
    defs: gridPattern('grid', 24, t.line, t.name === 'dark' ? 0.3 : 0.45),
    body,
  });
}
