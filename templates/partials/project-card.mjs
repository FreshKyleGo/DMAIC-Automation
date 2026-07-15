import { escapeHtml } from '../../scripts/lib/html-escape.mjs';

function statusClass(status) {
  return String(status || '').toLowerCase().replace(/\s+/g, '-');
}

function formatUSD(amount) {
  if (typeof amount !== 'number') return null;
  return amount.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
}

function projectSavingsUSD(project) {
  const actual = project.control && project.control.finalResults && project.control.finalResults.actualAnnualizedSavingsUSD;
  if (typeof actual === 'number') return actual;
  const planned = project.financialImpact && project.financialImpact.annualizedAmountUSD;
  return typeof planned === 'number' ? planned : null;
}

/**
 * Renders a single project card. Shared between the server-rendered portfolio
 * page (build.js) and the client-side filter/sort re-render (portfolio.js).
 */
export function renderProjectCard(project) {
  const savings = formatUSD(projectSavingsUSD(project));
  const completedDate = project.actualCompletionDate
    ? new Date(project.actualCompletionDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
    : null;

  return `<a class="project-card" href="projects/${escapeHtml(project.slug)}/index.html"
      data-status="${escapeHtml(project.status)}" data-business-unit="${escapeHtml(project.businessUnit)}"
      data-year="${project.startDate ? new Date(project.startDate).getFullYear() : ''}">
    <span class="badge status-${statusClass(project.status)}">${escapeHtml(project.status)}</span>
    <h3>${escapeHtml(project.title)}</h3>
    <p class="meta">${escapeHtml(project.businessUnit)} &middot; Sponsor: ${escapeHtml(project.sponsor)}</p>
    <p class="meta">Phase: ${escapeHtml(project.currentPhase)}</p>
    ${completedDate ? `<p class="meta">Completed: ${completedDate}</p>` : ''}
    ${savings ? `<p class="meta">Impact: ${savings}/yr</p>` : ''}
  </a>`;
}
