function formatEUR(amount) {
  return amount.toLocaleString('en-US', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });
}

export function renderStatsBar(stats) {
  return `<div class="stats-bar">
    <div class="stat-tile">
      <div class="value">${stats.totalProjects}</div>
      <div class="label">Total Projects</div>
    </div>
    <div class="stat-tile">
      <div class="value">${stats.completedProjects}</div>
      <div class="label">Completed</div>
    </div>
    <div class="stat-tile">
      <div class="value">${stats.inProgressProjects}</div>
      <div class="label">In Progress</div>
    </div>
    <div class="stat-tile">
      <div class="value">${formatEUR(stats.totalSavingsEUR)}</div>
      <div class="label">Total Annual Savings</div>
    </div>
    <div class="stat-tile">
      <div class="value">${stats.avgCycleTimeDays !== null ? stats.avgCycleTimeDays + ' days' : '—'}</div>
      <div class="label">Avg Cycle Time</div>
    </div>
  </div>`;
}
