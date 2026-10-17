import { hasIcon, icon, n, svgDocument, text } from '../core/svg.ts';
import { measure } from '../core/text.ts';
import type { CardContext } from './context.ts';

const W = 1000;
const PAD_X = 36;
const LABEL_W = 170;
const CHIP_H = 38;
const GAP = 10;
const LINE_GAP = 10;
const ROW_GAP = 18;
const ICON = 16;
const FONT = 14;

interface PlacedChip {
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly name: string;
  readonly icon?: string;
  readonly core: boolean;
}

export function renderStack({ theme: t, profile: p }: CardContext): string {
  const chipsX0 = PAD_X + LABEL_W;
  const chipsX1 = W - PAD_X;
  let y = 34;
  const rowsOut: string[] = [];
  const chips: PlacedChip[] = [];

  p.stack.forEach((row, ri) => {
    const rowTop = y;
    let x = chipsX0;
    for (const item of row.items) {
      const withIcon = Boolean(item.icon && hasIcon(item.icon));
      const w = 14 + (withIcon ? ICON + 9 : 0) + measure(item.name, 'display-500', FONT) + 16;
      if (x + w > chipsX1) {
        x = chipsX0;
        y += CHIP_H + LINE_GAP;
      }
      chips.push({ x, y, w, name: item.name, icon: withIcon ? item.icon : undefined, core: Boolean(item.core) });
      x += w + GAP;
    }
    rowsOut.push(
      text(PAD_X, rowTop + 24, String(ri + 1).padStart(2, '0'), { cls: 'm4', size: 10.5, fill: t.inkMute }),
      text(PAD_X + 26, rowTop + 24, row.label, { cls: 'm7', size: 11, fill: t.inkSoft, spacing: 1.6 }),
    );
    y += CHIP_H + ROW_GAP;
    if (ri < p.stack.length - 1) {
      rowsOut.push(`<path d="M${PAD_X} ${n(y - ROW_GAP / 2)}H${W - PAD_X}" stroke="${t.lineSoft}"/>`);
    }
  });

  const legendY = y + 14;
  const H = legendY + 30;

  const chipsOut = chips
    .map((c, i) => {
      const stroke = c.core ? t.accent : t.line;
      const iconOut = c.icon ? icon(c.icon, c.x + 14, c.y + (CHIP_H - ICON) / 2, ICON, c.core ? t.accent : t.inkSoft) : '';
      const tx = c.x + 14 + (c.icon ? ICON + 9 : 0);
      const coreDot = c.core ? `<circle cx="${n(c.x + c.w - 7)}" cy="${c.y + 7}" r="2.5" fill="${t.accentFill}"/>` : '';
      return `<g class="chip" style="animation-delay:${n(i * 0.05)}s"><rect x="${n(c.x)}" y="${c.y}" width="${n(c.w)}" height="${CHIP_H}" rx="9" fill="${c.core ? t.panelAlt : t.panel}" stroke="${stroke}" stroke-width="${c.core ? 1.5 : 1}"/>${iconOut}${text(tx, c.y + 24, c.name, {
        cls: 'd5',
        size: FONT,
        fill: c.core ? t.ink : t.inkSoft,
      })}${coreDot}</g>`;
    })
    .join('');

  const legend = [
    `<rect x="${PAD_X}" y="${legendY - 9}" width="10" height="10" rx="2" fill="${t.accentFill}"/>`,
    text(PAD_X + 18, legendY, 'stack principal', { cls: 'm4', size: 11, fill: t.inkMute }),
    `<rect x="${PAD_X + 140}" y="${legendY - 9}" width="10" height="10" rx="2" stroke="${t.line}"/>`,
    text(PAD_X + 158, legendY, 'experiencia aplicada', { cls: 'm4', size: 11, fill: t.inkMute }),
    text(W - PAD_X, legendY, `${chips.length} módulos`, { cls: 'm4', size: 11, fill: t.inkMute, anchor: 'end' }),
  ].join('');

  const scanTop = 24;
  const scanH = legendY - 30 - scanTop;
  const scan = `<rect class="scan" x="${chipsX0 - 12}" y="${scanTop}" width="2" height="${n(scanH)}" fill="${t.accentFill}" opacity=".7"/>`;

  const css = `
.chip{animation:chip .45s ease-out both}
@keyframes chip{from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:none}}
.scan{animation:scan 9s cubic-bezier(.45,0,.55,1) 2s infinite;opacity:0}
@keyframes scan{0%{opacity:0;transform:translateX(0)}8%{opacity:.7}92%{opacity:.7}100%{opacity:0;transform:translateX(${chipsX1 - chipsX0 + 24}px)}}`;

  const body = [
    `<rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="18" fill="${t.panel}" stroke="${t.line}" stroke-width="1.5"/>`,
    rowsOut.join(''),
    chipsOut,
    scan,
    legend,
  ].join('');

  return svgDocument({
    width: W,
    height: H,
    title: 'Stack tecnológico',
    desc: p.stack.map((r) => `${r.label}: ${r.items.map((i) => i.name).join(', ')}`).join('. '),
    theme: t,
    fonts: ['display-500', 'mono-400', 'mono-700'],
    css,
    body,
  });
}
