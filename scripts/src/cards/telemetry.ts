import { n, svgDocument, text } from '../core/svg.ts';
import { measure } from '../core/text.ts';
import { fmt, formatDateEs, monthShort } from '../data/stats.ts';
import type { CardContext } from './context.ts';

const W = 1000;
const H = 410;
const PAD = 36;
const WAVE = { x0: 452, x1: W - PAD, cy: 158, half: 78 } as const;

export function renderTelemetry({ theme: t, stats: s, profile: p }: CardContext): string {
  // --- Cabecera ---------------------------------------------------------
  const head = [
    `<circle class="blink" cx="${PAD + 4}" cy="34" r="4" fill="${t.accentFill}"/>`,
    text(PAD + 16, 38, 'ACTIVIDAD EN GITHUB · ÚLTIMOS 12 MESES', { cls: 'm7', size: 11, fill: t.inkSoft, spacing: 1.4 }),
    text(W - PAD, 38, `sincronizado ${formatDateEs(s.lastDate)}`, { cls: 'm4', size: 11, fill: t.inkMute, anchor: 'end' }),
    `<path d="M${PAD} 56H${W - PAD}" stroke="${t.lineSoft}"/>`,
  ].join('');

  // --- KPIs -------------------------------------------------------------
  const kpis = [
    { value: fmt(s.total), label: 'contribuciones', hl: true },
    { value: fmt(s.activeDays), label: 'días activos' },
    { value: `${s.longestStreak}d`, label: 'racha más larga' },
    { value: `${s.currentStreak}d`, label: 'racha actual' },
    { value: fmt(s.bestDay.count), label: `pico · ${formatDateEs(s.bestDay.date)}` },
    { value: fmt(s.publicRepos), label: 'repos públicos' },
  ];
  const cellW = 190;
  const cellH = 76;
  const kpiOut = kpis
    .map((k, i) => {
      const x = PAD + (i % 2) * cellW;
      const y = 76 + Math.floor(i / 2) * cellH;
      return `<g class="kpi" style="animation-delay:${n(i * 0.1)}s">${text(x, y + 34, k.value, {
        cls: 'd7',
        size: 32,
        fill: k.hl ? t.accent : t.ink,
        spacing: -0.5,
      })}${text(x, y + 54, k.label, { cls: 'm4', size: 10.5, fill: t.inkMute })}</g>`;
    })
    .join('');

  // --- Forma de onda semanal ---------------------------------------------
  const weeks = s.weekly;
  const max = Math.max(1, ...weeks);
  const step = (WAVE.x1 - WAVE.x0) / weeks.length;
  const barW = Math.max(3, step * 0.62);
  const bars = weeks
    .map((v, i) => {
      const x = WAVE.x0 + i * step + (step - barW) / 2;
      if (v === 0) {
        return `<rect x="${n(x)}" y="${WAVE.cy - 1}" width="${n(barW)}" height="2" rx="1" fill="${t.line}"/>`;
      }
      const h = Math.max(4, Math.sqrt(v / max) * WAVE.half);
      const op = 0.35 + 0.65 * (v / max);
      return `<rect class="bar" style="animation-delay:${n(i * 0.018)}s" x="${n(x)}" y="${n(WAVE.cy - h)}" width="${n(barW)}" height="${n(h * 2)}" rx="${n(barW / 2)}" fill="${t.accentFill}" fill-opacity="${n(op)}"/>`;
    })
    .join('');

  let prevMonth = '';
  const months = s.weekStarts
    .map((iso, i) => {
      const m = iso.slice(0, 7);
      if (m === prevMonth) return '';
      prevMonth = m;
      if (i === 0) return '';
      const x = WAVE.x0 + i * step;
      return `<path d="M${n(x)} ${WAVE.cy + WAVE.half + 8}V${WAVE.cy + WAVE.half + 14}" stroke="${t.line}"/>${text(x, WAVE.cy + WAVE.half + 28, monthShort(iso), {
        cls: 'm4',
        size: 10,
        fill: t.inkMute,
        anchor: 'middle',
      })}`;
    })
    .join('');

  const wave = [
    `<path d="M${WAVE.x0} ${WAVE.cy}H${WAVE.x1}" stroke="${t.lineSoft}"/>`,
    bars,
    `<rect class="head" x="${WAVE.x0}" y="${WAVE.cy - WAVE.half - 6}" width="2" height="${WAVE.half * 2 + 12}" fill="${t.ink}" opacity=".7"/>`,
    months,
    text(WAVE.x0, 76, 'contribuciones por semana', { cls: 'm4', size: 10.5, fill: t.inkMute }),
    text(WAVE.x1, 76, `máx. ${fmt(max)} / semana`, { cls: 'm4', size: 10.5, fill: t.inkMute, anchor: 'end' }),
  ].join('');

  // --- Lenguajes ------------------------------------------------------------
  const langY = 338;
  const total = s.languages.reduce((sum, l) => sum + l.count, 0) || 1;
  const barX0 = PAD;
  const barX1 = W - PAD;
  let cursor = barX0;
  const segments = s.languages
    .map((l, i) => {
      const w = ((barX1 - barX0) * l.count) / total;
      const out = `<rect x="${n(cursor)}" y="${langY}" width="${n(Math.max(0, w - 2))}" height="10" rx="2" fill="${t.series[i % t.series.length]}"/>`;
      cursor += w;
      return out;
    })
    .join('');

  let lx = PAD;
  const legend = s.languages
    .map((l, i) => {
      const pct = Math.round((l.count / total) * 100);
      const label = `${l.name} ${pct}%`;
      const out = `<rect x="${n(lx)}" y="${langY + 30}" width="9" height="9" rx="2" fill="${t.series[i % t.series.length]}"/>${text(lx + 15, langY + 39, label, {
        cls: 'm4',
        size: 11,
        fill: t.inkSoft,
      })}`;
      lx += 15 + measure(label, 'mono-400', 11) + 22;
      return out;
    })
    .join('');

  const langs = [
    `<path d="M${PAD} ${langY - 34}H${W - PAD}" stroke="${t.lineSoft}"/>`,
    text(PAD, langY - 12, 'LENGUAJE PRINCIPAL POR REPOSITORIO', { cls: 'm7', size: 10.5, fill: t.inkMute, spacing: 1.4 }),
    segments,
    legend,
  ].join('');

  const travel = WAVE.x1 - WAVE.x0 - 2;
  const css = `
.blink{animation:blink 1.6s steps(2,start) infinite}
@keyframes blink{to{visibility:hidden}}
.kpi{animation:kpi .6s ease-out both}
@keyframes kpi{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
.bar{transform-box:fill-box;transform-origin:center;animation:bar .7s cubic-bezier(.2,.7,.2,1) both}
@keyframes bar{from{transform:scaleY(0)}to{transform:scaleY(1)}}
.head{animation:head 10s linear 1.5s infinite;opacity:0}
@keyframes head{0%{transform:translateX(0);opacity:0}5%{opacity:.7}95%{opacity:.7}100%{transform:translateX(${n(travel)}px);opacity:0}}`;

  const body = [
    `<rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="18" fill="${t.panel}" stroke="${t.line}" stroke-width="1.5"/>`,
    head,
    kpiOut,
    `<path d="M${WAVE.x0 - 36} 76V292" stroke="${t.lineSoft}"/>`,
    wave,
    langs,
  ].join('');

  return svgDocument({
    width: W,
    height: H,
    title: 'Actividad en GitHub',
    desc: `${p.login}: ${s.total} contribuciones en 12 meses, ${s.activeDays} días activos, racha más larga de ${s.longestStreak} días, ${s.publicRepos} repositorios públicos.`,
    theme: t,
    fonts: ['display-700', 'mono-400', 'mono-700'],
    css,
    body,
  });
}
