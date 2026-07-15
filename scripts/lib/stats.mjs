function daysBetween(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
}

function projectSavings(project) {
  const actual = project.control && project.control.finalResults && project.control.finalResults.actualAnnualizedSavingsUSD;
  if (typeof actual === 'number') return actual;
  const planned = project.financialImpact && project.financialImpact.annualizedAmountUSD;
  return typeof planned === 'number' ? planned : 0;
}

export function computePortfolioStats(projects) {
  const total = projects.length;
  const completed = projects.filter(p => p.status === 'Completed');
  const totalSavingsUSD = projects.reduce((sum, p) => sum + projectSavings(p), 0);

  const cycleTimes = completed
    .filter(p => p.startDate && p.actualCompletionDate)
    .map(p => daysBetween(p.startDate, p.actualCompletionDate))
    .filter(days => Number.isFinite(days) && days >= 0);

  const avgCycleTimeDays = cycleTimes.length
    ? Math.round(cycleTimes.reduce((sum, d) => sum + d, 0) / cycleTimes.length)
    : null;

  return {
    totalProjects: total,
    completedProjects: completed.length,
    inProgressProjects: projects.filter(p => p.status === 'In Progress').length,
    totalSavingsUSD,
    avgCycleTimeDays
  };
}
