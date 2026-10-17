import { mkdir, readdir, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { renderButton, renderDivider, SECTIONS } from './cards/chrome.ts';
import type { CardContext, RenderedCard } from './cards/context.ts';
import { renderCertificate } from './cards/certificate.ts';
import { renderDossier } from './cards/dossier.ts';
import { renderEducation } from './cards/education.ts';
import { renderFooter } from './cards/footer.ts';
import { renderHeader } from './cards/header.ts';
import { renderProject } from './cards/project.ts';
import { renderStack } from './cards/stack.ts';
import { renderTelemetry } from './cards/telemetry.ts';
import { renderTimeline } from './cards/timeline.ts';
import { profile } from './config/profile.ts';
import { THEMES } from './config/theme.ts';
import { paths } from './core/paths.ts';
import { loadTelemetry } from './data/github.ts';
import { deriveStats } from './data/stats.ts';
import { renderReadme } from './readme.ts';

const MAX_SVG_BYTES = 200 * 1024;

function todayInBogota(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Bogota' }).format(new Date());
}

function renderAll(ctx: CardContext): RenderedCard[] {
  const t = ctx.theme;
  return [
    { name: 'header', svg: renderHeader(ctx) },
    ...profile.links.map((l, i) => ({ name: `button-${i + 1}`, svg: renderButton(t, l, i) })),
    ...SECTIONS.map((s) => ({ name: `divider-${s.id}`, svg: renderDivider(t, s) })),
    { name: 'dossier', svg: renderDossier(ctx) },
    { name: 'stack', svg: renderStack(ctx) },
    ...profile.projects.map((p, i) => ({ name: `project-${i + 1}`, svg: renderProject(t, p, i) })),
    { name: 'timeline', svg: renderTimeline(ctx) },
    { name: 'education', svg: renderEducation(ctx) },
    ...profile.education.certificates.map((c, i) => ({ name: `cert-${i + 1}`, svg: renderCertificate(t, c, i) })),
    { name: 'telemetry', svg: renderTelemetry(ctx) },
    { name: 'footer', svg: renderFooter(ctx) },
  ];
}

async function main(): Promise<void> {
  const buildDate = process.env.BUILD_DATE ?? todayInBogota();
  const token = process.env.PROFILE_TOKEN || process.env.GITHUB_TOKEN || undefined;
  const telemetry = await loadTelemetry(profile.login, token);
  const stats = deriveStats(telemetry);

  await mkdir(paths.out, { recursive: true });
  const expected = new Set<string>();
  let totalBytes = 0;

  for (const theme of THEMES) {
    for (const card of renderAll({ theme, profile, stats, buildDate })) {
      const file = `${card.name}-${theme.name}.svg`;
      const bytes = Buffer.byteLength(card.svg);
      if (bytes > MAX_SVG_BYTES) throw new Error(`${file} pesa ${bytes} bytes (> ${MAX_SVG_BYTES})`);
      expected.add(file);
      totalBytes += bytes;
      await writeFile(join(paths.out, file), card.svg, 'utf8');
    }
  }

  // Elimina SVG obsoletos (p. ej. si se quita un proyecto).
  for (const file of await readdir(paths.out)) {
    if (file.endsWith('.svg') && !expected.has(file)) await rm(join(paths.out, file));
  }

  await writeFile(join(paths.root, 'README.md'), renderReadme(profile), 'utf8');
  console.log(`[build] ${expected.size} SVG · ${(totalBytes / 1024).toFixed(0)} KB · ${buildDate}`);
}

main().catch((error: unknown) => {
  console.error('[build] Error:', error);
  process.exitCode = 1;
});
