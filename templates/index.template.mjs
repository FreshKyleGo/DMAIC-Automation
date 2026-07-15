import { renderHead } from './partials/head.mjs';
import { renderNav } from './partials/nav.mjs';
import { renderStatsBar } from './partials/stats-bar.mjs';
import { renderProjectCard } from './partials/project-card.mjs';

export function renderIndexPage(projects, stats, projectsIndexJson) {
  const businessUnits = [...new Set(projects.map((p) => p.businessUnit).filter(Boolean))].sort();
  const years = [...new Set(projects.map((p) => (p.startDate ? new Date(p.startDate).getFullYear() : null)).filter(Boolean))].sort();

  const cards = projects.length
    ? projects.map(renderProjectCard).join('\n')
    : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  ${renderHead({ title: 'LSS Project Portfolio', css: ['main.css'] })}
</head>
<body>
  ${renderNav()}
  <main class="container">
    <h1>Lean Six Sigma Project Portfolio</h1>
    ${renderStatsBar(stats)}

    <div class="filters">
      <input type="search" id="filter-search" placeholder="Search by title or sponsor...">
      <select id="filter-status">
        <option value="">All statuses</option>
        <option>Not Started</option>
        <option>In Progress</option>
        <option>Completed</option>
        <option>On Hold</option>
        <option>Cancelled</option>
      </select>
      <select id="filter-business-unit">
        <option value="">All business units</option>
        ${businessUnits.map((bu) => `<option>${bu}</option>`).join('\n        ')}
      </select>
      <select id="filter-year">
        <option value="">All years</option>
        ${years.map((y) => `<option>${y}</option>`).join('\n        ')}
      </select>
      <select id="sort-by">
        <option value="title">Sort: Title</option>
        <option value="status">Sort: Status</option>
        <option value="savings">Sort: Impact ($)</option>
      </select>
    </div>

    <div class="project-grid" id="project-grid">
      ${cards}
    </div>
    <p class="empty-state" id="empty-state" hidden>No projects match your filters.</p>
  </main>

  <script id="projects-data" type="application/json">${projectsIndexJson}</script>
  <script type="module" src="assets/js/portfolio.js"></script>
</body>
</html>
`;
}
