import { gridPattern, n, svgDocument, text } from '../core/svg.ts';
import { measure } from '../core/text.ts';
import { fmt } from '../data/stats.ts';
import type { CardContext } from './context.ts';

const W = 1000;
const H = 400;
const ORBIT = { cx: 800, cy: 224, ring: 118, label: 146 } as const;
const SWEEP_SECONDS = 6;

export function renderHeader({ theme: t, profile: p, stats, buildDate }: CardContext): string {
  const kpis = [
    { value: fmt(stats.total), label: 'contribuciones / año' },
    { value: '873', label: 'pruebas automatizadas' },
    { value: '100/100', label: 'SEO en PageSpeed' },
  ];

  // --- Barra superior ---------------------------------------------------
  const location = `${p.location.city} · ${p.location.tz} · ${p.location.coords}`;
  const topBar = [
    `<circle class="blink" cx="48" cy="32" r="4" fill="${t.accentFill}"/>`,
    text(60, 36, 'EN LÍNEA', { cls: 'm7', size: 11, fill: t.accent, spacing: 1.6 }),
    text(140, 36, location, { cls: 'm4', size: 11, fill: t.inkMute, spacing: 0.6 }),
    text(W - 40, 36, `OHR//SYS · build ${buildDate.replaceAll('-', '.')}`, {
      cls: 'm4',
      size: 11,
      fill: t.inkMute,
      anchor: 'end',
      spacing: 0.6,
    }),
    `<path d="M24 56H${W - 24}" stroke="${t.line}"/>`,
  ].join('');

  // --- Secuencia de arranque -------------------------------------------
  const tagColor: Record<string, string> = { run: t.cyan, ok: t.accent, live: t.orange };
  const boot = p.boot
    .map((line, i) => {
      const y = 90 + i * 21;
      const tag = `[${line.tag.padStart(3, ' ').padEnd(4, ' ')}]`;
      return `<g class="boot" style="animation-delay:${n(0.25 + i * 0.32)}s">${text(48, y, tag, {
        cls: 'm7',
        size: 12,
        fill: tagColor[line.tag] ?? t.inkSoft,
      })}${text(104, y, line.text, { cls: 'm4', size: 12.5, fill: t.inkSoft })}</g>`;
    })
    .join('');
  const lastBootY = 90 + (p.boot.length - 1) * 21;
  const cursorX = 104 + measure(p.boot.at(-1)?.text ?? '', 'mono-400', 12.5) + 6;
  const cursor = `<rect class="caret" x="${n(cursorX)}" y="${lastBootY - 11}" width="8" height="14" fill="${t.accentFill}"/>`;

  // --- Nombre y rol ------------------------------------------------------
  const nameSize = 60;
  const lastWidth = measure(p.name.last, 'display-700', nameSize, -1.5);
  const name = [
    `<g class="rise" style="animation-delay:1.7s">`,
    text(44, 252, p.name.first, { cls: 'd7', size: nameSize, fill: t.ink, spacing: -1.5 }),
    text(44, 312, p.name.last, { cls: 'd7', size: nameSize, fill: t.ink, spacing: -1.5 }),
    `</g>`,
    `<rect class="wipe" x="40" y="200" width="${n(lastWidth + 12)}" height="124" fill="${t.accentFill}"/>`,
    `<rect x="44" y="326" width="56" height="4" fill="${t.accentFill}"/>`,
    text(112, 332, p.role, { cls: 'd5', size: 18, fill: t.inkSoft }),
  ].join('');

  // --- KPIs inferiores ---------------------------------------------------
  let kx = 44;
  const kpiRow = kpis
    .map((k) => {
      const vw = measure(k.value, 'display-700', 18);
      const lw = measure(k.label, 'mono-400', 11);
      const out = `${text(kx, 372, k.value, { cls: 'd7', size: 18, fill: t.accent })}${text(kx + vw + 8, 371, k.label, {
        cls: 'm4',
        size: 11,
        fill: t.inkMute,
      })}`;
      kx += vw + 8 + lw + 28;
      return out;
    })
    .join('');

  // --- Radar orbital -----------------------------------------------------
  const { cx, cy, ring, label } = ORBIT;
  const nodes = p.orbit
    .map((lbl, i) => {
      const deg = (360 / p.orbit.length) * i;
      const rad = ((deg - 90) * Math.PI) / 180;
      const nx = cx + Math.cos(rad) * ring;
      const ny = cy + Math.sin(rad) * ring;
      const lx = cx + Math.cos(rad) * label;
      const ly = cy + Math.sin(rad) * label;
      const delay = (deg / 360) * SWEEP_SECONDS;
      return `<g class="ping" style="animation-delay:${n(delay)}s"><circle cx="${n(nx)}" cy="${n(ny)}" r="5" fill="${t.panel}" stroke="${t.accent}" stroke-width="1.5"/><circle cx="${n(nx)}" cy="${n(ny)}" r="2" fill="${t.accentFill}"/>${text(lx, ly + 4, lbl, {
        cls: 'm7',
        size: 11,
        fill: t.ink,
        anchor: 'middle',
        spacing: 1.4,
      })}</g>`;
    })
    .join('');

  const ticks = Array.from({ length: 72 }, (_, i) => {
    const a = (i * 5 * Math.PI) / 180;
    const r1 = ring + 8;
    const r2 = ring + (i % 6 === 0 ? 16 : 12);
    return `M${n(cx + Math.cos(a) * r1)} ${n(cy + Math.sin(a) * r1)}L${n(cx + Math.cos(a) * r2)} ${n(cy + Math.sin(a) * r2)}`;
  }).join('');

  // Cuña de barrido: trailing de -140° a -90° (línea guía arriba, gira en sentido horario).
  const polar = (deg: number) => {
    const r = (deg * Math.PI) / 180;
    return { x: cx + Math.cos(r) * ring, y: cy + Math.sin(r) * ring };
  };
  const wedgeFrom = polar(-140);
  const wedgeTo = polar(-90);

  const radar = [
    `<circle cx="${cx}" cy="${cy}" r="${ring}" stroke="${t.line}" stroke-width="1"/>`,
    `<path d="${ticks}" stroke="${t.inkMute}" stroke-width="1" opacity=".55"/>`,
    `<circle cx="${cx}" cy="${cy}" r="${ring * 0.66}" stroke="${t.lineSoft}" stroke-width="1"/>`,
    `<circle class="spin-rev" cx="${cx}" cy="${cy}" r="${ring * 0.4}" stroke="${t.accent}" stroke-width="1.2" stroke-dasharray="3 7" opacity=".9"/>`,
    `<path d="M${cx - ring} ${cy}H${cx + ring}M${cx} ${cy - ring}V${cy + ring}" stroke="${t.lineSoft}"/>`,
    // Barrido: arranca apuntando arriba (-90°) para sincronizar con los nodos.
    `<g class="sweep"><path d="M${cx} ${cy}L${n(wedgeFrom.x)} ${n(wedgeFrom.y)}A${ring} ${ring} 0 0 1 ${n(wedgeTo.x)} ${n(wedgeTo.y)}Z" fill="url(#sweepGrad)"/><path d="M${cx} ${cy}L${cx} ${cy - ring}" stroke="${t.accent}" stroke-width="1.5"/></g>`,
    nodes,
    `<circle cx="${cx}" cy="${cy}" r="30" fill="${t.panelAlt}" stroke="${t.accent}" stroke-width="1.5"/>`,
    text(cx, cy + 6, 'OHR', { cls: 'd7', size: 17, fill: t.ink, anchor: 'middle', spacing: 1 }),
  ].join('');

  const css = `
.blink{animation:blink 1.6s steps(2,start) infinite}
.caret{animation:blink 1s steps(2,start) infinite}
@keyframes blink{to{visibility:hidden}}
.boot{animation:boot .5s cubic-bezier(.2,.7,.2,1) both}
@keyframes boot{from{opacity:0;transform:translateX(-10px)}to{opacity:1;transform:none}}
.rise{animation:rise .8s cubic-bezier(.2,.7,.2,1) both}
@keyframes rise{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
.wipe{transform-box:fill-box;transform:scaleX(0);animation:wipe 1.3s cubic-bezier(.7,0,.2,1) 1.2s both}
@keyframes wipe{0%{transform:scaleX(0);transform-origin:0 0}49%{transform:scaleX(1);transform-origin:0 0}51%{transform:scaleX(1);transform-origin:100% 0}100%{transform:scaleX(0);transform-origin:100% 0}}
.sweep{transform-origin:${cx}px ${cy}px;animation:spin ${SWEEP_SECONDS}s linear infinite}
.spin-rev{transform-origin:${cx}px ${cy}px;animation:spin 24s linear infinite reverse}
@keyframes spin{to{transform:rotate(360deg)}}
.ping{animation:ping ${SWEEP_SECONDS}s ease-out infinite}
@keyframes ping{0%{opacity:1}6%{opacity:1}30%{opacity:.45}100%{opacity:.45}}
.scan{animation:scan 7s linear infinite}
@keyframes scan{from{transform:translateY(-120px)}to{transform:translateY(${H + 40}px)}}`;

  const defs = [
    gridPattern('grid', 24, t.line, t.name === 'dark' ? 0.35 : 0.5),
    `<radialGradient id="glow" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(${cx} ${cy}) scale(300)"><stop stop-color="${t.accentFill}" stop-opacity="${t.name === 'dark' ? 0.14 : 0.22}"/><stop offset="1" stop-color="${t.accentFill}" stop-opacity="0"/></radialGradient>`,
    `<linearGradient id="sweepGrad" gradientUnits="userSpaceOnUse" x1="${n(cx - ring * 0.8)}" y1="${cy}" x2="${cx}" y2="${cy}"><stop stop-color="${t.accentFill}" stop-opacity="0"/><stop offset="1" stop-color="${t.accentFill}" stop-opacity=".28"/></linearGradient>`,
    `<linearGradient id="scanGrad" x1="0" y1="0" x2="0" y2="1"><stop stop-color="${t.accentFill}" stop-opacity="0"/><stop offset=".5" stop-color="${t.accentFill}" stop-opacity="${t.name === 'dark' ? 0.06 : 0.1}"/><stop offset="1" stop-color="${t.accentFill}" stop-opacity="0"/></linearGradient>`,
    `<clipPath id="panel"><rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="20"/></clipPath>`,
  ].join('');

  const body = [
    `<rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="20" fill="${t.panel}"/>`,
    `<g clip-path="url(#panel)">`,
    `<rect width="${W}" height="${H}" fill="url(#grid)"/>`,
    `<rect width="${W}" height="${H}" fill="url(#glow)"/>`,
    `<rect class="scan" x="0" y="0" width="${W}" height="110" fill="url(#scanGrad)"/>`,
    `</g>`,
    `<rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="20" stroke="${t.line}" stroke-width="1.5"/>`,
    topBar,
    boot,
    cursor,
    name,
    kpiRow,
    radar,
  ].join('\n');

  return svgDocument({
    width: W,
    height: H,
    title: `${p.name.first} ${p.name.last} — ${p.role}`,
    desc: `${p.role}. ${p.location.city}. Stack: React, Next.js, TypeScript, Node.js, PostgreSQL y Docker.`,
    theme: t,
    fonts: ['display-500', 'display-700', 'mono-400', 'mono-700'],
    css,
    defs,
    body,
  });
}
