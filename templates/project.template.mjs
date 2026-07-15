import { renderHead } from './partials/head.mjs';
import { renderNav } from './partials/nav.mjs';
import { renderWheel, PHASES } from './partials/wheel.mjs';
import { PHASE_RENDERERS } from './partials/phase-panels.mjs';
import { escapeHtml } from '../scripts/lib/html-escape.mjs';

function statusClass(status) {
  return String(status || '').toLowerCase().replace(/\s+/g, '-');
}

function docLinksFor(phase, project) {
  if (phase === 'define' && project.define && project.define.problemStatement) {
    return `<div class="doc-links">
      <a href="documents/charter.pdf">Download Charter (PDF)</a>
      <button type="button" onclick="window.print()">Print this page</button>
    </div>`;
  }
  if (phase === 'control' && project.control && project.control.controlPlan && project.control.controlPlan.length) {
    return `<div class="doc-links">
      <a href="documents/control-plan.pdf">Download Control Plan (PDF)</a>
      <button type="button" onclick="window.print()">Print this page</button>
    </div>`;
  }
  return '';
}

export function renderProjectPage(project) {
  const basePath = '../../';
  const panels = PHASES.map((phase) => {
    const renderer = PHASE_RENDERERS[phase];
    return `<section class="phase-panel" data-phase="${phase}">
      ${renderer(project)}
      ${docLinksFor(phase, project)}
    </section>`;
  }).join('\n    ');

  const tabs = PHASES.map(
    (phase) => `<button type="button" class="phase-tab" data-phase="${phase}">${phase.charAt(0).toUpperCase() + phase.slice(1)}</button>`
  ).join('\n      ');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  ${renderHead({ title: `${project.title} — LSS Portfolio`, basePath, css: ['main.css', 'wheel.css'] })}
</head>
<body data-current-phase="${String(project.currentPhase || '').toLowerCase()}">
  ${renderNav({ basePath })}
  <main class="container">
    <div class="project-header">
      <span class="badge status-${statusClass(project.status)}">${escapeHtml(project.status)}</span>
      <h1>${escapeHtml(project.title)}</h1>
      <div class="meta-row">
        <span>Sponsor: ${escapeHtml(project.sponsor)}</span>
        <span>Owner: ${escapeHtml(project.owner)}</span>
        <span>Business Unit: ${escapeHtml(project.businessUnit)}</span>
        <span>Started: ${escapeHtml(project.startDate)}</span>
        ${project.actualCompletionDate ? `<span>Completed: ${escapeHtml(project.actualCompletionDate)}</span>` : ''}
      </div>
    </div>

    <div class="wheel-wrap">
      ${renderWheel(project)}
    </div>
    <nav class="phase-tabs" aria-label="DMAIC phases">
      ${tabs}
    </nav>

    <div class="phase-panels">
      ${panels}
    </div>
  </main>

  <script src="${basePath}assets/js/wheel-interaction.js"></script>
</body>
</html>
`;
}
