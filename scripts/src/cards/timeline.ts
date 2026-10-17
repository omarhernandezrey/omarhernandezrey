import type { TimelineEntry, TimelineKind } from '../config/profile.ts';
import type { Theme } from '../config/theme.ts';
import { n, svgDocument, text } from '../core/svg.ts';
import { fit, measure } from '../core/text.ts';
import { monthShort } from '../data/stats.ts';
import type { CardContext } from './context.ts';

const W = 1000;
const PAD = 36;
const LABEL_W = 270;
const X0 = PAD + LABEL_W;
const X1 = W - PAD;
const TOP = 74;
const ROW_H = 52;
const BAR_H = 18;
const DOMAIN = { from: { y: 2022, m: 0 }, to: { y: 2027, m: 0 } } as const;

const toMonthIndex = (y: number, m: number): number => y * 12 + m;
const DOMAIN_START = toMonthIndex(DOMAIN.from.y, DOMAIN.from.m);
const DOMAIN_END = toMonthIndex(DOMAIN.to.y, DOMAIN.to.m);

/** 'YYYY-MM' -> x; `edge: 'end'` toma el final del mes. */
function xOf(ym: string, edge: 'start' | 'end' | 'mid' = 'start'): number {
  const [y, m] = ym.split('-').map(Number) as [number, number];
  const offset = edge === 'start' ? 0 : edge === 'end' ? 1 : 0.5;
  const idx = toMonthIndex(y, m - 1) + offset;
  return X0 + ((idx - DOMAIN_START) / (DOMAIN_END - DOMAIN_START)) * (X1 - X0);
}

function xOfDate(iso: string): number {
  const [y, m, d] = iso.split('-').map(Number) as [number, number, number];
  const idx = toMonthIndex(y, m - 1) + (d - 1) / 30;
  return X0 + ((idx - DOMAIN_START) / (DOMAIN_END - DOMAIN_START)) * (X1 - X0);
}

function kindColor(t: Theme, k: TimelineKind): string {
  const map: Record<TimelineKind, string> = {
    work: t.cyan,
    freelance: t.accentFill,
    project: t.orange,
    education: t.ink,
    learning: t.inkMute,
  };
  return map[k];
}

export function renderTimeline({ theme: t, profile: p, buildDate }: CardContext): string {
  const entries = [...p.timeline].sort((a, b) => a.start.localeCompare(b.start));
  const H = TOP + entries.length * ROW_H + 58;
  const todayX = xOfDate(buildDate);
  const todayYm = buildDate.slice(0, 7);

  // Rejilla anual
  const years: string[] = [];
  for (let y = DOMAIN.from.y; y <= DOMAIN.to.y; y += 1) {
    const x = xOf(`${y}-01`);
    years.push(
      `<path d="M${n(x)} ${TOP - 18}V${H - 54}" stroke="${t.lineSoft}"/>`,
    );
    if (y < DOMAIN.to.y) years.push(text(x + 6, TOP - 26, String(y), { cls: 'm7', size: 11, fill: t.inkMute, spacing: 1 }));
  }

  const rows = entries.map((e: TimelineEntry, i) => {
    const cy = TOP + i * ROW_H + ROW_H / 2;
    const color = kindColor(t, e.kind);
    const label = [
      text(PAD, cy - 2, fit(e.title, 'display-700', 15, LABEL_W - 20), { cls: 'd7', size: 15, fill: t.ink }),
      text(PAD, cy + 15, fit(e.role, 'mono-400', 11, LABEL_W - 20), { cls: 'm4', size: 11, fill: t.inkMute }),
    ].join('');
    const zebra = i % 2 === 0 ? `<rect x="${PAD - 12}" y="${cy - ROW_H / 2}" width="${W - PAD * 2 + 24}" height="${ROW_H}" rx="8" fill="${t.panelAlt}" opacity=".55"/>` : '';

    const isMilestone = e.start === e.end;
    const isFuture = e.start > todayYm;
    const detailW = measure(e.detail, 'mono-400', 10.5);

    if (isMilestone) {
      const x = xOf(e.start, 'mid');
      const s = 8;
      const diamond = `<path class="pop" style="animation-delay:${n(0.4 + i * 0.12)}s" d="M${n(x)} ${n(cy - s)}L${n(x + s)} ${n(cy)}L${n(x)} ${n(cy + s)}L${n(x - s)} ${n(cy)}Z" fill="${isFuture ? t.panel : t.accentFill}" stroke="${isFuture ? t.accent : t.accentFill}" stroke-width="1.5" ${isFuture ? 'stroke-dasharray="3 2"' : ''}/>`;
      const tag = `${e.detail} · ${monthShort(`${e.start}-01`).toLowerCase()} ${e.start.slice(0, 4)}`;
      const tagW = measure(tag, 'mono-400', 10.5);
      const tx = x + 16 + tagW < X1 ? x + 16 : x - 16;
      const anchor = x + 16 + tagW < X1 ? 'start' : 'end';
      return zebra + label + diamond + text(tx, cy + 4, tag, { cls: 'm4', size: 10.5, fill: isFuture ? t.accent : t.inkSoft, anchor });
    }

    const xs = xOf(e.start);
    const ongoing = e.end === 'now';
    const xe = ongoing ? todayX : xOf(e.end, 'end');
    const w = Math.max(6, xe - xs);
    const isLearning = e.kind === 'learning';
    const bar = `<rect class="grow" style="animation-delay:${n(0.3 + i * 0.12)}s" x="${n(xs)}" y="${cy - BAR_H / 2}" width="${n(w)}" height="${BAR_H}" rx="${BAR_H / 2}" fill="${isLearning ? 'url(#hatch)' : color}" ${isLearning ? `stroke="${t.line}"` : ''}/>`;
    const head = ongoing
      ? `<circle cx="${n(xe)}" cy="${cy}" r="4" fill="${color}"/><circle class="ring" cx="${n(xe)}" cy="${cy}" r="4" stroke="${color}" stroke-width="1.5"/>`
      : '';

    let detail: string;
    if (isLearning) {
      const lw = measure(e.detail, 'mono-400', 10.5) + 16;
      detail = `<rect x="${n(xs + 8)}" y="${cy - 9}" width="${n(lw)}" height="18" rx="9" fill="${t.panel}"/>${text(xs + 16, cy + 4, e.detail, { cls: 'm4', size: 10.5, fill: t.inkSoft })}`;
    } else if (w > detailW + 24) {
      const onBar = e.kind === 'freelance' ? t.onAccent : t.name === 'dark' ? t.bg : '#FFFFFF';
      detail = text(xs + 12, cy + 4, e.detail, { cls: 'm7', size: 10.5, fill: onBar });
    } else if (xe + 12 + detailW < X1) {
      detail = text(xe + (ongoing ? 14 : 10), cy + 4, e.detail, { cls: 'm4', size: 10.5, fill: t.inkSoft });
    } else {
      detail = text(xs - 10, cy + 4, e.detail, { cls: 'm4', size: 10.5, fill: t.inkSoft, anchor: 'end' });
    }
    return zebra + label + bar + head + detail;
  });

  const today = [
    `<path d="M${n(todayX)} ${TOP - 12}V${H - 54}" stroke="${t.accent}" stroke-dasharray="3 3"/>`,
    `<rect x="${n(todayX - 22)}" y="${TOP - 40}" width="44" height="18" rx="9" fill="${t.accentFill}"/>`,
    text(todayX, TOP - 27, 'HOY', { cls: 'm7', size: 10, fill: t.onAccent, anchor: 'middle', spacing: 1 }),
  ].join('');

  const legendItems: { label: string; kind: TimelineKind | 'milestone' }[] = [
    { label: 'TRABAJO', kind: 'work' },
    { label: 'FREELANCE', kind: 'freelance' },
    { label: 'PROYECTOS', kind: 'project' },
    { label: 'FORMACIÓN', kind: 'learning' },
    { label: 'HITO ACADÉMICO', kind: 'milestone' },
  ];
  let lx = PAD;
  const ly = H - 22;
  const legend = legendItems
    .map((item) => {
      const sw =
        item.kind === 'milestone'
          ? `<path d="M${lx + 5} ${ly - 10}L${lx + 10} ${ly - 5}L${lx + 5} ${ly}L${lx} ${ly - 5}Z" fill="${t.accentFill}"/>`
          : `<rect x="${lx}" y="${ly - 9}" width="16" height="8" rx="4" fill="${item.kind === 'learning' ? 'url(#hatch)' : kindColor(t, item.kind)}" ${item.kind === 'learning' ? `stroke="${t.line}"` : ''}/>`;
      const out = sw + text(lx + 24, ly - 1, item.label, { cls: 'm4', size: 10.5, fill: t.inkMute, spacing: 1 });
      lx += 24 + measure(item.label, 'mono-400', 10.5, 1) + 26;
      return out;
    })
    .join('');

  const defs = `<pattern id="hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="6" height="6" fill="${t.panelAlt}"/><path d="M0 0V6" stroke="${t.inkMute}" stroke-width="1.5" opacity=".55"/></pattern>`;

  const css = `
.grow{transform-box:fill-box;transform-origin:0 50%;animation:grow 1s cubic-bezier(.2,.7,.2,1) both}
@keyframes grow{from{transform:scaleX(0)}to{transform:scaleX(1)}}
.pop{transform-box:fill-box;transform-origin:center;animation:pop .5s cubic-bezier(.3,1.6,.5,1) both}
@keyframes pop{from{transform:scale(0)}to{transform:scale(1)}}
.ring{transform-box:fill-box;transform-origin:center;animation:ring 2s ease-out infinite}
@keyframes ring{from{transform:scale(1);opacity:1}to{transform:scale(3.2);opacity:0}}`;

  const body = [
    `<rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="18" fill="${t.panel}" stroke="${t.line}" stroke-width="1.5"/>`,
    years.join(''),
    rows.join(''),
    today,
    `<path d="M${PAD} ${H - 46}H${W - PAD}" stroke="${t.lineSoft}"/>`,
    legend,
  ].join('');

  return svgDocument({
    width: W,
    height: H,
    title: 'Trayectoria 2022 — hoy',
    desc: entries.map((e) => `${e.title} (${e.role}) ${e.start} a ${e.end}: ${e.detail}`).join('. '),
    theme: t,
    fonts: ['display-700', 'mono-400', 'mono-700'],
    css,
    defs,
    body,
  });
}
