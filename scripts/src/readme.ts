import type { Profile } from './config/profile.ts';
import { SECTIONS } from './cards/chrome.ts';

const ASSETS = './assets/generated';

interface PictureOptions {
  readonly name: string;
  readonly alt: string;
  readonly width?: string;
  readonly href?: string;
}

function picture({ name, alt, width = '100%', href }: PictureOptions): string {
  const pic =
    `<picture>` +
    `<source media="(prefers-color-scheme: dark)" srcset="${ASSETS}/${name}-dark.svg">` +
    `<img src="${ASSETS}/${name}-light.svg" width="${width}" alt="${alt.replaceAll('"', '&quot;')}">` +
    `</picture>`;
  return href ? `<a href="${href}">${pic}</a>` : pic;
}

function divider(id: string): string {
  const s = SECTIONS.find((x) => x.id === id);
  if (!s) throw new Error(`Sección desconocida: ${id}`);
  return `<br>\n\n${picture({ name: `divider-${id}`, alt: `${s.index} · ${s.title}` })}\n`;
}

export function renderReadme(p: Profile): string {
  const buttons = p.links
    .map((l, i) => picture({ name: `button-${i + 1}`, alt: `${l.label}: ${l.caption}`, width: '32%', href: l.href }))
    .join(' ');

  const projectRows: string[] = [];
  for (let i = 0; i < p.projects.length; i += 2) {
    const pair = p.projects.slice(i, i + 2).map((pr, j) =>
      picture({
        name: `project-${i + j + 1}`,
        alt: `${pr.name} — ${pr.kind}. ${pr.metric.value} ${pr.metric.label}.`,
        width: '49%',
        href: pr.repo,
      }),
    );
    projectRows.push(`<p align="center">\n${pair.join(' ')}\n</p>`);
  }

  const demos = [
    ...p.timeline.filter((e) => e.href).map((e) => ({ label: e.title, href: e.href! })),
    ...p.projects.filter((pr) => pr.demo).map((pr) => ({ label: pr.name, href: pr.demo! })),
  ]
    .map((d) => `<a href="${d.href}"><b>${d.label}</b></a>`)
    .join(' &nbsp;·&nbsp; ');

  return `<!--
  README generado automáticamente por scripts/src/readme.ts.
  No editar a mano: cambia scripts/src/config/profile.ts y ejecuta \`npm run build\`.
-->

${picture({ name: 'header', alt: `${p.name.first} ${p.name.last} — ${p.role}`, href: p.site })}

<p align="center">
${buttons}
</p>

${divider('perfil')}
${picture({ name: 'dossier', alt: 'Perfil profesional: rol, foco, formación, idiomas y modalidad' })}

Construyo aplicaciones web **rápidas, seguras y listas para producción** con React, Next.js, TypeScript y Node.js: desde la interfaz responsive y las APIs REST hasta PostgreSQL, MongoDB, Docker y CI/CD. He llevado a producción e-commerce con pasarelas de pago, sitios con SEO técnico 100/100 y agentes de IA con modelos locales, siempre con pruebas automatizadas y buenas prácticas de seguridad.

${divider('stack')}
${picture({ name: 'stack', alt: 'Stack: TypeScript, React, Next.js, Node.js, PostgreSQL, Docker y más' })}

${divider('proyectos')}
${projectRows.join('\n\n')}

${divider('trayectoria')}
${picture({ name: 'timeline', alt: 'Trayectoria profesional y académica de 2022 a hoy' })}

<p align="center"><sub>EN PRODUCCIÓN</sub><br>${demos}</p>

${divider('actividad')}
${picture({ name: 'telemetry', alt: 'Actividad en GitHub de los últimos 12 meses' })}

<br>

${picture({ name: 'footer', alt: `¿Construimos algo juntos? ${p.email}`, href: `mailto:${p.email}` })}
`;
}
