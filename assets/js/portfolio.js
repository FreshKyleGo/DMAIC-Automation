import { renderProjectCard } from '../../templates/partials/project-card.mjs';

function projectSavings(project) {
  const actual = project.control && project.control.finalResults && project.control.finalResults.actualAnnualizedSavings;
  if (typeof actual === 'number') return actual;
  const planned = project.financialImpact && project.financialImpact.annualizedAmount;
  return typeof planned === 'number' ? planned : 0;
}

function initPortfolio() {
  const dataEl = document.getElementById('projects-data');
  const grid = document.getElementById('project-grid');
  const emptyState = document.getElementById('empty-state');
  if (!dataEl || !grid) return;

  const projects = JSON.parse(dataEl.textContent);

  const searchEl = document.getElementById('filter-search');
  const statusEl = document.getElementById('filter-status');
  const buEl = document.getElementById('filter-business-unit');
  const yearEl = document.getElementById('filter-year');
  const sortEl = document.getElementById('sort-by');

  function render() {
    const search = (searchEl.value || '').toLowerCase().trim();
    const status = statusEl.value;
    const bu = buEl.value;
    const year = yearEl.value;
    const sortBy = sortEl.value;

    let filtered = projects.filter((p) => {
      if (status && p.status !== status) return false;
      if (bu && p.businessUnit !== bu) return false;
      if (year && String(p.startDate ? new Date(p.startDate).getFullYear() : '') !== year) return false;
      if (search) {
        const haystack = `${p.title} ${p.sponsor}`.toLowerCase();
        if (!haystack.includes(search)) return false;
      }
      return true;
    });

    filtered.sort((a, b) => {
      if (sortBy === 'status') return a.status.localeCompare(b.status);
      if (sortBy === 'savings') return projectSavings(b) - projectSavings(a);
      return a.title.localeCompare(b.title);
    });

    grid.innerHTML = filtered.map(renderProjectCard).join('\n');
    emptyState.hidden = filtered.length > 0;
  }

  [searchEl, statusEl, buEl, yearEl, sortEl].forEach((el) => {
    el.addEventListener('input', render);
    el.addEventListener('change', render);
  });
}

document.addEventListener('DOMContentLoaded', initPortfolio);
