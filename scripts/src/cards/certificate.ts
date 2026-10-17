import { join } from 'node:path';
import type { Certificate } from '../config/profile.ts';
import type { Theme } from '../config/theme.ts';
import { paths } from '../core/paths.ts';
import { arrowUpRight, checkMark, cornerMarks, dataUri, n, svgDocument, text } from '../core/svg.ts';
import { fit, measure, wrap } from '../core/text.ts';

const W = 320;
const H = 330;
const IMG = { x: 12, y: 12, w: 296, h: 184 } as const;

export function renderCertificate(t: Theme, c: Certificate, index: number): string {
  const image = dataUri(join(paths.certificates, 'thumbs', `${c.id}.jpg`), 'image/jpeg');
  const titleLines = wrap(c.title, 'display-700', 16, W - 36).slice(0, 2);
  if (wrap(c.title, 'display-700', 16, W - 36).length > 2) {
    titleLines[1] = fit(`${titleLines[1]} …`, 'display-700', 16, W - 36);
  }

  const badgeW = measure('VERIFICADO', 'mono-700', 9.5, 1.2) + 34;
  const badge = [
    `<rect x="${IMG.x + 10}" y="${IMG.y + 10}" width="${n(badgeW)}" height="22" rx="11" fill="#0B0F14" fill-opacity=".86"/>`,
    checkMark(IMG.x + 20, IMG.y + 16.5, 9, '#C8F135', 2),
    text(IMG.x + 35, IMG.y + 25, 'VERIFICADO', { cls: 'm7', size: 9.5, fill: '#FFFFFF', spacing: 1.2 }),
  ].join('');

  const newBadge = c.isNew
    ? `<rect class="new" x="${IMG.x + IMG.w - 62}" y="${IMG.y + 10}" width="52" height="22" rx="11" fill="${t.accentFill}"/>${text(
        IMG.x + IMG.w - 36,
        IMG.y + 25,
        'NUEVO',
        { cls: 'm7', size: 9.5, fill: t.onAccent, anchor: 'middle', spacing: 1.2 },
      )}`
    : '';

  const textTop = IMG.y + IMG.h + 30;
  const body = [
    `<rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="16" fill="${t.panel}" stroke="${t.line}" stroke-width="1.5"/>`,
    `<clipPath id="win"><rect x="${IMG.x}" y="${IMG.y}" width="${IMG.w}" height="${IMG.h}" rx="10"/></clipPath>`,
    `<g clip-path="url(#win)">`,
    `<rect x="${IMG.x}" y="${IMG.y}" width="${IMG.w}" height="${IMG.h}" fill="#FFFFFF"/>`,
    `<image class="zoom" href="${image}" x="${IMG.x}" y="${IMG.y}" width="${IMG.w}" height="${IMG.h}" preserveAspectRatio="xMidYMid slice"/>`,
    `<rect x="${IMG.x}" y="${IMG.y + IMG.h - 70}" width="${IMG.w}" height="70" fill="url(#shade)"/>`,
    `<g class="scan"><rect x="${IMG.x}" y="${IMG.y - 40}" width="${IMG.w}" height="40" fill="url(#beam)"/><rect x="${IMG.x}" y="${IMG.y - 1.5}" width="${IMG.w}" height="1.5" fill="${t.name === 'dark' ? t.accentFill : '#8DB800'}"/></g>`,
    `</g>`,
    `<rect x="${IMG.x}" y="${IMG.y}" width="${IMG.w}" height="${IMG.h}" rx="10" stroke="${t.line}"/>`,
    cornerMarks(IMG.x - 4, IMG.y - 4, IMG.w + 8, IMG.h + 8, 12, t.accent),
    badge,
    newBadge,
    text(18, textTop, c.issuer, { cls: 'm7', size: 10.5, fill: t.accent, spacing: 1.4 }),
    ...titleLines.map((line, i) => text(18, textTop + 24 + i * 20, line, { cls: 'd7', size: 16, fill: t.ink })),
    `<path d="M18 ${H - 40}H${W - 18}" stroke="${t.lineSoft}"/>`,
    text(18, H - 18, c.meta, { cls: 'm4', size: 11, fill: t.inkMute }),
    text(W - 36, H - 18, 'VER', { cls: 'm7', size: 10, fill: t.inkSoft, anchor: 'end', spacing: 1.2 }),
    arrowUpRight(W - 28, H - 27, 9, t.accent),
  ].join('');

  const defs = [
    `<linearGradient id="shade" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".22"/></linearGradient>`,
    `<linearGradient id="beam" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#C8F135" stop-opacity="0"/><stop offset="1" stop-color="#C8F135" stop-opacity=".28"/></linearGradient>`,
  ].join('');

  const css = `
.scan{animation:scan 4.5s cubic-bezier(.45,0,.55,1) ${n(index * 0.7)}s infinite}
@keyframes scan{0%{transform:translateY(0);opacity:0}6%{opacity:1}55%{transform:translateY(${IMG.h + 40}px);opacity:1}56%,100%{opacity:0;transform:translateY(${IMG.h + 40}px)}}
.zoom{transform-box:fill-box;transform-origin:center;animation:zoom 14s ease-in-out infinite alternate}
@keyframes zoom{from{transform:scale(1)}to{transform:scale(1.06)}}
.new{animation:glow 1.8s ease-in-out infinite alternate}
@keyframes glow{from{opacity:1}to{opacity:.65}}`;

  return svgDocument({
    width: W,
    height: H,
    title: c.title,
    desc: `${c.issuer} — ${c.title}. ${c.meta}.`,
    theme: t,
    fonts: ['display-700', 'mono-400', 'mono-700'],
    css,
    defs,
    body,
  });
}
