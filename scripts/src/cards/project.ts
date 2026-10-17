import type { Project, ProjectStatus } from '../config/profile.ts';
import type { Theme } from '../config/theme.ts';
import { arrowUpRight, cornerMarks, n, svgDocument, text } from '../core/svg.ts';
import { fit, measure, wrap } from '../core/text.ts';

const W = 490;
const H = 316;
const PAD = 26;

function statusMeta(t: Theme, s: ProjectStatus): { label: string; color: string; pulse: boolean } {
  switch (s) {
    case 'live':
      return { label: 'EN PRODUCCIÓN', color: t.accent, pulse: true };
    case 'building':
      return { label: 'EN DESARROLLO', color: t.orange, pulse: true };
    case 'done':
      return { label: 'COMPLETADO', color: t.inkSoft, pulse: false };
  }
}

export function renderProject(t: Theme, p: Project, index: number): string {
  const status = statusMeta(t, p.status);
  const pillW = measure(status.label, 'mono-700', 10, 1.2) + 30;

  const header = [
    text(PAD, 40, p.id, { cls: 'm7', size: 11, fill: t.accent, spacing: 1.2 }),
    text(PAD + measure(p.id, 'mono-700', 11, 1.2) + 12, 40, p.period, { cls: 'm4', size: 11, fill: t.inkMute, spacing: 0.6 }),
    `<rect x="${n(W - PAD - pillW)}" y="24" width="${n(pillW)}" height="24" rx="12" fill="${t.panelAlt}" stroke="${t.line}"/>`,
    `<circle cx="${n(W - PAD - pillW + 13)}" cy="36" r="3.5" fill="${status.color}"/>`,
    status.pulse ? `<circle class="pulse" cx="${n(W - PAD - pillW + 13)}" cy="36" r="3.5" stroke="${status.color}" stroke-width="1.2"/>` : '',
    text(W - PAD - pillW + 22, 40, status.label, { cls: 'm7', size: 10, fill: status.color, spacing: 1.2 }),
  ].join('');

  const desc = wrap(p.description, 'display-500', 14, W - PAD * 2)
    .slice(0, 4)
    .map((line, i) => text(PAD, 136 + i * 21, line, { cls: 'd5', size: 14, fill: t.inkSoft }))
    .join('');

  let tx = PAD;
  const tags = p.tags
    .map((tag) => {
      const w = measure(tag, 'mono-400', 10.5) + 18;
      if (tx + w > W - PAD) return '';
      const out = `<rect x="${n(tx)}" y="226" width="${n(w)}" height="22" rx="6" stroke="${t.line}"/>${text(tx + 9, 241, tag, {
        cls: 'm4',
        size: 10.5,
        fill: t.inkSoft,
      })}`;
      tx += w + 6;
      return out;
    })
    .join('');

  const metricW = measure(p.metric.value, 'display-700', 34);
  const labelEnd = PAD + metricW + 10 + measure(p.metric.label, 'mono-400', 11);
  const repoPath = p.repo.replace('https://github.com/', '');
  const repoRoom = W - PAD - 22 - labelEnd - 16;
  const repoText = repoRoom > 60 ? fit(repoPath, 'mono-400', 10.5, repoRoom) : '';
  const footer = [
    `<path d="M${PAD} 266H${W - PAD}" stroke="${t.lineSoft}"/>`,
    text(PAD, 302, p.metric.value, { cls: 'd7', size: 34, fill: t.accent, spacing: -0.5 }),
    text(PAD + metricW + 10, 300, p.metric.label, { cls: 'm4', size: 11, fill: t.inkMute }),
    repoText ? text(W - PAD - 22, 299, repoText, { cls: 'm4', size: 10.5, fill: t.inkSoft, anchor: 'end' }) : '',
    arrowUpRight(W - PAD - 10, 290, 9, t.accent),
  ].join('');

  const body = [
    `<rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="16" fill="${t.panel}" stroke="${t.line}" stroke-width="1.5"/>`,
    `<rect class="edge" x="1" y="1" width="${W - 2}" height="${H - 2}" rx="16" stroke="${t.accent}" stroke-width="1.5" pathLength="100" stroke-dasharray="6 94"/>`,
    cornerMarks(10, 10, W - 20, H - 20, 10, t.line),
    header,
    text(PAD, 88, fit(p.name, 'display-700', 30, W - PAD * 2), { cls: 'd7', size: 30, fill: t.ink, spacing: -0.5 }),
    text(PAD, 110, fit(p.kind, 'mono-400', 12, W - PAD * 2), { cls: 'm4', size: 12, fill: t.cyan }),
    desc,
    tags,
    footer,
  ].join('');

  const css = `
.edge{animation:edge 8s linear ${n(index * 1.7)}s infinite;opacity:0}
@keyframes edge{0%{stroke-dashoffset:100;opacity:1}100%{stroke-dashoffset:0;opacity:1}}
.pulse{transform-box:fill-box;transform-origin:center;animation:pulse 1.8s ease-out infinite}
@keyframes pulse{from{transform:scale(1);opacity:.9}to{transform:scale(2.4);opacity:0}}`;

  return svgDocument({
    width: W,
    height: H,
    title: `${p.name} — ${p.kind}`,
    desc: `${p.description} ${p.metric.value} ${p.metric.label}.`,
    theme: t,
    fonts: ['display-500', 'display-700', 'mono-400', 'mono-700'],
    css,
    body,
  });
}
