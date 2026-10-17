import { cornerMarks, n, svgDocument, text } from '../core/svg.ts';
import { wrap } from '../core/text.ts';
import type { CardContext } from './context.ts';

const W = 1000;
const COLS = 2;
const PAD = 36;
const CELL_W = (W - PAD * 2) / COLS;
const ROW_H = 84;

export function renderDossier({ theme: t, profile: p }: CardContext): string {
  const rows = Math.ceil(p.dossier.length / COLS);
  const H = PAD * 2 + rows * ROW_H - 12;

  const cells = p.dossier
    .map((item, i) => {
      const col = i % COLS;
      const row = Math.floor(i / COLS);
      const x = PAD + col * CELL_W + (col ? 24 : 0);
      const y = PAD + row * ROW_H;
      const lines = wrap(item.value, 'display-500', 16, CELL_W - 48).slice(0, 2);
      const sep =
        row < rows - 1
          ? `<path d="M${n(x)} ${y + ROW_H - 12}H${n(x + CELL_W - 24)}" stroke="${t.lineSoft}" stroke-dasharray="2 4"/>`
          : '';
      return [
        `<g class="cell" style="animation-delay:${n(i * 0.12)}s">`,
        text(x, y + 14, String(i + 1).padStart(2, '0'), { cls: 'm4', size: 10.5, fill: t.inkMute }),
        text(x + 26, y + 14, item.key, { cls: 'm7', size: 11, fill: t.accent, spacing: 1.6 }),
        ...lines.map((line, li) => text(x, y + 40 + li * 21, line, { cls: 'd5', size: 16, fill: t.ink })),
        sep,
        '</g>',
      ].join('');
    })
    .join('');

  const body = [
    `<rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="18" fill="${t.panel}" stroke="${t.line}" stroke-width="1.5"/>`,
    `<path d="M${W / 2} ${PAD - 6}V${H - PAD + 6}" stroke="${t.lineSoft}"/>`,
    cornerMarks(12, 12, W - 24, H - 24, 14, t.accent),
    cells,
  ].join('');

  return svgDocument({
    width: W,
    height: H,
    title: 'Perfil profesional',
    desc: p.dossier.map((d) => `${d.key}: ${d.value}`).join('. '),
    theme: t,
    fonts: ['display-500', 'mono-400', 'mono-700'],
    css: '.cell{animation:cell .6s ease-out both}@keyframes cell{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}',
    body,
  });
}
