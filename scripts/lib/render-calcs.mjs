export function computeValueStreamTotals(steps = []) {
  const totals = steps.reduce(
    (acc, s) => {
      acc.va += s.vaTime || 0;
      acc.envaNva += s.envaNvaTime || 0;
      acc.wait += s.waitTime || 0;
      return acc;
    },
    { va: 0, envaNva: 0, wait: 0 }
  );

  const leadTime = totals.va + totals.envaNva + totals.wait;
  const pct = (n) => (leadTime > 0 ? (n / leadTime) * 100 : 0);

  return {
    totalVaTime: totals.va,
    totalEnvaNvaTime: totals.envaNva,
    totalWaitTime: totals.wait,
    totalLeadTime: leadTime,
    vaPct: pct(totals.va),
    envaNvaPct: pct(totals.envaNva),
    waitPct: pct(totals.wait)
  };
}
